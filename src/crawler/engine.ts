import mongoose from "mongoose";
import * as cheerio from "cheerio";
import { connectDB } from "@/lib/mongodb";
import { Founder, Company, CrawlSource, CrawlUrlQueue, CrawlJob } from "@/models";
import type { ICrawlUrlQueue } from "@/models/CrawlUrlQueue";
import {
  isSameDomain,
  normalizeUrl,
  shouldSkipUrl,
  isValidUrl,
  normalizeFounderName,
  normalizeCompanyName,
  generateSlug,
} from "@/lib/utils";
import { detectFoundersOnPage, DetectedFounder, PageExtraction } from "./detector";
import {
  URL_PRIORITY_KEYWORDS,
  URL_DEPRIORITIZE_PATTERNS,
  PAGE_CONTENT_KEYWORDS,
} from "./africa-config";

const REQUEST_TIMEOUT_MS = 20000;
const RETRY_LIMIT = 3;
const MIN_HOST_GAP_MS = 1200;
const MAX_RESPONSE_SIZE = 5 * 1024 * 1024;
const MAX_QUEUE_ATTEMPTS = 5;
const STALE_CRAWLING_MS = 15 * 60 * 1000;
const USER_AGENT = "AfricanFoundersBot/1.0 (+https://africanfounders.com/bot)";

interface RobotsRule {
  disallowed: string[];
  crawlDelay: number;
  fetchedAt: number;
}

const robotsCache = new Map<string, RobotsRule>();
const lastHostFetch = new Map<string, number>();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function scoreUrl(url: string, pageText: string = ""): { score: number; reason: string } {
  let score = 0;
  let reason = "default";

  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.toLowerCase().replace(/\/+$/, "");

    for (const [keyword, points] of Object.entries(URL_PRIORITY_KEYWORDS)) {
      if (path.includes(keyword)) {
        score += points;
        reason = `url:${keyword}`;
      }
    }

    for (const pattern of URL_DEPRIORITIZE_PATTERNS) {
      if (path.includes(pattern)) {
        score -= 50;
        reason = `deprioritized:${pattern}`;
      }
    }

    const segments = path.split("/").filter(Boolean);
    if (segments.length <= 2) score += 5;
    if (segments.length === 1) score += 3;
  } catch {
    score = 0;
  }

  if (pageText) {
    const lowerText = pageText.toLowerCase();
    for (const [keyword, points] of Object.entries(PAGE_CONTENT_KEYWORDS)) {
      if (lowerText.includes(keyword)) {
        score += points;
        if (reason === "default") reason = `content:${keyword}`;
      }
    }
  }

  return { score: Math.max(0, score), reason };
}

export async function enqueueUrl(params: {
  url: string;
  sourceId: mongoose.Types.ObjectId;
  depth: number;
  priority: number;
  reason: string;
}): Promise<void> {
  try {
    await CrawlUrlQueue.updateOne(
      { url: params.url },
      {
        $max: { priority: params.priority },
        $setOnInsert: {
          sourceId: params.sourceId,
          depth: params.depth,
          status: "queued",
          attempts: 0,
          reason: params.reason,
          nextAttemptAt: new Date(),
          discoveredAt: new Date(),
        },
      },
      { upsert: true }
    );
  } catch (error) {
    const code = (error as { code?: number })?.code;
    if (code !== 11000) throw error;
  }
}

export async function claimNextUrl(): Promise<ICrawlUrlQueue | null> {
  await connectDB();
  const now = new Date();
  try {
    return await CrawlUrlQueue.findOneAndUpdate(
      { status: "queued", nextAttemptAt: { $lte: now } },
      { $set: { status: "crawling", lastAttemptAt: now }, $inc: { attempts: 1 } },
      { sort: { priority: -1, discoveredAt: 1 }, new: true }
    );
  } catch {
    return null;
  }
}

async function completeUrl(id: mongoose.Types.ObjectId, sourceId: mongoose.Types.ObjectId): Promise<void> {
  await CrawlUrlQueue.updateOne(
    { _id: id },
    { $set: { status: "completed", completedAt: new Date(), errorMessage: "" } }
  );
  await CrawlSource.updateOne(
    { _id: sourceId },
    { $set: { lastActivityAt: new Date() }, $inc: { pagesCrawled: 1 } }
  );
}

async function failUrl(
  id: mongoose.Types.ObjectId,
  attempts: number,
  message: string
): Promise<void> {
  if (attempts >= MAX_QUEUE_ATTEMPTS) {
    await CrawlUrlQueue.updateOne(
      { _id: id },
      { $set: { status: "failed", errorMessage: message, completedAt: new Date() } }
    );
    return;
  }
  const backoffMs = Math.min(Math.pow(2, attempts) * 30000, 30 * 60 * 1000);
  await CrawlUrlQueue.updateOne(
    { _id: id },
    {
      $set: {
        status: "queued",
        errorMessage: message,
        nextAttemptAt: new Date(Date.now() + backoffMs),
      },
    }
  );
}

export async function recoverStaleUrls(): Promise<void> {
  const cutoff = new Date(Date.now() - STALE_CRAWLING_MS);
  await CrawlUrlQueue.updateMany(
    { status: "crawling", lastAttemptAt: { $lt: cutoff } },
    { $set: { status: "queued", nextAttemptAt: new Date() } }
  );
}

async function addRejection(sourceId: mongoose.Types.ObjectId, reason: string): Promise<void> {
  const res = await CrawlSource.updateOne(
    { _id: sourceId, "rejectionCounts.reason": { $ne: reason } },
    { $push: { rejectionCounts: { reason, count: 1 } } }
  );
  if (res.modifiedCount === 0) {
    await CrawlSource.updateOne(
      { _id: sourceId, "rejectionCounts.reason": reason },
      { $inc: { "rejectionCounts.$.count": 1 } }
    );
  }
}

async function fetchPage(url: string): Promise<string | null> {
  for (let attempt = 0; attempt < RETRY_LIMIT; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const response = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timeout);

      if (!response.ok) return null;

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) return null;

      const contentLength = response.headers.get("content-length");
      if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) return null;

      const html = await response.text();
      if (html.length > MAX_RESPONSE_SIZE) return null;
      return html;
    } catch {
      if (attempt === RETRY_LIMIT - 1) return null;
      await sleep(1000 * (attempt + 1));
    }
  }
  return null;
}

async function checkRobots(baseUrl: string): Promise<RobotsRule> {
  let host = "";
  try {
    host = new URL(baseUrl).hostname;
  } catch {
    return { disallowed: [], crawlDelay: 1, fetchedAt: Date.now() };
  }

  const cached = robotsCache.get(host);
  if (cached && Date.now() - cached.fetchedAt < 60 * 60 * 1000) return cached;

  const rule: RobotsRule = { disallowed: [], crawlDelay: 1, fetchedAt: Date.now() };
  try {
    const urlObj = new URL(baseUrl);
    const html = await fetchPage(`${urlObj.origin}/robots.txt`);
    if (html) {
      let match = false;
      for (const line of html.split("\n")) {
        const trimmed = line.trim();
        if (/^user-agent:/i.test(trimmed)) {
          const agent = trimmed.split(":")[1].trim();
          match = agent === "*" || agent.toLowerCase().includes("bot");
        } else if (match && /^disallow:/i.test(trimmed)) {
          const path = trimmed.split(/:/i).slice(1).join(":").trim();
          if (path) rule.disallowed.push(path);
        } else if (match && /^crawl-delay:/i.test(trimmed)) {
          rule.crawlDelay = parseFloat(trimmed.split(":")[1].trim()) || 1;
        }
      }
    }
  } catch {}
  robotsCache.set(host, rule);
  return rule;
}

function isAllowedByRobots(url: string, disallowed: string[]): boolean {
  try {
    const path = new URL(url).pathname;
    return !disallowed.some((p) => path.startsWith(p));
  } catch {
    return true;
  }
}

async function respectHostGap(url: string): Promise<void> {
  try {
    const host = new URL(url).hostname;
    const last = lastHostFetch.get(host) || 0;
    const wait = last + MIN_HOST_GAP_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastHostFetch.set(host, Date.now());
  } catch {}
}

function extractLinks($: cheerio.CheerioAPI, pageUrl: string, baseUrl: string): string[] {
  const links: string[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const normalized = normalizeUrl(href, pageUrl);
    if (!isValidUrl(normalized)) return;
    if (!isSameDomain(normalized, baseUrl)) return;
    if (shouldSkipUrl(normalized)) return;
    links.push(normalized);
  });
  return [...new Set(links)];
}

function extractFounderProfileLinks(
  $: cheerio.CheerioAPI,
  pageUrl: string,
  baseUrl: string,
  founderNames: string[]
): string[] {
  const links: string[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const normalized = normalizeUrl(href, pageUrl);
    if (!isValidUrl(normalized) || !isSameDomain(normalized, baseUrl)) return;

    const linkText = ($(el).text() || "").toLowerCase();
    let linkPath = "";
    try {
      linkPath = new URL(normalized).pathname.toLowerCase();
    } catch {
      return;
    }

    for (const name of founderNames) {
      const nameLower = name.toLowerCase();
      const nameSlug = nameLower.replace(/\s+/g, "-");
      const nameCompact = nameLower.replace(/\s+/g, "");
      if (
        linkPath.includes(`/team/${nameSlug}`) ||
        linkPath.includes(`/people/${nameSlug}`) ||
        linkPath.includes(`/founders/${nameSlug}`) ||
        linkPath.includes(nameSlug) ||
        linkPath.includes(nameCompact) ||
        linkText === nameLower
      ) {
        links.push(normalized);
      }
    }
  });
  return [...new Set(links)];
}

async function findCompanyWebsiteLink(
  $: cheerio.CheerioAPI,
  companyName: string,
  pageUrl: string
): Promise<string> {
  const pageHost = new URL(pageUrl).hostname.replace(/^www\./, "");
  const compact = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
  let found = "";

  $("a[href]").each((_, el) => {
    if (found) return;
    const href = $(el).attr("href") || "";
    if (!/^https?:\/\//i.test(href)) return;
    const lower = href.toLowerCase();
    if (
      lower.includes("linkedin.com") ||
      lower.includes("twitter.com") ||
      lower.includes("x.com") ||
      lower.includes("facebook.com") ||
      lower.includes("instagram.com") ||
      lower.includes("youtube.com")
    ) {
      return;
    }
    try {
      const host = new URL(href).hostname.replace(/^www\./, "");
      if (host === pageHost) return;
      const anchor = ($(el).text() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const hrefCompact = host.split(".")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
      if (anchor === compact || hrefCompact === compact || host.replace(/[^a-z0-9]/g, "").includes(compact)) {
        found = href;
      }
    } catch {}
  });

  return found;
}

async function saveFounderToDb(
  detected: DetectedFounder,
  companyHiring: { hiring: boolean | null; evidence: string }
): Promise<{ isNew: boolean; founderId: mongoose.Types.ObjectId }> {
  await connectDB();
  const normalizedName = normalizeFounderName(detected.name);
  const slug = generateSlug(detected.name);
  const xHandle = detected.xUrl
    ? (detected.xUrl.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/) || [])[1] || ""
    : "";
  const bio = (detected.bio || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

  const identifierOr: Record<string, string>[] = [];
  if (xHandle) identifierOr.push({ xHandle });
  if (detected.xUrl) identifierOr.push({ xUrl: detected.xUrl });
  if (detected.linkedinUrl) identifierOr.push({ linkedinUrl: detected.linkedinUrl });
  if (detected.personalWebsiteUrl) identifierOr.push({ personalWebsiteUrl: detected.personalWebsiteUrl });
  if (detected.email) identifierOr.push({ email: detected.email });

  let existing = identifierOr.length
    ? await Founder.findOne({ $or: identifierOr })
    : null;
  if (!existing) existing = await Founder.findOne({ normalizedName });

  if (existing) {
    let updated = false;
    if (!existing.linkedinUrl && detected.linkedinUrl) {
      existing.linkedinUrl = detected.linkedinUrl;
      updated = true;
    }
    if (!existing.xUrl && detected.xUrl) {
      existing.xUrl = detected.xUrl;
      updated = true;
    }
    if (!existing.xHandle && xHandle) {
      existing.xHandle = xHandle;
      updated = true;
    }
    if (!existing.personalWebsiteUrl && detected.personalWebsiteUrl) {
      existing.personalWebsiteUrl = detected.personalWebsiteUrl;
      updated = true;
    }
    if (!existing.email && detected.email) {
      existing.email = detected.email;
      updated = true;
    }
    if (!existing.companyWebsiteUrl && detected.companyWebsiteUrl) {
      existing.companyWebsiteUrl = detected.companyWebsiteUrl;
      updated = true;
    }
    if (!existing.bio && bio) {
      existing.bio = bio;
      updated = true;
    }
    if (!existing.sourceSentence && detected.sourceSentence) {
      existing.sourceSentence = detected.sourceSentence;
      updated = true;
    }
    if (!existing.location && detected.location) {
      existing.location = detected.location;
      updated = true;
    }
    if (!existing.country && detected.country) {
      existing.country = detected.country;
      updated = true;
    }
    if (!existing.industry && detected.industry) {
      existing.industry = detected.industry;
      updated = true;
    }
    if (!existing.oneLiner && detected.oneLiner) {
      existing.oneLiner = detected.oneLiner;
      updated = true;
    }
    if (detected.teamSize > 0 && existing.teamSize === 0) {
      existing.teamSize = detected.teamSize;
      updated = true;
    }
    if (companyHiring.hiring === true && existing.isHiring !== true) {
      existing.isHiring = true;
      updated = true;
    } else if (
      companyHiring.hiring === false &&
      (existing.isHiring === null || existing.isHiring === undefined)
    ) {
      existing.isHiring = false;
      updated = true;
    }
    if (detected.foundedYear > 0 && existing.foundedYear === 0) {
      existing.foundedYear = detected.foundedYear;
      updated = true;
    }
    if (detected.role && !existing.role) {
      existing.role = detected.role;
      updated = true;
    }
    existing.lastVerifiedAt = new Date();
    if (updated) await existing.save();
    return { isNew: false, founderId: existing._id as mongoose.Types.ObjectId };
  }

  const newFounder = new Founder({
    name: detected.name,
    normalizedName,
    slug,
    role: detected.role,
    bio,
    location: detected.location,
    country: detected.country || "",
    industry: detected.industry,
    profileImageUrl: "",
    avatarUrl: "",
    xUrl: detected.xUrl,
    xHandle,
    linkedinUrl: detected.linkedinUrl,
    personalWebsiteUrl: detected.personalWebsiteUrl,
    email: detected.email || "",
    companyWebsiteUrl: detected.companyWebsiteUrl,
    companies: [],
    oneLiner: detected.oneLiner,
    sourceSentence: detected.sourceSentence || "",
    teamSize: detected.teamSize,
    isHiring: companyHiring.hiring,
    foundedYear: detected.foundedYear,
    discoveredAt: new Date(),
    lastVerifiedAt: new Date(),
  });
  await newFounder.save();
  return { isNew: true, founderId: newFounder._id as mongoose.Types.ObjectId };
}

async function linkFounderToCompany(
  founderId: mongoose.Types.ObjectId,
  companyId: mongoose.Types.ObjectId
): Promise<"created" | "duplicate"> {
  const founder = await Founder.findById(founderId);
  if (!founder) return "duplicate";
  if (founder.companies.some((c) => String(c) === String(companyId))) return "duplicate";

  founder.companies.push(companyId);
  await founder.save();

  const company = await Company.findById(companyId);
  if (company && !company.founders.some((f) => String(f) === String(founderId))) {
    company.founders.push(founderId);
    await company.save();
  }
  return "created";
}

async function saveCompanyForFounder(
  companyName: string,
  founderId: mongoose.Types.ObjectId,
  detected: DetectedFounder,
  sourceId: mongoose.Types.ObjectId,
  websiteUrl: string,
  companyHiring: { hiring: boolean | null; evidence: string }
): Promise<{ isNew: boolean; linked: "created" | "duplicate" }> {
  await connectDB();
  const normalizedName = normalizeCompanyName(companyName);
  const slug = generateSlug(companyName);

  let company = await Company.findOne({ normalizedName });
  let isNew = false;

  if (!company) {
    company = new Company({
      name: companyName,
      normalizedName,
      slug,
      founders: [],
      country: detected.country || "",
      industry: detected.industry || "",
      location: detected.location || "",
      foundedYear: detected.foundedYear || 0,
      isHiring: companyHiring.hiring,
      hiringEvidence: companyHiring.evidence || "",
      websiteUrl: websiteUrl || "",
    });
    await company.save();
    isNew = true;
    await CrawlSource.updateOne({ _id: sourceId }, { $inc: { companiesDiscovered: 1 } });
  } else {
    let updated = false;
    if (!company.foundedYear && detected.foundedYear) {
      company.foundedYear = detected.foundedYear;
      updated = true;
    }
    if (companyHiring.hiring === true && company.isHiring !== true) {
      company.isHiring = true;
      company.hiringEvidence = companyHiring.evidence || company.hiringEvidence || "";
      updated = true;
    } else if (
      companyHiring.hiring === false &&
      (company.isHiring === null || company.isHiring === undefined)
    ) {
      company.isHiring = false;
      company.hiringEvidence = companyHiring.evidence || "";
      updated = true;
    }
    if (!company.industry && detected.industry) {
      company.industry = detected.industry;
      updated = true;
    }
    if (!company.location && detected.location) {
      company.location = detected.location;
      updated = true;
    }
    if (!company.country && detected.country) {
      company.country = detected.country;
      updated = true;
    }
    if (!company.websiteUrl && websiteUrl) {
      company.websiteUrl = websiteUrl;
      updated = true;
    }
    if (updated) await company.save();
  }

  const linked = await linkFounderToCompany(founderId, company._id as mongoose.Types.ObjectId);
  return { isNew, linked };
}

function namesLooselyMatch(a: string, b: string): boolean {
  const na = normalizeCompanyName(a);
  const nb = normalizeCompanyName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (Math.min(na.length, nb.length) < 5) return false;
  return na.includes(nb) || nb.includes(na);
}

function resolveCompanyHiring(
  extraction: PageExtraction,
  companyName: string
): { hiring: boolean | null; evidence: string } {
  if (extraction.hiring === null || !extraction.hiringCompanyHint) {
    return { hiring: null, evidence: "" };
  }
  if (!namesLooselyMatch(extraction.hiringCompanyHint, companyName)) {
    return { hiring: null, evidence: "" };
  }
  return { hiring: extraction.hiring, evidence: extraction.hiringEvidence };
}

async function getCycleBudget(sourceId: mongoose.Types.ObjectId, maxPages: number, cycleStart: Date): Promise<number> {
  const [completed, pending] = await Promise.all([
    CrawlUrlQueue.countDocuments({ sourceId, status: "completed", completedAt: { $gte: cycleStart } }),
    CrawlUrlQueue.countDocuments({ sourceId, status: { $in: ["queued", "crawling"] } }),
  ]);
  return Math.max(0, maxPages - completed - pending);
}

export async function processQueueEntry(entry: ICrawlUrlQueue): Promise<void> {
  await connectDB();
  const source = await CrawlSource.findById(entry.sourceId);
  if (!source) {
    await failUrl(entry._id as mongoose.Types.ObjectId, entry.attempts, "Source missing");
    return;
  }

  const entryId = entry._id as mongoose.Types.ObjectId;
  const maxDepth = source.maxDepth || 8;

  try {
    const baseHost = new URL(source.baseUrl).hostname;
    const urlHost = new URL(entry.url).hostname;
    if (baseHost !== urlHost) {
      await failUrl(entryId, entry.attempts, "Off-source host");
      return;
    }

    const robots = await checkRobots(source.baseUrl);
    if (!isAllowedByRobots(entry.url, robots.disallowed)) {
      await completeUrl(entryId, source._id as mongoose.Types.ObjectId);
      return;
    }

    await respectHostGap(entry.url);
    const html = await fetchPage(entry.url);
    if (!html) {
      await failUrl(entryId, entry.attempts, "Fetch failed");
      return;
    }

    const $ = cheerio.load(html);
    const bodyText = $("body").text() || "";
    const extraction: PageExtraction = detectFoundersOnPage($, html, entry.url, {
      sourceName: source.name,
    });

    await CrawlSource.updateOne(
      { _id: source._id },
      { $set: { lastActivityAt: new Date() } }
    );

    for (const reason of extraction.rejectionLog) {
      await addRejection(source._id as mongoose.Types.ObjectId, reason);
    }

    const founderNames: string[] = [];

    for (const detected of extraction.founders) {
      founderNames.push(detected.name);
      await CrawlSource.updateOne(
        { _id: source._id },
        { $inc: { founderCandidates: 1 } }
      );

      if (detected.country) {
        // country recorded via founder save; nothing else needed here
      }

      const companyHiring = detected.company
        ? resolveCompanyHiring(extraction, detected.company)
        : { hiring: null, evidence: "" };

      const founderResult = await saveFounderToDb(detected, companyHiring);
      if (founderResult.isNew) {
        await CrawlSource.updateOne(
          { _id: source._id },
          { $inc: { foundersDiscovered: 1 } }
        );
      }

      if (!detected.company) {
        await CrawlSource.updateOne(
          { _id: source._id },
          { $inc: { relationshipsRejected: 1 } }
        );
        continue;
      }

      let websiteUrl = "";
      if (extraction.primaryCompany) {
        websiteUrl = await findCompanyWebsiteLink($, detected.company, entry.url);
      }

      const companyResult = await saveCompanyForFounder(
        detected.company,
        founderResult.founderId,
        detected,
        source._id as mongoose.Types.ObjectId,
        websiteUrl,
        companyHiring
      );

      if (companyResult.linked === "created") {
        await CrawlSource.updateOne(
          { _id: source._id },
          { $inc: { relationshipsCreated: 1 } }
        );
      } else {
        await CrawlSource.updateOne(
          { _id: source._id },
          { $inc: { relationshipsRejected: 1 } }
        );
        await addRejection(source._id as mongoose.Types.ObjectId, "Duplicate founder/company relationship");
      }
    }

    const cycleStart = source.crawlCycleStartedAt || new Date(0);
    const budget = await getCycleBudget(
      source._id as mongoose.Types.ObjectId,
      source.maxPages || 1000,
      cycleStart
    );

    if (entry.depth < maxDepth && budget > 0) {
      let linkBudget = budget;

      if (founderNames.length > 0 && linkBudget > 0) {
        const profileLinks = extractFounderProfileLinks($, entry.url, source.baseUrl, founderNames);
        for (const link of profileLinks) {
          if (linkBudget <= 0) break;
          const { score } = scoreUrl(link);
          await enqueueUrl({
            url: link,
            sourceId: source._id as mongoose.Types.ObjectId,
            depth: entry.depth + 1,
            priority: score + 40,
            reason: "founder profile link",
          });
          linkBudget--;
        }
      }

      const links = extractLinks($, entry.url, source.baseUrl);
      const scored = links
        .map((link) => ({ link, ...scoreUrl(link, bodyText) }))
        .filter((x) => x.score > 0 || x.reason === "default")
        .sort((a, b) => b.score - a.score);

      for (const { link, score, reason } of scored) {
        if (linkBudget <= 0) break;
        await enqueueUrl({
          url: link,
          sourceId: source._id as mongoose.Types.ObjectId,
          depth: entry.depth + 1,
          priority: score,
          reason,
        });
        linkBudget--;
      }
    }

    await completeUrl(entryId, source._id as mongoose.Types.ObjectId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await failUrl(entryId, entry.attempts, message);
    await CrawlSource.updateOne(
      { _id: source._id },
      {
        $inc: { errorCount: 1 },
        $push: { crawlErrors: `Error on ${entry.url}: ${message}` },
      }
    );
  }
}

export async function kickSources(opts?: {
  sourceId?: string;
  force?: boolean;
}): Promise<{ enqueued: number }> {
  await connectDB();

  const query: Record<string, unknown> = { enabled: true };
  if (opts?.sourceId) {
    query._id = opts.sourceId;
  } else if (!opts?.force) {
    query.$or = [
      { nextCrawlAt: { $lte: new Date() } },
      { nextCrawlAt: null },
      { nextCrawlAt: { $exists: false } },
    ];
  }

  const sources = await CrawlSource.find(query);
  let enqueued = 0;

  for (const source of sources) {
    const pending = await CrawlUrlQueue.countDocuments({
      sourceId: source._id,
      status: { $in: ["queued", "crawling"] },
    });
    const activeCycle = source.crawlStatus === "crawling" && pending > 0;

    if (activeCycle && !opts?.force) continue;
    if (activeCycle && opts?.force && pending > 0) {
      enqueued++;
      continue;
    }

    if (!source.crawlCycleStartedAt || source.crawlStatus !== "crawling") {
      source.crawlCycleStartedAt = new Date();
      source.crawlStatus = "crawling";
      source.lastActivityAt = new Date();
      await source.save();

      await CrawlUrlQueue.updateMany(
        { sourceId: source._id, status: { $in: ["completed", "failed"] } },
        {
          $set: {
            status: "queued",
            attempts: 0,
            nextAttemptAt: new Date(),
            errorMessage: "",
            completedAt: null,
          },
        }
      );
    }

    const { score, reason } = scoreUrl(source.baseUrl);
    await enqueueUrl({
      url: normalizeUrl(source.baseUrl, source.baseUrl),
      sourceId: source._id as mongoose.Types.ObjectId,
      depth: 0,
      priority: score + 100,
      reason: `source homepage (${reason})`,
    });
    enqueued++;
  }

  return { enqueued };
}

export async function finishCompletedCycles(): Promise<number> {
  await connectDB();
  const sources = await CrawlSource.find({ crawlStatus: "crawling" });
  let finished = 0;

  for (const source of sources) {
    const pending = await CrawlUrlQueue.countDocuments({
      sourceId: source._id,
      status: { $in: ["queued", "crawling"] },
    });
    if (pending > 0) continue;

    const now = new Date();
    source.crawlStatus = "idle";
    source.lastCrawledAt = now;
    source.nextCrawlAt = now;
    source.lastActivityAt = now;
    await source.save();

    const cycleStart = source.crawlCycleStartedAt || now;
    const pagesInCycle = await CrawlUrlQueue.countDocuments({
      sourceId: source._id,
      status: "completed",
      completedAt: { $gte: cycleStart },
    });

    await CrawlJob.create({
      sourceId: source._id,
      status: "completed",
      startedAt: cycleStart,
      completedAt: now,
      pagesCrawled: pagesInCycle,
      foundersFound: source.founderCandidates,
      newFounders: source.foundersDiscovered,
      companiesDiscovered: source.companiesDiscovered,
      relationshipsCreated: source.relationshipsCreated,
      relationshipsRejected: source.relationshipsRejected,
      rejectionReasons: source.rejectionCounts,
      crawlErrors: source.crawlErrors.slice(-20),
    });

    finished++;
  }

  return finished;
}

export async function getQueueStats(): Promise<{
  queued: number;
  crawling: number;
  completed: number;
  failed: number;
}> {
  await connectDB();
  const [queued, crawling, completed, failed] = await Promise.all([
    CrawlUrlQueue.countDocuments({ status: "queued" }),
    CrawlUrlQueue.countDocuments({ status: "crawling" }),
    CrawlUrlQueue.countDocuments({ status: "completed" }),
    CrawlUrlQueue.countDocuments({ status: "failed" }),
  ]);
  return { queued, crawling, completed, failed };
}

export async function runCrawler(sourceId?: string): Promise<{ enqueued: number }> {
  return kickSources({ sourceId, force: true });
}

export async function runFullCrawl(opts?: {
  maxPages?: number;
  maxDepth?: number;
}): Promise<{ enqueued: number; queue: Awaited<ReturnType<typeof getQueueStats>> }> {
  await connectDB();

  if (opts?.maxPages || opts?.maxDepth) {
    const update: Record<string, number> = {};
    if (opts.maxPages) update.maxPages = opts.maxPages;
    if (opts.maxDepth) update.maxDepth = opts.maxDepth;
    await CrawlSource.updateMany({ enabled: true }, update);
  }

  const { enqueued } = await kickSources({ force: true });
  const queue = await getQueueStats();
  return { enqueued, queue };
}

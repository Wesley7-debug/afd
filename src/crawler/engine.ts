import mongoose from "mongoose";
import * as cheerio from "cheerio";
import { connectDB } from "@/lib/mongodb";
import { Founder, Company, CrawlSource, CrawlJob } from "@/models";
import {
  isSameDomain,
  normalizeUrl,
  shouldSkipUrl,
  isValidUrl,
  normalizeFounderName,
  normalizeCompanyName,
  generateSlug,
} from "@/lib/utils";
import { detectFoundersOnPage, DetectedFounder } from "./detector";
import {
  URL_PRIORITY_KEYWORDS,
  URL_DEPRIORITIZE_PATTERNS,
  PAGE_CONTENT_KEYWORDS,
  detectCountry,
} from "./africa-config";

interface CrawlerConfig {
  maxDepth: number;
  maxPages: number;
  requestTimeout: number;
  retryLimit: number;
  delayBetweenRequests: number;
  maxResponseSize: number;
}

const DEFAULT_CONFIG: CrawlerConfig = {
  maxDepth: 8,
  maxPages: 1000,
  requestTimeout: 20000,
  retryLimit: 3,
  delayBetweenRequests: 1500,
  maxResponseSize: 5 * 1024 * 1024,
};

interface CrawlQueueEntry {
  url: string;
  depth: number;
  priority: number;
  reason: string;
}

interface CrawlState {
  visited: Set<string>;
  queue: CrawlQueueEntry[];
  pagesCrawled: number;
  pagesSkipped: number;
  foundersFound: number;
  newFounders: number;
  updatedFounders: number;
  duplicatesFound: number;
  fundingPagesFound: number;
  hiringPagesFound: number;
  founderProfilesFound: number;
  companiesDiscovered: number;
  countriesDiscovered: Set<string>;
  errors: string[];
}

function scoreUrl(url: string, pageText: string = ""): { score: number; reason: string } {
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

function insertByPriority(queue: CrawlQueueEntry[], entry: CrawlQueueEntry): void {
  let low = 0;
  let high = queue.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (queue[mid].priority >= entry.priority) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  queue.splice(low, 0, entry);
}

async function fetchPage(
  url: string,
  config: CrawlerConfig
): Promise<{ html: string; contentType: string } | null> {
  for (let attempt = 0; attempt < config.retryLimit; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.requestTimeout);

      const response = await fetch(url, {
        headers: {
          "User-Agent": "AfricanFoundersBot/1.0 (+https://africanfounders.com/bot)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        signal: controller.signal,
        redirect: "follow",
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return null;
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
        return null;
      }

      const contentLength = response.headers.get("content-length");
      if (contentLength && parseInt(contentLength) > config.maxResponseSize) {
        return null;
      }

      const html = await response.text();
      if (html.length > config.maxResponseSize) {
        return null;
      }

      return { html, contentType };
    } catch {
      if (attempt === config.retryLimit - 1) {
        return null;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, config.delayBetweenRequests * (attempt + 1))
      );
    }
  }
  return null;
}

async function checkRobotsTxt(
  baseUrl: string,
  config: CrawlerConfig
): Promise<{ disallowed: string[]; crawlDelay: number }> {
  try {
    const urlObj = new URL(baseUrl);
    const robotsUrl = `${urlObj.origin}/robots.txt`;
    const result = await fetchPage(robotsUrl, { ...config, maxPages: 1 });

    if (!result) {
      return { disallowed: [], crawlDelay: 1 };
    }

    const lines = result.html.split("\n");
    const disallowed: string[] = [];
    let crawlDelay = 1;
    let userAgentMatch = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("User-agent:") || trimmed.startsWith("User-Agent:")) {
        const agent = trimmed.split(":")[1].trim();
        userAgentMatch = agent === "*" || agent.toLowerCase().includes("bot");
      }
      if (userAgentMatch) {
        if (trimmed.startsWith("Disallow:")) {
          const path = trimmed.split(":")[1].trim();
          if (path) disallowed.push(path);
        }
        if (trimmed.startsWith("Crawl-delay:")) {
          crawlDelay = parseFloat(trimmed.split(":")[1].trim()) || 1;
        }
      }
    }

    return { disallowed, crawlDelay: Math.max(crawlDelay, 1) };
  } catch {
    return { disallowed: [], crawlDelay: 1 };
  }
}

function isAllowedByRobots(url: string, disallowed: string[]): boolean {
  try {
    const urlObj = new URL(url);
    return !disallowed.some((path) => urlObj.pathname.startsWith(path));
  } catch {
    return true;
  }
}

function extractLinks(
  $: cheerio.CheerioAPI,
  pageUrl: string,
  baseUrl: string
): string[] {
  const links: string[] = [];
  const urlObj = new URL(baseUrl);

  $('a[href]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const normalized = normalizeUrl(href, pageUrl);

    if (!isValidUrl(normalized)) return;
    if (!isSameDomain(normalized, baseUrl)) return;
    if (shouldSkipUrl(normalized)) return;

    try {
      const linkUrl = new URL(normalized);
      if (linkUrl.hostname !== urlObj.hostname) return;
    } catch {
      return;
    }

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

    const linkText = $(el).text().toLowerCase();
    const linkPath = new URL(normalized).pathname.toLowerCase();

    for (const name of founderNames) {
      const nameLower = name.toLowerCase();
      const nameSlug = nameLower.replace(/\s+/g, "-");

      if (
        linkPath.includes(nameSlug) ||
        linkPath.includes(nameLower.replace(/\s+/g, "")) ||
        linkText.includes(nameLower)
      ) {
        links.push(normalized);
      }
    }
  });

  return [...new Set(links)];
}

async function saveFounderToDb(
  detected: DetectedFounder
): Promise<{ isNew: boolean; isDuplicate: boolean; founderId?: mongoose.Types.ObjectId }> {
  await connectDB();

  const normalizedName = normalizeFounderName(detected.name);
  const slug = generateSlug(detected.name);
  const xHandle = detected.xUrl
    ? (detected.xUrl.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/) || [])[1] || ""
    : "";

  const existingFounder = await Founder.findOne({
    $or: [
      { normalizedName },
      ...(detected.xUrl ? [{ xUrl: detected.xUrl }] : []),
      ...(detected.linkedinUrl ? [{ linkedinUrl: detected.linkedinUrl }] : []),
    ],
  });

  if (existingFounder) {
    let updated = false;

    if (!existingFounder.linkedinUrl && detected.linkedinUrl) {
      existingFounder.linkedinUrl = detected.linkedinUrl;
      updated = true;
    }
    if (!existingFounder.xUrl && detected.xUrl) {
      existingFounder.xUrl = detected.xUrl;
      updated = true;
    }
    if (!existingFounder.xHandle && xHandle) {
      existingFounder.xHandle = xHandle;
      updated = true;
    }
    if (!existingFounder.personalWebsiteUrl && detected.personalWebsiteUrl) {
      existingFounder.personalWebsiteUrl = detected.personalWebsiteUrl;
      updated = true;
    }
    if (!existingFounder.companyXUrl && detected.companyXUrl) {
      existingFounder.companyXUrl = detected.companyXUrl;
      updated = true;
    }
    if (!existingFounder.companyLinkedinUrl && detected.companyLinkedinUrl) {
      existingFounder.companyLinkedinUrl = detected.companyLinkedinUrl;
      updated = true;
    }
    if (!existingFounder.companyWebsiteUrl && detected.companyWebsiteUrl) {
      existingFounder.companyWebsiteUrl = detected.companyWebsiteUrl;
      updated = true;
    }
    if (!existingFounder.bio && detected.bio) {
      existingFounder.bio = detected.bio.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
      updated = true;
    }
    if (!existingFounder.location && detected.location) {
      existingFounder.location = detected.location;
      updated = true;
    }
    if (detected.country && (!existingFounder.country || existingFounder.country === "Nigeria" && detected.country !== "Nigeria")) {
      existingFounder.country = detected.country;
      updated = true;
    }
    if (!existingFounder.industry && detected.industry) {
      existingFounder.industry = detected.industry;
      updated = true;
    }
    if (!existingFounder.oneLiner && detected.oneLiner) {
      existingFounder.oneLiner = detected.oneLiner;
      updated = true;
    }
    if (detected.teamSize > 0 && existingFounder.teamSize === 0) {
      existingFounder.teamSize = detected.teamSize;
      updated = true;
    }
    if (detected.isHiring && !existingFounder.isHiring) {
      existingFounder.isHiring = true;
      updated = true;
    }
    if (detected.foundedYear > 0 && existingFounder.foundedYear === 0) {
      existingFounder.foundedYear = detected.foundedYear;
      updated = true;
    }
    if (detected.role && !existingFounder.role) {
      existingFounder.role = detected.role;
      updated = true;
    }

    existingFounder.lastVerifiedAt = new Date();
    if (updated) await existingFounder.save();

    return { isNew: false, isDuplicate: true, founderId: existingFounder._id as mongoose.Types.ObjectId };
  }

  const newFounder = new Founder({
    name: detected.name,
    normalizedName,
    slug,
    role: detected.role,
    bio: detected.bio.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim(),
    location: detected.location,
    country: detected.country || "",
    industry: detected.industry,
    profileImageUrl: "",
    avatarUrl: "",
    xUrl: detected.xUrl,
    xHandle,
    linkedinUrl: detected.linkedinUrl,
    personalWebsiteUrl: detected.personalWebsiteUrl,
    companyXUrl: detected.companyXUrl,
    companyLinkedinUrl: detected.companyLinkedinUrl,
    companyWebsiteUrl: detected.companyWebsiteUrl,
    companies: [],
    oneLiner: detected.oneLiner,
    teamSize: detected.teamSize,
    isHiring: detected.isHiring,
    foundedYear: detected.foundedYear,
    discoveredAt: new Date(),
    lastVerifiedAt: new Date(),
  });

  await newFounder.save();
  return { isNew: true, isDuplicate: false, founderId: newFounder._id as mongoose.Types.ObjectId };
}

async function saveCompanyToDb(
  companyName: string,
  founderId: mongoose.Types.ObjectId,
  detected?: DetectedFounder
): Promise<{ isNew: boolean; isDuplicate: boolean; companyId?: mongoose.Types.ObjectId }> {
  await connectDB();

  const normalizedName = normalizeCompanyName(companyName);
  const slug = generateSlug(companyName);

  const existingCompany = await Company.findOne({ normalizedName });

  if (existingCompany) {
    if (!existingCompany.founders.includes(founderId)) {
      existingCompany.founders.push(founderId);
      if (detected?.isHiring && !existingCompany.isHiring) existingCompany.isHiring = true;
      if (detected?.foundedYear && !existingCompany.foundedYear) existingCompany.foundedYear = detected.foundedYear;
      if (detected?.industry && !existingCompany.industry) existingCompany.industry = detected.industry;
      if (detected?.location && !existingCompany.location) existingCompany.location = detected.location;
      if (detected?.country && (!existingCompany.country || existingCompany.country === "Nigeria" && detected.country !== "Nigeria")) {
        existingCompany.country = detected.country;
      }
      await existingCompany.save();

      const founder = await Founder.findById(founderId);
      if (founder && !founder.companies.includes(existingCompany._id)) {
        founder.companies.push(existingCompany._id);
        founder.companySlug = existingCompany.slug;
        if (existingCompany.logoUrl) founder.companyLogoUrl = existingCompany.logoUrl;
        if (existingCompany.teamSize) founder.teamSize = existingCompany.teamSize;
        if (existingCompany.isHiring) founder.isHiring = existingCompany.isHiring;
        if (existingCompany.foundedYear && !founder.foundedYear) founder.foundedYear = existingCompany.foundedYear;
        await founder.save();
      }
    }

    return { isNew: false, isDuplicate: true, companyId: existingCompany._id as mongoose.Types.ObjectId };
  }

  const newCompany = new Company({
    name: companyName,
    normalizedName,
    slug,
    founders: [founderId],
    country: detected?.country || "",
    industry: detected?.industry || "",
    location: detected?.location || "",
    foundedYear: detected?.foundedYear || 0,
    isHiring: detected?.isHiring || false,
  });

  await newCompany.save();

  const founder = await Founder.findById(founderId);
  if (founder) {
    founder.companies.push(newCompany._id);
    founder.companySlug = newCompany.slug;
    await founder.save();
  }

  return { isNew: true, isDuplicate: false, companyId: newCompany._id as mongoose.Types.ObjectId };
}

export async function runCrawler(sourceId?: string): Promise<void> {
  await connectDB();

  const query = sourceId
    ? { _id: sourceId, enabled: true }
    : { enabled: true };

  const sources = await CrawlSource.find(query);

  for (const source of sources) {
    const existingRunningJob = await CrawlJob.findOne({
      sourceId: source._id,
      status: "running",
    });

    if (existingRunningJob) {
      continue;
    }

    const job = new CrawlJob({
      sourceId: source._id,
      status: "running",
      startedAt: new Date(),
    });
    await job.save();

    source.crawlStatus = "crawling";
    await source.save();

    try {
      const config: CrawlerConfig = {
        ...DEFAULT_CONFIG,
        maxPages: source.maxPages || DEFAULT_CONFIG.maxPages,
        maxDepth: source.maxDepth || DEFAULT_CONFIG.maxDepth,
      };

      const robots = await checkRobotsTxt(source.baseUrl, config);
      config.delayBetweenRequests = Math.max(
        config.delayBetweenRequests,
        robots.crawlDelay * 1000
      );

      const initialState: CrawlState = {
        visited: new Set(),
        queue: [],
        pagesCrawled: 0,
        pagesSkipped: 0,
        foundersFound: 0,
        newFounders: 0,
        updatedFounders: 0,
        duplicatesFound: 0,
        fundingPagesFound: 0,
        hiringPagesFound: 0,
        founderProfilesFound: 0,
        companiesDiscovered: 0,
        countriesDiscovered: new Set(),
        errors: [],
      };

      const { score: homeScore, reason: homeReason } = scoreUrl(source.baseUrl);
      initialState.queue.push({
        url: source.baseUrl,
        depth: 0,
        priority: homeScore + 10,
        reason: `homepage (${homeReason})`,
      });

      while (initialState.queue.length > 0 && initialState.pagesCrawled < config.maxPages) {
        const entry = initialState.queue.shift()!;

        if (entry.depth > config.maxDepth) {
          initialState.pagesSkipped++;
          continue;
        }

        const normalizedUrl = normalizeUrl(entry.url, source.baseUrl);
        if (initialState.visited.has(normalizedUrl)) {
          initialState.pagesSkipped++;
          continue;
        }

        initialState.visited.add(normalizedUrl);

        if (!isAllowedByRobots(normalizedUrl, robots.disallowed)) {
          initialState.pagesSkipped++;
          continue;
        }

        const page = await fetchPage(normalizedUrl, config);
        if (!page) {
          initialState.pagesSkipped++;
          continue;
        }

        initialState.pagesCrawled++;
        await new Promise((resolve) =>
          setTimeout(resolve, config.delayBetweenRequests)
        );

        try {
          const $ = cheerio.load(page.html);
          const bodyText = $("body").text() || "";

          if (/funding|raises|raised|investment|backed by/i.test(bodyText)) {
            initialState.fundingPagesFound++;
          }
          if (/hiring|we.re hiring|join our team|careers|open positions/i.test(bodyText)) {
            initialState.hiringPagesFound++;
          }

          const detectedFounders = detectFoundersOnPage($, page.html, normalizedUrl);
          const founderNames: string[] = [];

          for (const detected of detectedFounders) {
            initialState.foundersFound++;
            founderNames.push(detected.name);

            if (detected.country) {
              initialState.countriesDiscovered.add(detected.country);
            }

            const result = await saveFounderToDb(detected);

            if (result.isNew) {
              initialState.newFounders++;
            } else if (result.isDuplicate) {
              initialState.duplicatesFound++;
            }

            if (detected.company) {
              const founderId = result.founderId || (await Founder.findOne({
                normalizedName: normalizeFounderName(detected.name),
              }))?._id as mongoose.Types.ObjectId | undefined;

              if (founderId) {
                const companyResult = await saveCompanyToDb(
                  detected.company,
                  founderId,
                  detected
                );
                if (companyResult.isNew) {
                  initialState.companiesDiscovered++;
                }

                if (companyResult.companyId && !result.isDuplicate) {
                  const companyUrl = `https://${normalizedUrl.split("/")[2]}`;
                  const companyBase = new URL(normalizedUrl).origin;

                  for (const suffix of ["/about", "/team", "/founders", "/leadership", "/careers"]) {
                    const candidateUrl = companyBase + suffix;
                    if (!initialState.visited.has(candidateUrl)) {
                      const { score } = scoreUrl(candidateUrl);
                      insertByPriority(initialState.queue, {
                        url: candidateUrl,
                        depth: entry.depth + 1,
                        priority: score + 20,
                        reason: `company page: ${suffix}`,
                      });
                    }
                  }
                }
              }
            }
          }

          if (founderNames.length > 0) {
            initialState.founderProfilesFound++;
            const profileLinks = extractFounderProfileLinks($, normalizedUrl, source.baseUrl, founderNames);
            for (const link of profileLinks) {
              if (!initialState.visited.has(link)) {
                const { score } = scoreUrl(link);
                insertByPriority(initialState.queue, {
                  url: link,
                  depth: entry.depth + 1,
                  priority: score + 25,
                  reason: "founder profile link",
                });
              }
            }
          }

          const links = extractLinks($, normalizedUrl, source.baseUrl);
          for (const link of links) {
            if (!initialState.visited.has(link)) {
              const { score, reason } = scoreUrl(link, bodyText);
              insertByPriority(initialState.queue, {
                url: link,
                depth: entry.depth + 1,
                priority: score,
                reason,
              });
            }
          }
        } catch (error) {
          initialState.errors.push(
            `Error parsing ${normalizedUrl}: ${error instanceof Error ? error.message : "Unknown"}`
          );
        }
      }

      job.status = "completed";
      job.completedAt = new Date();
      job.pagesCrawled = initialState.pagesCrawled;
      job.pagesSkipped = initialState.pagesSkipped;
      job.foundersFound = initialState.foundersFound;
      job.newFounders = initialState.newFounders;
      job.updatedFounders = initialState.updatedFounders;
      job.duplicatesFound = initialState.duplicatesFound;
      job.fundingPagesFound = initialState.fundingPagesFound;
      job.hiringPagesFound = initialState.hiringPagesFound;
      job.founderProfilesFound = initialState.founderProfilesFound;
      job.companiesDiscovered = initialState.companiesDiscovered;
      job.countriesDiscovered = [...initialState.countriesDiscovered];
      job.crawlErrors = initialState.errors;
      await job.save();

      source.lastCrawledAt = new Date();
      source.nextCrawlAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      source.crawlStatus = "idle";
      source.pagesCrawled += initialState.pagesCrawled;
      source.foundersDiscovered += initialState.newFounders;
      source.crawlErrors = initialState.errors;
      await source.save();
    } catch (error) {
      job.status = "failed";
      job.completedAt = new Date();
      job.errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      await job.save();

      source.crawlStatus = "error";
      source.crawlErrors.push(
        error instanceof Error ? error.message : "Unknown error"
      );
      await source.save();
    }
  }
}

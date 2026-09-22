import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { detectCountry } from "./africa-config";

export interface DetectedFounder {
  name: string;
  role: string;
  company: string;
  location: string;
  country: string;
  industry: string;
  bio: string;
  sourceSentence: string;
  email: string;
  xUrl: string;
  linkedinUrl: string;
  personalWebsiteUrl: string;
  companyXUrl: string;
  companyLinkedinUrl: string;
  companyWebsiteUrl: string;
  oneLiner: string;
  teamSize: number;
  foundedYear: number;
  hiring: boolean | null;
  hiringEvidence: string;
}

export interface HiringDetection {
  hiring: boolean | null;
  evidence: string;
  companyHint: string;
}

export interface PageExtraction {
  founders: DetectedFounder[];
  primaryCompany: string;
  isFundingArticle: boolean;
  hiring: boolean | null;
  hiringEvidence: string;
  hiringCompanyHint: string;
  rejectionLog: string[];
}

const REJECT = {
  NO_COMPANY: "Founder detected but company relationship unclear",
  FOOTER_SOCIAL: "Social link belongs to site footer",
  SOURCE_SOCIAL: "Source social link rejected for founder",
  COMPANY_LIST: "Page contains company list but no founder relationship",
  AUTHOR_NOT_FOUNDER: "Page author is not a founder",
} as const;

const FOUNDER_SENTENCE_TERMS = /\b(co-?founder|cofounder|founding\s+(?:ceo|member|team|partner)|founder|founded\s+by|started\s+by|launched\s+by|built\s+by|created\s+by|established\s+by|brainchild\s+of|serial\s+entrepreneur)\b/i;

const FOUNDER_ROLE_IN_CARD = /\b(co-?founder|cofounder|founding)\b/i;

const FUNDING_TEXT =
  /\b(funding|funded|raises|raised|raise|investment|investment round|funding round|seed|pre-seed|series a|series b|series c|series d|venture capital|vc|backed by|secured|closed a|capital|fundraise|million)\b/i;

const HIRING_TRUE_PATTERNS: RegExp[] = [
  /\bwe(?:'|’)?re hiring\b/i,
  /\bwe are hiring\b/i,
  /\bnow hiring\b/i,
  /\bjoin (?:our|the) team\b/i,
  /\bwe(?:'|’)?re (?:looking for|seeking)\b/i,
  /\bwe(?:'|’)?re growing (?:our|the) team\b/i,
  /\bopen (?:roles?|positions?)\b/i,
  /\bjob (?:openings?|opportunities)\b/i,
  /\bplans? to hire\b/i,
  /\bwill hire\b/i,
  /\bto hire \d+\b/i,
  /\bhiring \d+\b/i,
  /\bhiring (?:engineers|developers|designers|managers|staff|employees|people)\b/i,
  /\brecruiting \d+\b/i,
];

const HIRING_FALSE_PATTERNS: RegExp[] = [
  /\bnot hiring\b/i,
  /\bhiring (?:is |has )?(?:closed|paused|on hold|frozen)\b/i,
  /\bhiring freeze\b/i,
  /\bno open (?:positions?|roles?|jobs|opportunities)\b/i,
  /\bcurrently not (?:hiring|recruiting)\b/i,
  /\bzero open roles\b/i,
];

const HIRING_PLAN_PATTERNS: RegExp[] = [
  /\bplans? to hire\b/i,
  /\bwill hire\b/i,
  /\bto hire \d+\b/i,
  /\bhiring \d+\b/i,
  /\bwill use .* to hire\b/i,
];

const FIRST_PERSON_HIRING = /\bwe(?:'|’)?re\b|\bwe are\b|\bjoin (?:our|the) team\b/i;

const CAREERS_PATH = /\/(careers?|jobs|join[-_](?:us|team)|work[-_](?:with[-_])?us|open[-_]?roles|talent)(\/|$|\?)/i;

const HIRING_COMPANY_PATTERNS: RegExp[] = [
  /\b([A-Z][\w&.'’-]+(?:\s+[A-Z&][\w&.'’-]+)*)\s+(?:is|are|was|were)\s+(?:currently\s+)?(?:actively\s+)?hiring\b/,
  /\b([A-Z][\w&.'’-]+(?:\s+[A-Z&][\w&.'’-]+)*)\s+(?:plans?|planned|is planning|will|would)\s+to hire\b/,
  /\bhiring at ([A-Z][\w&.'’-]+(?:\s+[A-Z&][\w&.'’-]+)*)/,
];

const AUTHOR_SELECTOR =
  '[rel="author"], [itemprop="author"], .author, .byline, .post-byline, .article-author, .entry-author, [class*="byline"]';

const GLOBAL_CONTAINER_SELECTOR =
  'header, nav, footer, [role="banner"], [role="contentinfo"], .site-header, .site-footer, .navbar, .social-links, .follow-us';

const TEAM_CARD_SELECTORS = [
  ".team-member",
  ".team-card",
  ".team-member-card",
  ".person-card",
  ".member-card",
  ".founder-card",
  ".team-member-block",
  ".people-card",
  "[class*='team-member']",
  "[class*='team-card']",
  "[class*='founder-card']",
  "[class*='person-card']",
  "[itemtype*='Person']",
].join(", ");

const PERSONAL_SITE_BLOCKLIST = [
  "google",
  "github",
  "wikipedia",
  "medium",
  "substack",
  "notion",
  "vercel",
  "netlify",
  "amazon",
  "apple",
  "microsoft",
  "facebook.com",
  "instagram.com",
  "youtube.com",
  "tiktok.com",
];

const GENERIC_COMPANY_START =
  /^(african|top|best|how|why|these|those|new|south|north|east|west|central|every|meet|about|startup|startups|tech|nigerian|kenyan|ghanaian|sa|the\s+best)\b/i;

const COMMON_FIRST_NAMES = new Set([
  "ade","adewale","adedayo","ademola","adeola","adekunle","adeniyi","adesola","adewumi","ada",
  "akin","akinyemi","akpan","amara","amadi","anu","ayo","ayodeji","ayomide","ayoola",
  "banks","biodun","blessing","bolaji","bolanle","bukola",
  "chidi","chidinma","chinedu","chinonso","chris","christian","chukwuma","chukwuemeka",
  "damilola","dan","daniel","david","dennis","deji","dipo","dupe",
  "ebenezer","eddie","edet","emeka","emmanuel","enitan","eru",
  "ezekiel","femi","feranmi","flourish","francis","funke","favour",
  "gabriel","gbenga","gift","grace","gregory",
  "habeeb","hakeem","hammed","hassan","henry","heritage","humphrey",
  "ifeanyi","ife","ikechukwu","ike","ikenna","irene","isaac","ishola","israel",
  "jabulani","jadesola","james","jide","jimi","joel","john","jonathan","joseph","joshua","joy","judith","julius","jumoke",
  "kayode","kehinde","ken","kenneth","kevin","kola","korede","kunle","kuti",
  "lade","lasisi","layo","leke","lola","louis","luca","lucy","lukman",
  "mafon","maki","mamman","mark","mathew","michael","micheal","mide","mimi","misa","muyiwa","mfon",
  "nachi","nadia","nneka","nnamdi","nonso","nosa","nuel",
  "obinna","odinaka","ogechukwu","oladapo","olamide","olawale","olayinka","olubunmi","olufemi","olugbenga","olumide","olusegun","olushola","omolara","omotayo","onyeka","oris","otunba","oyebade","oyekan","oyewale",
  "patience","patrick","paul","pelumi","peter","pius",
  "raji","rashidat","rebecca","richard","rotimi","ruth",
  "samuel","sandra","sani","saul","segun","seun","shola","simon","sola","solomon","sonde","stanley","sunday","sylvester",
  "taiwo","tami","temitope","temitayo","tolulope","tomi","tony","tope","tosin","tunde","toyin",
  "udoka","ugo","ugochukwu","ukpong","umoreh","utomwen",
  "victor","vivian","wale","wasiu","william","wunmi","yemi","yinka","yoel","yomi","yusuf",
  "zainab","zakari","zekeri","zion",
  "mary","patricia","jennifer","linda","elizabeth","barbara","susan","jessica","thomas",
  "sarah","christopher","karen","charles","lisa","nancy","betty","anthony","margaret",
  "donald","ashley","steven","andrew","emily","dorothy","kimberly","kevin","brian",
  "george","timothy","ronald","edward","jason","jeffrey","ryan","jacob","gary",
  "nicholas","eric","stephen","larry","justin","scott","brandon","benjamin","raymond",
  "frank","jack","jerry","alexander","tyler","aaron","jose","adam","nathan","zachary",
  "douglas","harold","carl","arthur","gerald","roger","keith","jeremy","terry",
  "lawrence","sean","albert","joe","austin","willie","billy","bruce","ralph","roy",
  "eugene","russell","bobby","martha","debra","virginia","kathleen","pamela","anne",
  "katherine","samantha","rachel","carolyn","janet","catherine","maria","heather",
  "diane","julie","olivia","joyce","victoria","kelly","lauren","christina","joan",
  "evelyn","megan","andrea","cheryl","hannah","jacqueline","gloria","teresa","ann",
  "sara","madison","frances","kathryn","janice","jean","abigail","alice","judy",
  "sophia","denise","amber","doris","marilyn","danielle","beverly","isabella",
  "theresa","diana","natalie","brittany","charlotte","marie","kayla","alexis","lori",
]);

const ARTICLE_WORDS = new Set([
  "disrupt","africa","techcabal","techpoint","startup","african","fintech","ecosystem",
  "venture","capital","funding","raise","raises","raised","round","series","seed","pre",
  "launch","launches","launched","announce","announces","announced","acquire","acquires",
  "acquired","merge","merges","merged","partners","partnership","new","first","top","best",
  "big","major","global","local","emerging","leading","south","north","east","west",
  "central","sub","saharan","report","news","update","analysis","review","interview",
  "profile","feature","story","the","and","for","with","from","this","that","has","was",
  "are","who","but","not","how","what","why","when","where","which","will","can","may",
  "its","our","their",
]);

const STOPWORDS = new Set([
  "the","and","for","with","from","this","that","has","was","are","who","but","not",
  "how","what","why","when","where","which","will","can","may","its","our","their",
  "into","over","after","before","between","about","under","above","more","most",
  "than","then","also","just","been","have",
]);

const AFRICAN_LOCATIONS = [
  "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Enugu", "Benin City", "Calabar",
  "Nairobi", "Mombasa", "Kisumu", "Nakuru",
  "Johannesburg", "Cape Town", "Pretoria", "Durban", "Stellenbosch", "Sandton",
  "Accra", "Kumasi", "Tema", "Takoradi",
  "Cairo", "Alexandria", "Giza", "Kigali", "Addis Ababa", "Kampala",
  "Dar es Salaam", "Casablanca", "Rabat", "Marrakech", "Dakar", "Douala", "Yaoundé",
  "Lusaka", "Harare", "Bulawayo", "Tunis", "Abidjan", "Maputo", "Luanda", "Lomé",
  "Cotonou", "Kinshasa", "Windhoek", "Gaborone", "Port Louis", "Lilongwe", "Niamey",
  "Bamako", "Ouagadougou", "Conakry", "Freetown", "Monrovia", "Antananarivo", "Asmara",
  "Mogadishu", "Banjul", "Praia", "Juba", "Khartoum",
];

const INDUSTRIES = [
  "Fintech", "SaaS", "AI", "E-commerce", "Healthtech", "Edtech",
  "Logistics", "Climate", "Media", "Agritech", "Proptech", "Insurtech",
  "Blockchain", "IoT", "Cybersecurity", "Gaming", "HRTech", "Legaltech",
  "Marketplace", "Enterprise", "CleanTech", "BioTech", "FoodTech", "TravelTech",
  "Entertainment", "AdTech", "GovTech", "FinTech",
];

function isLikelyPersonName(name: string): boolean {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2 || parts.length > 4) return false;
  const firstName = parts[0].toLowerCase().replace(/\./g, "");
  if (!COMMON_FIRST_NAMES.has(firstName)) return false;
  for (const part of parts) {
    if (ARTICLE_WORDS.has(part.toLowerCase())) return false;
    if (STOPWORDS.has(part.toLowerCase())) return false;
  }
  const totalLen = name.length;
  if (totalLen < 4 || totalLen > 40) return false;
  return true;
}

function looksLikeCompany(name: string): boolean {
  if (!name || name.length < 2 || name.length > 80) return false;
  if (isLikelyPersonName(name)) return false;
  const words = name.trim().split(/\s+/);
  if (words.length > 5) return false;
  if (CONNECTOR_START.has(words[0].toLowerCase().replace(/[.,]/g, ""))) return false;
  const stripped = name.replace(/^the\s+/i, "").trim();
  if (GENERIC_COMPANY_START.test(stripped)) return false;
  if (!/[A-Z]/.test(name)) return false;
  if (STOPWORDS.has(name.toLowerCase())) return false;
  return true;
}

function detectLocation(text: string): string {
  const lower = text.toLowerCase();
  for (const loc of AFRICAN_LOCATIONS) {
    if (lower.includes(loc.toLowerCase())) return loc;
  }
  return "";
}

function detectIndustry(text: string): string {
  const lower = text.toLowerCase();
  for (const ind of INDUSTRIES) {
    if (lower.includes(ind.toLowerCase())) return ind;
  }
  return "";
}

function extractRole(text: string): string {
  const rolePatterns: [RegExp, string][] = [
    [/\b(ceo\s*&\s*co-?founder|co-?founder\s*&\s*ceo|founder\s+and\s+ceo|co-?founder\s+and\s+ceo)\b/i, "Founder & CEO"],
    [/\b(founder\s+&\s*(?:cto|coo|cmo|cfo)|co-?founder\s+&\s*(?:cto|coo|cmo|cfo))\b/i, ""],
    [/\b(founding\s+ceo)\b/i, "Founding CEO"],
    [/\b(co-?founders)\b/i, "Co-founder"],
    [/\b(co-?founder)\b/i, "Co-founder"],
    [/\b(founding\s+(?:member|team|partner))\b/i, "Founding Member"],
    [/\b(founder)\b/i, "Founder"],
  ];
  const lower = text.toLowerCase();
  for (const [pattern, role] of rolePatterns) {
    if (pattern.test(lower)) {
      return role || lower.match(pattern)![1].replace(/\s*&\s*/g, " & ").toUpperCase();
    }
  }
  return "Founder";
}

const COMPANY_PATTERNS: RegExp[] = [
  /(?i:(?:co-?founder|founder|founding\s+(?:ceo|member|team|partner)|ceo|cto|coo|cfo|cmo|md|managing\s+director))\s+(?i:(?:of|at))\s+(?i:(?:the\s+))?([A-Z][\w&.'’-]+(?:\s+[A-Z&][\w&.'’-]+)*)/,
  /([A-Z][\w&.'’-]+(?:\s+[A-Z&][\w&.'’-]+)*)\s+(?i:(?:was|is|were|are))\s+(?i:(?:co-?founded|founded|started|launched|created|established|built))\s+(?i:by)\b/,
  /(?i:(?:co-?founded|founded|started|launched|created|established))\s+(?i:(?:the\s+))?(?!(?i:by)\b)([A-Z][\w&.'’-]+(?:\s+[A-Z&][\w&.'’-]+)*)/,
  /(?i:(?:founder|co-?founder))\s+(?i:(?:and|,))\s+(?i:(?:ceo|cto|coo))\s+(?i:(?:of|at))\s+(?i:(?:the\s+))?([A-Z][\w&.'’-]+(?:\s+[A-Z&][\w&.'’-]+)*)/,
];

const CONNECTOR_START = new Set([
  "by", "in", "of", "at", "to", "for", "via", "with", "from", "as", "on",
  "is", "was", "were", "are", "and", "or", "a", "an", "the", "that", "which", "who",
]);

function extractCompanyFromSentence(sentence: string): string {
  for (const pattern of COMPANY_PATTERNS) {
    const match = sentence.match(pattern);
    if (match) {
      let company = match[1].trim();
      company = company
        .replace(/[,.:;]+$/, "")
        .replace(/\s+(and|is|was|has|in|at|who|which|to|for)$/i, "")
        .trim();
      if (company.toLowerCase() === "the") continue;
      if (looksLikeCompany(company)) return company;
    }
  }
  return "";
}

function extractNamesFromText(text: string): string[] {
  const names: string[] = [];
  const namePatterns = [
    /(?:^|[,;:\s)(\[“"'])((?:[A-Z][a-z]+)(?:\s+[A-Z][a-z]+){1,2})(?=[,;:\s)\]"'’]|$)/g,
    /(?:^|[,;:\s)(\[“"'])([A-Z][a-z]+\s+[A-Z]\.\s+[A-Z][a-z]+)(?=[,;:\s)\]"'’]|$)/g,
  ];
  for (const pattern of namePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const name = match[1].trim();
      if (isLikelyPersonName(name)) names.push(name);
    }
  }
  return [...new Set(names)];
}

function extractFoundedYear(text: string): number {
  const yearPatterns = [
    /(?:co-?founded|founded|started|launched|established|incorporated)\s+(?:in\s+)?(\d{4})/i,
    /(?:est\.?|established)\s*:?\s*(\d{4})/i,
    /founded:\s*(\d{4})/i,
    /founding\s+year\s*:?\s*(\d{4})/i,
  ];
  for (const pattern of yearPatterns) {
    const match = text.match(pattern);
    if (match) {
      const year = parseInt(match[1]);
      const maxYear = new Date().getFullYear() + 1;
      if (year >= 1990 && year <= maxYear) return year;
    }
  }
  return 0;
}

function extractTeamSize(text: string): number {
  const patterns = [
    /(\d+)\+?\s*(?:team\s*members?|employees?|staff)\b/i,
    /\bteam\s+(?:of\s+)?(\d+)\b/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const size = parseInt(match[1]);
      if (size > 0 && size < 10000) return size;
    }
  }
  return 0;
}

function handleTiesToName(value: string, founderName: string): boolean {
  const cleaned = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!cleaned) return false;
  const parts = founderName
    .toLowerCase()
    .split(/\s+/)
    .filter((p) => p.length > 2);
  if (parts.some((p) => cleaned.includes(p))) return true;
  const all = founderName.toLowerCase().split(/\s+/).filter(Boolean);
  if (all.length >= 2) {
    const first = all[0];
    const last = all[all.length - 1];
    const firstLast = `${first}${last}`;
    if (cleaned.includes(firstLast)) return true;
    if (cleaned === `${first[0]}${last}` || cleaned === `${first}${last[0]}`) return true;
  }
  return false;
}

function anchorTiesToName(anchorText: string, founderName: string): boolean {
  const a = anchorText.toLowerCase().replace(/\s+/g, " ").trim();
  return a.includes(founderName.toLowerCase());
}

function extractHiringCompany(sentence: string): string {
  for (const pattern of HIRING_COMPANY_PATTERNS) {
    const match = sentence.match(pattern);
    if (match) {
      const company = match[1].trim().replace(/[,.:;]+$/, "");
      if (company && looksLikeCompany(company)) return company;
    }
  }
  return "";
}

function findSentenceWithPattern(text: string, patterns: RegExp[]): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  for (const sentence of sentences) {
    const trimmed = sentence.replace(/\s+/g, " ").trim();
    if (!trimmed || trimmed.length < 8 || trimmed.length > 500) continue;
    if (patterns.some((p) => p.test(trimmed))) return trimmed;
  }
  if (patterns.some((p) => p.test(text))) {
    return text.replace(/\s+/g, " ").trim().slice(0, 300);
  }
  return "";
}

function detectHiringOnPage(
  $: cheerio.CheerioAPI,
  pageUrl: string,
  bodyText: string,
  ctx: { siteOrg: string; headlineCompany: string; isPublicationPage: boolean }
): HiringDetection {
  let path = "";
  try {
    path = new URL(pageUrl).pathname.toLowerCase();
  } catch {}

  const isCareersPage = CAREERS_PATH.test(path);

  if (isCareersPage && ctx.siteOrg) {
    const closed = findSentenceWithPattern(bodyText, HIRING_FALSE_PATTERNS);
    if (closed) {
      return { hiring: false, evidence: closed, companyHint: ctx.siteOrg };
    }
    const jobLinks = $('a[href]').filter((_, el) => {
      const href = ($(el).attr("href") || "").toLowerCase();
      return /\/(jobs?|positions?|roles?)\/[^/?#]+/.test(href) || /\/careers\/[^/?#]+/.test(href);
    }).length;
    const roleCards = $(
      '[class*="job-title"], [class*="position-title"], [class*="role-title"], [class*="job-card"], [class*="opening"]'
    ).length;
    if (jobLinks > 0 || roleCards > 0) {
      return {
        hiring: true,
        evidence: `Careers page lists open roles (${jobLinks || roleCards} listing(s))`,
        companyHint: ctx.siteOrg,
      };
    }
    return { hiring: null, evidence: "", companyHint: "" };
  }

  const blocks = $("p, li, blockquote, td, h1, h2, h3, h4, strong")
    .not(GLOBAL_CONTAINER_SELECTOR)
    .not(AUTHOR_SELECTOR);

  let falseCandidate: HiringDetection | null = null;

  for (let i = 0; i < blocks.length; i++) {
    const text = (blocks.eq(i).text() || "").replace(/\s+/g, " ").trim();
    if (!text || text.length > 2000) continue;
    const hasTrue = HIRING_TRUE_PATTERNS.some((p) => p.test(text));
    const hasFalse = HIRING_FALSE_PATTERNS.some((p) => p.test(text));
    if (!hasTrue && !hasFalse) continue;

    const sentences = text.split(/(?<=[.!?])\s+/);
    for (const raw of sentences) {
      const sentence = raw.trim();
      if (!sentence || sentence.length < 8 || sentence.length > 500) continue;

      if (HIRING_TRUE_PATTERNS.some((p) => p.test(sentence))) {
        if (FIRST_PERSON_HIRING.test(sentence) && ctx.siteOrg) {
          return { hiring: true, evidence: sentence, companyHint: ctx.siteOrg };
        }
        const explicitCompany = extractHiringCompany(sentence);
        if (explicitCompany) {
          return { hiring: true, evidence: sentence, companyHint: explicitCompany };
        }
        if (
          ctx.headlineCompany &&
          HIRING_PLAN_PATTERNS.some((p) => p.test(sentence))
        ) {
          return { hiring: true, evidence: sentence, companyHint: ctx.headlineCompany };
        }
      }

      if (!falseCandidate && HIRING_FALSE_PATTERNS.some((p) => p.test(sentence))) {
        if (FIRST_PERSON_HIRING.test(sentence) && ctx.siteOrg) {
          falseCandidate = { hiring: false, evidence: sentence, companyHint: ctx.siteOrg };
        } else {
          const explicitCompany = extractHiringCompany(sentence);
          if (explicitCompany) {
            falseCandidate = { hiring: false, evidence: sentence, companyHint: explicitCompany };
          }
        }
      }
    }
  }

  if (falseCandidate) return falseCandidate;
  return { hiring: null, evidence: "", companyHint: "" };
}

function getSourceIdentity(pageUrl: string, sourceName?: string): {
  handles: string[];
  compact: string;
  hostLabels: string[];
} {
  const handles = new Set<string>();
  let hostLabels: string[] = [];
  try {
    const host = new URL(pageUrl).hostname.replace(/^www\./, "");
    hostLabels = host.split(".").filter((p) => p.length >= 5 && !["com", "org", "net", "co", "gov", "africa"].includes(p));
    for (const label of hostLabels) handles.add(label.toLowerCase());
  } catch {}
  const compact = (sourceName || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  if (compact.length >= 5) handles.add(compact);
  const words = (sourceName || "").toLowerCase().split(/\s+/).filter((w) => w.length >= 4);
  for (const w of words) handles.add(w.replace(/[^a-z0-9]/g, ""));
  return { handles: [...handles].filter((h) => h.length >= 5), compact, hostLabels };
}

function isSourceHandle(handle: string, identity: { handles: string[]; compact: string }): boolean {
  const h = handle.toLowerCase().replace(/[^a-z0-9_]/g, "");
  const hCompact = h.replace(/_/g, "");
  if (identity.compact && (hCompact === identity.compact || h === identity.compact)) return true;
  return identity.handles.some(
    (t) => h === t || hCompact === t || hCompact === t.replace(/[^a-z0-9]/g, "")
  );
}

function isGlobalContainer($: cheerio.CheerioAPI, el: AnyNode): boolean {
  return $(el).closest(GLOBAL_CONTAINER_SELECTOR).length > 0;
}

function extractSocialFromContainer(
  $: cheerio.CheerioAPI,
  container: cheerio.Cheerio<AnyNode>,
  founderName: string,
  identity: { handles: string[]; compact: string; hostLabels: string[] },
  pageHost: string,
  rejections: string[],
  requireNameTie: boolean
): { xUrl: string; linkedinUrl: string; personalWebsiteUrl: string; email: string } {
  let xUrl = "";
  let linkedinUrl = "";
  let personalWebsiteUrl = "";
  let email = "";
  const nameLower = founderName.toLowerCase();

  container.find("a[href]").each((_, el) => {
    if (isGlobalContainer($, el)) return;
    const href = $(el).attr("href") || "";
    const lowerHref = href.toLowerCase();
    const anchorText = ($(el).attr("aria-label") || $(el).attr("title") || $(el).text() || "").toLowerCase();

    if (!email && lowerHref.startsWith("mailto:")) {
      const rawEmail = href.slice(7).split("?")[0].trim().toLowerCase();
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
        const localPart = rawEmail.split("@")[0].replace(/[^a-z0-9]/g, "");
        if (handleTiesToName(localPart, founderName)) {
          email = rawEmail;
        }
      }
      return;
    }

    const isX = lowerHref.includes("twitter.com/") || /https?:\/\/(x|twitter)\.com\//i.test(href);
    const isLinkedIn = lowerHref.includes("linkedin.com/in/");
    if (!isX && !isLinkedIn) return;

    const xMatch = href.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/);
    const liMatch = href.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/);

    if (isX && xMatch) {
      const handle = xMatch[1];
      const bad = ["home", "search", "explore", "notifications", "messages", "settings", "i", "hashtag", "login", "signup", "share"];
      if (bad.includes(handle.toLowerCase())) return;
      if (isSourceHandle(handle, identity)) {
        rejections.push(REJECT.SOURCE_SOCIAL);
        return;
      }
      if (
        requireNameTie &&
        !handleTiesToName(handle, founderName) &&
        !anchorTiesToName(anchorText, founderName)
      ) {
        rejections.push(REJECT.SOURCE_SOCIAL);
        return;
      }
      if (!xUrl) xUrl = `https://x.com/${handle}`;
      return;
    }

    if (isLinkedIn && liMatch) {
      const slug = liMatch[1].toLowerCase();
      if (["about", "company", "people", "jobs", "products", "services", "contact", "school"].includes(slug)) return;
      const slugCompact = slug.replace(/[^a-z0-9]/g, "");
      if (identity.compact && slugCompact === identity.compact) {
        rejections.push(REJECT.SOURCE_SOCIAL);
        return;
      }
      if (
        requireNameTie &&
        !handleTiesToName(slug, founderName) &&
        !anchorTiesToName(anchorText, founderName)
      ) {
        return;
      }
      if (!linkedinUrl) linkedinUrl = `https://www.linkedin.com/in/${liMatch[1]}`;
      return;
    }

    void anchorText;
    void nameLower;
  });

  container.find("a[href]").each((_, el) => {
    if (isGlobalContainer($, el)) return;
    const href = $(el).attr("href") || "";
    if (personalWebsiteUrl) return;
    if (!/^https?:\/\//i.test(href)) return;
    const lower = href.toLowerCase();
    if (
      lower.includes("twitter.com") ||
      lower.includes("x.com") ||
      lower.includes("linkedin.com") ||
      lower.includes("mailto:") ||
      lower.includes("tel:") ||
      lower.includes("javascript:")
    ) {
      return;
    }
    try {
      const urlObj = new URL(href);
      if (urlObj.hostname.replace(/^www\./, "") === pageHost) return;
      if (PERSONAL_SITE_BLOCKLIST.some((d) => urlObj.hostname.includes(d))) return;
      const anchorText = ($(el).attr("aria-label") || $(el).text() || "").toLowerCase();
      const tied =
        handleTiesToName(urlObj.hostname.replace(/^www\./, ""), founderName) ||
        handleTiesToName(urlObj.pathname, founderName) ||
        anchorTiesToName(anchorText, founderName);
      if (!tied) return;
      personalWebsiteUrl = href;
    } catch {}
  });

  return { xUrl, linkedinUrl, personalWebsiteUrl, email };
}

function getHeadlineCompany($: cheerio.CheerioAPI): string {
  const candidates: string[] = [];
  const title = ($("title").first().text() || "").trim();
  const h1 = $("h1").first().text().trim();
  const ogTitle = $('meta[property="og:title"]').attr("content") || "";

  for (const raw of [h1, ogTitle, title]) {
    if (!raw) continue;
    const cleaned = raw.split(/\s+[|–—-]\s+(TechCabal|Techpoint|Disrupt Africa|Startup List Africa|Forbes|Ventures Africa)/i)[0].trim();
    const m =
      cleaned.match(/^\s*([A-Z][\w&.'’-]*(?:\s+[A-Z&][\w&.'’-]+)*)\s+(?:raises|raised|raise|secures|secured|closes|closed|lands|bags|gets|snaps|inks|completes|exits)/i) ||
      cleaned.match(/^\s*([A-Z][\w&.'’-]*(?:\s+[A-Z&][\w&.'’-]+)*)\s+(?:startup\s+)?(?:raises|raised|secures)/i);
    if (m) {
      const company = m[1].trim().replace(/[,.:;]+$/, "");
      if (looksLikeCompany(company)) {
        candidates.push(company);
        break;
      }
    }
  }
  return candidates[0] || "";
}

function getSiteOrganization($: cheerio.CheerioAPI): string {
  const ogSite = ($('meta[property="og:site_name"]').attr("content") || "").trim();
  if (ogSite && looksLikeCompany(ogSite)) return ogSite;

  let jsonLdOrg = "";
  $('script[type="application/ld+json"]').each((_, el) => {
    if (jsonLdOrg) return;
    try {
      const data = JSON.parse($(el).html() || "");
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        const graph = item?.["@graph"];
        const list = graph ? (Array.isArray(graph) ? graph : [graph]) : items;
        for (const node of list) {
          const t = node?.["@type"];
          const types = Array.isArray(t) ? t : [t];
          if (types.includes("Organization") || types.includes("Corporation") || types.includes("LocalBusiness")) {
            if (node.name && looksLikeCompany(node.name)) {
              jsonLdOrg = node.name;
              return;
            }
          }
        }
      }
    } catch {}
  });
  return jsonLdOrg;
}

function extractFromJsonLd(
  $: cheerio.CheerioAPI,
  ctx: {
    siteOrg: string;
    headlineCompany: string;
    isPublicationPage: boolean;
    foundedYear: number;
    hiring: boolean | null;
    hiringEvidence: string;
    teamSize: number;
    location: string;
    country: string;
    industry: string;
    identity: { handles: string[]; compact: string; hostLabels: string[] };
    pageHost: string;
    rejections: string[];
  }
): DetectedFounder[] {
  const founders: DetectedFounder[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const raw = $(el).html() || "";
      const data = JSON.parse(raw);
      const items = Array.isArray(data) ? data : [data];

      for (const item of items) {
        const graph = item?.["@graph"];
        const nodes = graph ? (Array.isArray(graph) ? graph : [graph]) : items;

        for (const node of nodes) {
          const t = node?.["@type"];
          const types = (Array.isArray(t) ? t : [t]).map((x: string) => String(x));

          if (types.includes("Organization") && node.founder) {
            const orgName = typeof node.name === "string" ? node.name.trim() : "";
            const foundersArr = Array.isArray(node.founder) ? node.founder : [node.founder];
            for (const f of foundersArr) {
              if (!f?.name || !isLikelyPersonName(f.name)) continue;
              const role = f.jobTitle && /founder/i.test(f.jobTitle) ? extractRole(f.jobTitle) : "Founder";
              const sameAs: string = Array.isArray(f.sameAs) ? f.sameAs[0] || "" : f.sameAs || "";
              let xUrl = "";
              let linkedinUrl = "";
              if (sameAs && !isSourceHandle((sameAs.match(/(?:x|twitter)\.com\/([^/?#]+)/) || [])[1] || "", ctx.identity)) {
                if (/x\.com|twitter\.com/.test(sameAs)) xUrl = `https://x.com/${(sameAs.match(/(?:x|twitter)\.com\/([^/?#]+)/) || [])[1]}`;
              }
              if (sameAs && /linkedin\.com\/in\//.test(sameAs)) linkedinUrl = sameAs;
              founders.push({
                name: f.name,
                role,
                company: orgName && looksLikeCompany(orgName) ? orgName : "",
                location: f.address?.addressLocality || ctx.location,
                country: detectCountry(`${f.name} ${f.description || ""} ${f.address?.addressCountry || ""}`) || ctx.country,
                industry: ctx.industry || detectIndustry(f.description || ""),
                bio: String(f.description || "").replace(/<[^>]*>/g, "").slice(0, 500),
                sourceSentence: `${f.name}${f.jobTitle ? `, ${f.jobTitle}` : ""} — ${orgName || "organization"} (JSON-LD structured data)`,
                email: typeof f.email === "string" ? f.email.toLowerCase() : "",
                xUrl,
                linkedinUrl,
                personalWebsiteUrl: "",
                companyXUrl: "",
                companyLinkedinUrl: "",
                companyWebsiteUrl: "",
                oneLiner: "",
                teamSize: ctx.teamSize,
                foundedYear: ctx.foundedYear,
                hiring: ctx.hiring,
                hiringEvidence: ctx.hiringEvidence,
              });
            }
          }

          if (types.includes("Person")) {
            const title = String(node.jobTitle || node.role || "");
            if (!title || !/founder|founding/i.test(title)) continue;
            if (!node.name || !isLikelyPersonName(node.name)) continue;
            const explicitCompany = node.worksFor?.name || node.memberOf?.name || "";
            const siteCompany = !ctx.isPublicationPage && !explicitCompany ? ctx.siteOrg : "";
            const company = explicitCompany || siteCompany;
            let xUrl = "";
            let linkedinUrl = "";
            const sameAsList: string[] = Array.isArray(node.sameAs) ? node.sameAs : node.sameAs ? [node.sameAs] : [];
            for (const s of sameAsList) {
              const xm = String(s).match(/(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]+)/);
              if (xm && !xUrl && !isSourceHandle(xm[1], ctx.identity)) xUrl = `https://x.com/${xm[1]}`;
              const lm = String(s).match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/);
              if (lm && !linkedinUrl) linkedinUrl = `https://www.${lm[0]}`;
            }
            founders.push({
              name: node.name,
              role: extractRole(title),
              company: looksLikeCompany(company) ? company : "",
              location: node.address?.addressLocality || ctx.location,
              country: detectCountry(String(node.description || "")) || ctx.country,
              industry: ctx.industry || detectIndustry(String(node.description || "")),
              bio: String(node.description || "").replace(/<[^>]*>/g, "").slice(0, 500),
              sourceSentence: `${node.name}, ${title}${company ? ` of ${company}` : ""} (JSON-LD structured data)`,
              email: typeof node.email === "string" ? node.email.toLowerCase() : "",
              xUrl,
              linkedinUrl,
              personalWebsiteUrl: "",
              companyXUrl: "",
              companyLinkedinUrl: "",
              companyWebsiteUrl: "",
              oneLiner: "",
              teamSize: ctx.teamSize,
              foundedYear: ctx.foundedYear,
              hiring: ctx.hiring,
              hiringEvidence: ctx.hiringEvidence,
            });
          }
        }
      }
    } catch {}
  });

  return founders;
}

function extractTeamCards(
  $: cheerio.CheerioAPI,
  ctx: {
    pageCompany: string;
    foundedYear: number;
    hiring: boolean | null;
    hiringEvidence: string;
    teamSize: number;
    location: string;
    country: string;
    industry: string;
    identity: { handles: string[]; compact: string; hostLabels: string[] };
    pageHost: string;
    rejections: string[];
  }
): DetectedFounder[] {
  const founders: DetectedFounder[] = [];
  const seen = new Set<string>();

  $(TEAM_CARD_SELECTORS).each((_, el) => {
    const card = $(el);
    const cardText = card.text() || "";
    if (!FOUNDER_ROLE_IN_CARD.test(cardText)) return;

    let name = "";
    card.find("h1, h2, h3, h4, h5, strong, .name, .member-name, .team-name, [itemprop='name']").each((__, nameEl) => {
      if (name) return;
      const candidate = $(nameEl).text().trim().replace(/\s+/g, " ");
      if (isLikelyPersonName(candidate)) name = candidate;
    });
    if (!name) {
      const ownMatch = cardText.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b/);
      if (ownMatch && isLikelyPersonName(ownMatch[1])) name = ownMatch[1];
    }
    if (!name) return;

    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    const role = extractRole(cardText);
    const social = extractSocialFromContainer($, card, name, ctx.identity, ctx.pageHost, ctx.rejections, false);
    const founder: DetectedFounder = {
      name,
      role,
      company: ctx.pageCompany,
      location: detectLocation(cardText) || ctx.location,
      country: detectCountry(cardText) || ctx.country,
      industry: detectIndustry(cardText) || ctx.industry,
      bio: "",
      sourceSentence: cardText.replace(/\s+/g, " ").trim().slice(0, 300),
      ...social,
      companyXUrl: "",
      companyLinkedinUrl: "",
      companyWebsiteUrl: "",
      oneLiner: "",
      teamSize: ctx.teamSize,
      foundedYear: ctx.foundedYear,
      hiring: ctx.hiring,
      hiringEvidence: ctx.hiringEvidence,
    };
    founders.push(founder);
  });

  return founders;
}

function extractSentenceFounders(
  $: cheerio.CheerioAPI,
  ctx: {
    headlineCompany: string;
    isFundingArticle: boolean;
    siteOrg: string;
    isCompanySite: boolean;
    foundedYear: number;
    hiring: boolean | null;
    hiringEvidence: string;
    teamSize: number;
    industry: string;
    identity: { handles: string[]; compact: string; hostLabels: string[] };
    pageHost: string;
    rejections: string[];
  }
): DetectedFounder[] {
  const founders: DetectedFounder[] = [];

  const blocks = $("p, li, blockquote, td, figcaption, h1, h2, h3, h4")
    .not(AUTHOR_SELECTOR)
    .not(GLOBAL_CONTAINER_SELECTOR);

  blocks.each((_, el) => {
    const $el = $(el);
    const text = ($el.text() || "").replace(/\s+/g, " ").trim();
    if (!text || text.length > 2000) return;
    if (!FOUNDER_SENTENCE_TERMS.test(text)) return;

    const sentences = text.split(/[.!?]+/);
    for (const rawSentence of sentences) {
      const sentence = rawSentence.trim();
      if (!sentence || sentence.length < 10 || sentence.length > 500) continue;
      if (!FOUNDER_SENTENCE_TERMS.test(sentence)) continue;

      const names = extractNamesFromText(sentence);
      if (names.length === 0) continue;

      const company = extractCompanyFromSentence(sentence);
      const role = extractRole(sentence);

      for (const name of names) {
        const social = extractSocialFromContainer($, $el, name, ctx.identity, ctx.pageHost, ctx.rejections, true);

        founders.push({
          name,
          role,
          company,
          location: detectLocation(sentence),
          country: detectCountry(sentence),
          industry: detectIndustry(sentence) || ctx.industry,
          bio: sentence.slice(0, 500),
          sourceSentence: sentence,
          ...social,
          companyXUrl: "",
          companyLinkedinUrl: "",
          companyWebsiteUrl: "",
          oneLiner: "",
          teamSize: ctx.teamSize,
          foundedYear: ctx.foundedYear,
          hiring: ctx.hiring,
          hiringEvidence: ctx.hiringEvidence,
        });

        if (!company) {
          ctx.rejections.push(REJECT.NO_COMPANY);
        }
      }
    }
  });

  return founders;
}

function mergeFounders(list: DetectedFounder[]): DetectedFounder[] {
  const map = new Map<string, DetectedFounder>();
  for (const f of list) {
    const key = f.name.toLowerCase().replace(/\s+/g, " ");
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...f });
      continue;
    }
    if (!existing.company && f.company) existing.company = f.company;
    if (!existing.xUrl && f.xUrl) existing.xUrl = f.xUrl;
    if (!existing.linkedinUrl && f.linkedinUrl) existing.linkedinUrl = f.linkedinUrl;
    if (!existing.personalWebsiteUrl && f.personalWebsiteUrl) existing.personalWebsiteUrl = f.personalWebsiteUrl;
    if (!existing.email && f.email) existing.email = f.email;
    if (!existing.bio && f.bio) existing.bio = f.bio;
    if (!existing.sourceSentence && f.sourceSentence) existing.sourceSentence = f.sourceSentence;
    if (!existing.location && f.location) existing.location = f.location;
    if (!existing.country && f.country) existing.country = f.country;
    if (!existing.industry && f.industry) existing.industry = f.industry;
    if (!existing.foundedYear && f.foundedYear) existing.foundedYear = f.foundedYear;
    if (f.hiring === true) {
      existing.hiring = true;
      if (!existing.hiringEvidence && f.hiringEvidence) existing.hiringEvidence = f.hiringEvidence;
    } else if (f.hiring === false && existing.hiring === null) {
      existing.hiring = false;
      if (!existing.hiringEvidence && f.hiringEvidence) existing.hiringEvidence = f.hiringEvidence;
    }
    if (f.teamSize && !existing.teamSize) existing.teamSize = f.teamSize;
  }
  return [...map.values()];
}

export function detectFoundersOnPage(
  $: cheerio.CheerioAPI,
  html: string,
  url: string,
  opts?: { sourceName?: string }
): PageExtraction {
  void html;
  const rejections: string[] = [];
  const identity = getSourceIdentity(url, opts?.sourceName);

  let pageHost = "";
  try {
    pageHost = new URL(url).hostname.replace(/^www\./, "");
  } catch {}

  const title = ($("title").first().text() || "").trim();
  const h1 = $("h1").first().text().trim();
  const bodyText = $("body").text() || "";

  const isFundingArticle = FUNDING_TEXT.test(title) || FUNDING_TEXT.test(h1);
  const foundedYear = extractFoundedYear(bodyText);
  const teamSize = extractTeamSize(bodyText);
  const location = detectLocation(bodyText);
  const country = detectCountry(bodyText);
  const industry = detectIndustry(bodyText);

  const headlineCompany = getHeadlineCompany($);
  const siteOrg = getSiteOrganization($);

  const isPublicationPage =
    siteOrg !== "" && identity.compact !== "" &&
    siteOrg.toLowerCase().replace(/[^a-z0-9]/g, "") === identity.compact;

  const hiringDetection = detectHiringOnPage($, url, bodyText, {
    siteOrg,
    headlineCompany,
    isPublicationPage,
  });

  const primaryCompany = headlineCompany || siteOrg;

  let pagePath = "";
  try {
    pagePath = new URL(url).pathname.replace(/\/+$/, "");
  } catch {}
  const TEAM_PAGE_PATH = /\/(about|team|people|leadership|our[-_]team|founders|who[-_]we[-_]are)(\/|$|\?)/i;
  const teamCardCompany =
    siteOrg && (TEAM_PAGE_PATH.test(pagePath) || pagePath === "") ? siteOrg : "";

  const hasFounderTerms = FOUNDER_SENTENCE_TERMS.test(bodyText) || FOUNDER_ROLE_IN_CARD.test(bodyText);
  const hasAuthorByline = $(AUTHOR_SELECTOR).length > 0;

  const detected: DetectedFounder[] = [];

  detected.push(
    ...extractFromJsonLd($, {
      siteOrg,
      headlineCompany,
      isPublicationPage,
      foundedYear,
      hiring: hiringDetection.hiring,
      hiringEvidence: hiringDetection.evidence,
      teamSize,
      location,
      country,
      industry,
      identity,
      pageHost,
      rejections,
    })
  );

  detected.push(
    ...extractTeamCards($, {
      pageCompany: teamCardCompany,
      foundedYear,
      hiring: hiringDetection.hiring,
      hiringEvidence: hiringDetection.evidence,
      teamSize,
      location,
      country,
      industry,
      identity,
      pageHost,
      rejections,
    })
  );

  detected.push(
    ...extractSentenceFounders($, {
      headlineCompany,
      isFundingArticle,
      siteOrg,
      isCompanySite: !isPublicationPage,
      foundedYear,
      hiring: hiringDetection.hiring,
      hiringEvidence: hiringDetection.evidence,
      teamSize,
      industry,
      identity,
      pageHost,
      rejections,
    })
  );

  const founders = mergeFounders(detected).filter((f) => {
    if (!f.name || f.name.length < 4 || f.name.length > 40) return false;
    if (f.name.split(/\s+/).length < 2) return false;
    if (!isLikelyPersonName(f.name)) return false;
    if (f.company && !looksLikeCompany(f.company)) {
      f.company = "";
      rejections.push(REJECT.NO_COMPANY);
    }
    if (f.xUrl) {
      const handle = (f.xUrl.match(/x\.com\/([a-zA-Z0-9_]+)/) || [])[1] || "";
      if (handle && isSourceHandle(handle, identity)) {
        f.xUrl = "";
        rejections.push(REJECT.SOURCE_SOCIAL);
      }
    }
    return true;
  });

  if (founders.length === 0 && hasFounderTerms && hasAuthorByline) {
    rejections.push(REJECT.AUTHOR_NOT_FOUNDER);
  }

  const footerHasSocial =
    $("footer a[href*='x.com'], footer a[href*='twitter.com'], footer a[href*='linkedin.com']").length > 0 ||
    $(".site-footer a[href*='x.com'], .site-footer a[href*='linkedin.com']").length > 0;
  if (footerHasSocial && hasFounderTerms && founders.every((f) => !f.xUrl && !f.linkedinUrl)) {
    rejections.push(REJECT.FOOTER_SOCIAL);
  }

  const listLinks = new Set<string>();
  $("li a[href], .startup a[href], .company-list a[href], .portfolio-item a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (href) listLinks.add(href);
  });
  if (founders.length === 0 && listLinks.size >= 5 && !hasFounderTerms) {
    rejections.push(REJECT.COMPANY_LIST);
  }

  return {
    founders,
    primaryCompany,
    isFundingArticle,
    hiring: hiringDetection.companyHint ? hiringDetection.hiring : null,
    hiringEvidence: hiringDetection.companyHint ? hiringDetection.evidence : "",
    hiringCompanyHint: hiringDetection.companyHint,
    rejectionLog: [...new Set(rejections)],
  };
}

import * as cheerio from "cheerio";
import { detectCountry, AFRICAN_COUNTRIES } from "./africa-config";

export interface DetectedFounder {
  name: string;
  role: string;
  company: string;
  location: string;
  country: string;
  industry: string;
  bio: string;
  xUrl: string;
  linkedinUrl: string;
  personalWebsiteUrl: string;
  companyXUrl: string;
  companyLinkedinUrl: string;
  companyWebsiteUrl: string;
  oneLiner: string;
  teamSize: number;
  foundedYear: number;
  isHiring: boolean;
}

const COMMON_FIRST_NAMES = new Set([
  "ade","adewale","adedayo","ademola","adeola","adekunle","adeniyi","adesola","adewumi",
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
  "victor","vivian",
  "wale","wasiu","william","wunmi",
  "yemi","yinka","yoel","yomi","yusuf",
  "zainab","zakari","zekeri","zion",
  "james","mary","john","patricia","jennifer","michael","linda","william",
  "elizabeth","david","barbara","richard","susan","joseph","jessica","thomas",
  "sarah","christopher","karen","charles","lisa","daniel","nancy","matthew",
  "betty","anthony","margaret","mark","sandra","donald","ashley","steven",
  "andrew","emily","paul","dorothy","joshua","kimberly","kenneth","emily",
  "kevin","brian","george","timothy","ronald","edward","jason","jeffrey",
  "ryan","jacob","gary","nicholas","eric","jonathan","stephen","larry",
  "justin","scott","brandon","benjamin","samuel","raymond","gregory",
  "frank","patrick","jack","dennis","jerry","alexander","tyler","aaron",
  "jose","adam","nathan","henry","peter","zachary","douglas","harold",
  "carl","arthur","gerald","roger","keith","jeremy","terry","lawrence",
  "sean","christian","albert","joe","austin","willie","billy","bruce",
  "ralph","roy","eugene","russell","bobby","martha","debra","rebecca",
  "virginia","kathleen","pamela","anne","katherine","samantha","debra",
  "rachel","carolyn","janet","catherine","maria","heather","diane","ruth",
  "julie","olivia","joyce","virginia","victoria","kelly","lauren",
  "christina","joan","evelyn","judith","megan","andrea","cheryl",
  "hannah","jacqueline","martha","gloria","teresa","ann","sara","madison",
  "frances","kathryn","janice","jean","abigail","alice","judy","sophia",
  "grace","denise","amber","doris","marilyn","danielle","beverly","isabella",
  "theresa","diana","natalie","brittany","charlotte","marie","kayla",
  "alexis","lori",
  "african","nigerian","kenyan","ghanaian","south","egyptian","ethiopian",
  "rwandan","ugandan","tanzanian","moroccan","senegalese","cameroonian",
]);

const ARTICLE_WORDS = new Set([
  "disrupt","africa","techcabal","techpoint","startup","african",
  "fintech","ecosystem","venture","capital","funding","raise","raises","raised","round",
  "series","seed","pre","launch","launches","launched","announce","announces","announced",
  "acquire","acquires","acquired","merge","merges","merged","partners","partnership",
  "new","first","top","best","big","major","global","local","emerging","leading",
  "south","north","east","west","central","sub","saharan",
  "report","news","update","analysis","review","interview","profile","feature","story",
  "the","and","for","with","from","this","that","has","was","are","who","but","not",
  "how","what","why","when","where","which","will","can","may","its","our","their",
]);

const STOPWORDS = new Set([
  "the","and","for","with","from","this","that","has","was","are","who","but","not",
  "how","what","why","when","where","which","will","can","may","its","our","their",
  "into","over","after","before","between","about","under","above","more","most",
  "than","then","also","just","been","have",
]);

function isLikelyPersonName(name: string): boolean {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2 || parts.length > 4) return false;
  const firstName = parts[0].toLowerCase();
  if (!COMMON_FIRST_NAMES.has(firstName)) return false;
  for (const part of parts) {
    if (ARTICLE_WORDS.has(part.toLowerCase())) return false;
    if (STOPWORDS.has(part.toLowerCase())) return false;
  }
  const totalLen = name.length;
  if (totalLen < 4 || totalLen > 40) return false;
  return true;
}

const AFRICAN_LOCATIONS = [
  "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Enugu", "Benin City", "Calabar",
  "Nairobi", "Mombasa", "Kisumu", "Nakuru",
  "Johannesburg", "Cape Town", "Pretoria", "Durban", "Stellenbosch", "Sandton",
  "Accra", "Kumasi", "Tema", "Takoradi",
  "Cairo", "Alexandria", "Giza",
  "Kigali", "Butare",
  "Addis Ababa", "Dire Dawa",
  "Kampala", "Entebbe",
  "Dar es Salaam", "Dodoma",
  "Casablanca", "Rabat", "Marrakech", "Tangier",
  "Dakar", "Thiès",
  "Douala", "Yaoundé",
  "Lusaka", "Kitwe",
  "Harare", "Bulawayo",
  "Tunis", "Sfax",
  "Abidjan", "Bouaké",
  "Maputo", "Beira",
  "Luanda", "Huambo",
  "Lomé", "Sokodé",
  "Porto-Novo", "Cotonou",
  "Kinshasa", "Lubumbashi",
  "Windhoek", "Walvis Bay",
  "Gaborone", "Francistown",
  "Port Louis", "Curepipe",
  "Lilongwe", "Blantyre",
  "Niamey", "Zinder",
  "Bamako", "Sikasso",
  "Ouagadougou", "Bobo-Dioulasso",
  "Conakry", "Nzérékoré",
  "N'Djamena", "Moundou",
  "Libreville", "Port-Gentil",
  "Freetown", "Bo",
  "Monrovia", "Gbarnga",
  "Brazzaville", "Pointe-Noire",
  "Antananarivo", "Toamasina",
  "Asmara", "Keren",
  "Mogadishu", "Hargeisa",
  "Banjul", "Serekunda",
  "Praia", "Mindelo",
];

const INDUSTRIES = [
  "Fintech", "SaaS", "AI", "E-commerce", "Healthtech", "Edtech",
  "Logistics", "Climate", "Media", "Agritech", "Proptech", "Insurtech",
  "Blockchain", "IoT", "Cybersecurity", "Gaming", "HRTech", "Legaltech",
  "Marketplace", "Mobile", "Enterprise", "B2B", "B2C", "DTC",
  "PropTech", "CleanTech", "BioTech", "FoodTech", "TravelTech",
  "Entertainment", "Commerce", "AdTech", "GovTech", "FinTech",
];

const HIRING_KEYWORDS = [
  /\bhir(?:e|ing|s)\b/i,
  /\bjoin\s+(?:our|the)\s+team\b/i,
  /\bwe\s+are\s+(?:hiring|looking\s+for)\b/i,
  /\bwe.re\s+hiring\b/i,
  /\bopen\s+(?:roles?|positions?)\b/i,
  /\bjob\s+(?:openings?|opportunities?)\b/i,
  /\bteam\s+member(?:s)?\b/i,
  /\brecruit(?:ing|ment)?\b/i,
  /\bjoin\s+us\b/i,
  /\bcome\s+work\b/i,
  /\bbuilding\s+the\s+team\b/i,
  /\bgrowing\s+the\s+team\b/i,
];

export function extractSocialLinks($: cheerio.CheerioAPI, contextSelector?: string): {
  xUrl: string;
  linkedinUrl: string;
  personalWebsiteUrl: string;
} {
  let xUrl = "";
  let linkedinUrl = "";
  let personalWebsiteUrl = "";

  const $context = contextSelector ? $(contextSelector) : $('body');
  const links = $context.find('a[href]');

  links.each((_, el) => {
    const href = $(el).attr("href") || "";
    const lowerHref = href.toLowerCase();

    if (!xUrl && (lowerHref.includes("twitter.com/") || lowerHref.includes("x.com/"))) {
      const match = href.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/?$/);
      if (match) {
        const handle = match[1].toLowerCase();
        if (!["home","search","explore","notifications","messages","settings","i","hashtag","login","signup"].includes(handle)) {
          xUrl = `https://x.com/${match[1]}`;
        }
      }
    }

    if (!linkedinUrl && lowerHref.includes("linkedin.com/in/")) {
      const match = href.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)\/?$/);
      if (match) {
        const slug = match[1].toLowerCase();
        if (!["about","company","people","jobs","products","services","contact"].includes(slug)) {
          linkedinUrl = `https://www.linkedin.com/in/${match[1]}`;
        }
      }
    }

    if (
      !personalWebsiteUrl &&
      !lowerHref.includes("twitter.com") &&
      !lowerHref.includes("x.com") &&
      !lowerHref.includes("linkedin.com") &&
      !lowerHref.includes("facebook.com") &&
      !lowerHref.includes("instagram.com") &&
      !lowerHref.includes("youtube.com") &&
      !lowerHref.includes("mailto:") &&
      !lowerHref.includes("tel:") &&
      !lowerHref.includes("javascript:") &&
      (href.startsWith("http://") || href.startsWith("https://"))
    ) {
      try {
        const urlObj = new URL(href);
        const skipDomains = ["google","github","wikipedia","medium","substack","notion","vercel","netlify","amazon","apple","microsoft"];
        if (!skipDomains.some(d => urlObj.hostname.includes(d))) {
          personalWebsiteUrl = href;
        }
      } catch {}
    }
  });

  return { xUrl, linkedinUrl, personalWebsiteUrl };
}

function extractCompanySocialLinks($: cheerio.CheerioAPI): {
  companyXUrl: string;
  companyLinkedinUrl: string;
  companyWebsiteUrl: string;
} {
  let companyXUrl = "";
  let companyLinkedinUrl = "";
  let companyWebsiteUrl = "";

  $('a[href]').each((_, el) => {
    const href = $(el).attr("href") || "";
    const linkText = $(el).text().toLowerCase();
    const lowerHref = href.toLowerCase();

    const isCompanyLink =
      linkText.includes("company") ||
      linkText.includes("startup") ||
      linkText.includes("visit") ||
      linkText.includes("website") ||
      linkText.includes("official") ||
      $(el).closest("header, nav, footer, .company, .startup, .brand").length > 0;

    if (!companyXUrl && (lowerHref.includes("twitter.com/") || lowerHref.includes("x.com/"))) {
      const match = href.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/?$/);
      if (match) {
        const handle = match[1].toLowerCase();
        if (!["home","search","explore","notifications","messages","settings","i","hashtag","login","signup"].includes(handle)) {
          if (isCompanyLink || linkText.includes("twitter") || linkText.includes("@") || lowerHref.includes("x.com")) {
            companyXUrl = `https://x.com/${match[1]}`;
          }
        }
      }
    }

    if (!companyLinkedinUrl && lowerHref.includes("linkedin.com/company/")) {
      const match = href.match(/linkedin\.com\/company\/([a-zA-Z0-9_-]+)\/?$/);
      if (match) {
        companyLinkedinUrl = `https://www.linkedin.com/company/${match[1]}`;
      }
    }

    if (!companyWebsiteUrl && isCompanyLink &&
        (href.startsWith("http://") || href.startsWith("https://")) &&
        !lowerHref.includes("twitter.com") && !lowerHref.includes("x.com") &&
        !lowerHref.includes("linkedin.com") && !lowerHref.includes("facebook.com") &&
        !lowerHref.includes("instagram.com")) {
      try {
        const urlObj = new URL(href);
        const skipDomains = ["google","github","wikipedia","medium","substack","notion"];
        if (!skipDomains.some(d => urlObj.hostname.includes(d))) {
          companyWebsiteUrl = href;
        }
      } catch {}
    }
  });

  return { companyXUrl, companyLinkedinUrl, companyWebsiteUrl };
}

function extractFounderSocialLinks(
  $: cheerio.CheerioAPI,
  founderName: string
): { xUrl: string; linkedinUrl: string; personalWebsiteUrl: string } {
  let xUrl = "";
  let linkedinUrl = "";
  let personalWebsiteUrl = "";

  const nameLower = founderName.toLowerCase();
  const nameSlug = nameLower.replace(/\s+/g, "-");

  $('a[href]').each((_, el) => {
    const href = $(el).attr("href") || "";
    const linkText = $(el).text().toLowerCase();
    const parentText = $(el).parent().text().toLowerCase();
    const nearestText = $(el).closest("div, section, article, li").text().toLowerCase();

    const isNearName =
      linkText.includes(nameLower) ||
      parentText.includes(nameLower) ||
      nearestText.includes(nameLower) ||
      href.toLowerCase().includes(nameSlug);

    if (isNearName) {
      const lowerHref = href.toLowerCase();

      if (!xUrl && (lowerHref.includes("twitter.com/") || lowerHref.includes("x.com/"))) {
        const match = href.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/?$/);
        if (match) {
          const handle = match[1].toLowerCase();
          if (!["home","search","explore","notifications","messages","settings","i","hashtag"].includes(handle)) {
            xUrl = `https://x.com/${match[1]}`;
          }
        }
      }

      if (!linkedinUrl && lowerHref.includes("linkedin.com/in/")) {
        const match = href.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)\/?$/);
        if (match) {
          linkedinUrl = `https://www.linkedin.com/in/${match[1]}`;
        }
      }

      if (
        !personalWebsiteUrl &&
        !lowerHref.includes("twitter.com") &&
        !lowerHref.includes("x.com") &&
        !lowerHref.includes("linkedin.com") &&
        !lowerHref.includes("facebook.com") &&
        !lowerHref.includes("instagram.com") &&
        (href.startsWith("http://") || href.startsWith("https://"))
      ) {
        try {
          const urlObj = new URL(href);
          const skipDomains = ["google","github","wikipedia","medium","substack"];
          if (!skipDomains.some(d => urlObj.hostname.includes(d))) {
            personalWebsiteUrl = href;
          }
        } catch {}
      }
    }
  });

  return { xUrl, linkedinUrl, personalWebsiteUrl };
}

function extractNamesFromText(text: string): string[] {
  const names: string[] = [];
  const namePatterns = [
    /(?:^|[,;:\s)(])((?:[A-Z][a-z]+){2,3})(?:[,;:\s)(]|$)/g,
    /(?:^|[,;:\s)(])([A-Z][a-z]+\s+[A-Z]\.\s+[A-Z][a-z]+)(?:[,;:\s)(]|$)/g,
  ];

  for (const pattern of namePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const name = match[1].trim();
      if (isLikelyPersonName(name)) {
        names.push(name);
      }
    }
  }

  return [...new Set(names)];
}

function detectLocation(text: string): string {
  const lower = text.toLowerCase();
  for (const loc of AFRICAN_LOCATIONS) {
    if (lower.includes(loc.toLowerCase())) {
      return loc;
    }
  }
  return "";
}

function detectIndustry(text: string): string {
  const lower = text.toLowerCase();
  for (const ind of INDUSTRIES) {
    if (lower.includes(ind.toLowerCase())) {
      return ind;
    }
  }
  return "";
}

function extractRole(text: string): string {
  const rolePatterns: [RegExp, string][] = [
    [/\b(ceo\s*&\s*founder|founder\s*&\s*ceo|founder\s+and\s+ceo)\b/i, "Founder & CEO"],
    [/\b(co-?founder\s*&\s*(?:cto|coo|cmo|cfo))\b/i, ""],
    [/\b(co-?founder)\b/i, "Co-founder"],
    [/\b(founder)\b/i, "Founder"],
    [/\b(ceo)\b/i, "CEO"],
    [/\b(cto)\b/i, "CTO"],
    [/\b(coo)\b/i, "COO"],
    [/\b(cfo)\b/i, "CFO"],
    [/\b(cmo)\b/i, "CMO"],
    [/\b(managing\s+director)\b/i, "Managing Director"],
    [/\b(head\s+of)\b/i, "Head of"],
    [/\b(director)\b/i, "Director"],
    [/\b(vp)\b/i, "VP"],
    [/\b(vice\s+president)\b/i, "Vice President"],
    [/\b(partner)\b/i, "Partner"],
  ];

  const lower = text.toLowerCase();
  for (const [pattern, role] of rolePatterns) {
    if (pattern.test(lower)) {
      return role || lower.match(pattern)![1].toUpperCase();
    }
  }
  return "Founder";
}

function extractCompanyFromSentence(sentence: string): string {
  const patterns = [
    /\b(?:founder|co-?founder|ceo|cto|coo|cmo|cfo)\s+(?:of|at)\s+(?:the\s+)?([A-Z][\w\s&.'-]+?)(?:\s+(?:and|is|was|has|in|at|,|\.|who|which)|$)/i,
    /\bfounded\s+(?:by\s+[\w\s,]+\s+)?(?:the\s+)?([A-Z][\w\s&.'-]+?)(?:\s+(?:and|is|was|has|in|at|,|\.|who|which)|$)/i,
    /\bstarted\s+(?:by\s+[\w\s,]+\s+)?(?:the\s+)?([A-Z][\w\s&.'-]+?)(?:\s+(?:and|is|was|has|in|at|,|\.|who|which)|$)/i,
    /\blaunched\s+(?:in\s+\d{4}\s+)?(?:the\s+)?([A-Z][\w\s&.'-]+?)(?:\s+(?:and|is|was|has|in|at|,|\.|who|which)|$)/i,
    /\bcre(?:ated|ates)\s+(?:the\s+)?([A-Z][\w\s&.'-]+?)(?:\s+(?:and|is|was|has|in|at|,|\.|who|which)|$)/i,
    /\bestablished\s+(?:the\s+)?([A-Z][\w\s&.'-]+?)(?:\s+(?:and|is|was|has|in|at|,|\.|who|which)|$)/i,
  ];

  for (const pattern of patterns) {
    const match = sentence.match(pattern);
    if (match) {
      let company = match[1].trim();
      company = company.replace(/\s+(and|is|was|has|in|at|,|\.|who|which)$/, "").trim();
      if (company.length > 1 && company.length < 80 && !isLikelyPersonName(company)) {
        return company;
      }
    }
  }
  return "";
}

function extractFoundedYear(text: string): number {
  const yearPatterns = [
    /(?:founded|started|launched|established|incorporated|born)\s+(?:in\s+)?(\d{4})/i,
    /(?:since|from)\s+(\d{4})/i,
    /(\d{4})\s+(?:founded|started|launched|established)/i,
    /est\.?\s*(\d{4})/i,
    /founded:\s*(\d{4})/i,
  ];
  for (const pattern of yearPatterns) {
    const match = text.match(pattern);
    if (match) {
      const year = parseInt(match[1]);
      if (year >= 2000 && year <= new Date().getFullYear()) {
        return year;
      }
    }
  }
  return 0;
}

function detectHiring(text: string): boolean {
  return HIRING_KEYWORDS.some(kw => kw.test(text));
}

function extractTeamSize(text: string): number {
  const patterns = [
    /(\d+)\+?\s*(?:team\s*member|employee|staff|people\s+in|person)/i,
    /team\s+(?:of\s+)?(\d+)/i,
    /(\d+)\+?\s*(?:person|member)/i,
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

export function detectFoundersOnPage(
  $: cheerio.CheerioAPI,
  html: string,
  url: string
): DetectedFounder[] {
  const founders: DetectedFounder[] = [];
  const text = $("body").text() || "";
  const lowerText = text.toLowerCase();

  const founderMentionPatterns = [
    /\bco-?founder\b/i,
    /\bfounder\b/i,
    /\bfounded\s+by\b/i,
    /\bstarted\s+by\b/i,
    /\blaunched\s+by\b/i,
    /\bceo\s+(?:of|at)\b/i,
    /\bcto\s+(?:of|at)\b/i,
    /\bfounding\s+(?:member|team|partner|ceo)\b/i,
    /\bentrepreneur\b/i,
    /\bbuilt\s+by\b/i,
    /\bcreated\s+by\b/i,
    /\bestablished\s+by\b/i,
    /\bbrainchild\s+of\b/i,
    /\bserial\s+entrepreneur\b/i,
  ];

  const hasFounderMention = founderMentionPatterns.some(kw => kw.test(lowerText));
  if (!hasFounderMention) {
    return founders;
  }

  const foundedYear = extractFoundedYear(text);
  const isHiring = detectHiring(text);
  const teamSize = extractTeamSize(text);
  const location = detectLocation(text);
  const country = detectCountry(text);
  const industry = detectIndustry(text);

  const jsonLdScripts = $('script[type="application/ld+json"]');
  const companySocial = extractCompanySocialLinks($);

  jsonLdScripts.each((_, el) => {
    try {
      const raw = $(el).html() || "";
      const data = JSON.parse(raw);

      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item["@type"] === "Person" || item["@type"] === "Organization") {
          if (item.name && (item.jobTitle || item.role || item.description)) {
            const title = (item.jobTitle || item.role || "").toLowerCase();
            if (title.includes("founder") || title.includes("ceo") || title.includes("cto") || title.includes("entrepreneur")) {
              if (isLikelyPersonName(item.name)) {
                const socialLinks = extractSocialLinks($);
                const detectedCountry = detectCountry(item.description || item.name || "");
                founders.push({
                  name: item.name,
                  role: extractRole(title),
                  company: item.worksFor?.name || item.memberOf?.name || "",
                  location: item.address?.addressLocality || location,
                  country: detectedCountry || country,
                  industry: industry || detectIndustry(item.description || ""),
                  bio: (item.description || "").replace(/<[^>]*>/g, "").slice(0, 500),
                  oneLiner: "",
                  teamSize,
                  foundedYear,
                  isHiring,
                  ...socialLinks,
                  ...companySocial,
                });
              }
            }
          }
        }

        if (item["@type"] === "Organization" && item.founder) {
          const foundersArr = Array.isArray(item.founder) ? item.founder : [item.founder];
          for (const f of foundersArr) {
            if (f.name && isLikelyPersonName(f.name)) {
              const socialLinks = extractSocialLinks($);
              const fCountry = detectCountry(f.name + " " + (f.description || ""));
              founders.push({
                name: f.name,
                role: f.jobTitle || "Founder",
                company: item.name || "",
                location: f.address?.addressLocality || location,
                country: fCountry || country,
                industry,
                bio: (f.description || "").replace(/<[^>]*>/g, "").slice(0, 500),
                oneLiner: "",
                teamSize,
                foundedYear,
                isHiring,
                ...socialLinks,
                ...companySocial,
              });
            }
          }
        }
      }
    } catch {}
  });

  const sentences = text.split(/[.!?\n]+/);
  const founderSentences = sentences.filter(sentence => {
    const lower = sentence.toLowerCase();
    return founderMentionPatterns.some(kw => kw.test(lower));
  });

  for (const sentence of founderSentences) {
    const names = extractNamesFromText(sentence);

    for (const name of names) {
      const isDuplicate = founders.some(
        (f) => f.name.toLowerCase() === name.toLowerCase()
      );
      if (!isDuplicate) {
        const company = extractCompanyFromSentence(sentence);
        const socialLinks = extractFounderSocialLinks($, name);
        const sentenceCountry = detectCountry(sentence);

        founders.push({
          name,
          role: extractRole(sentence),
          company,
          location: detectLocation(sentence),
          country: sentenceCountry || country,
          industry: detectIndustry(sentence),
          bio: sentence.trim().slice(0, 500),
          oneLiner: "",
          teamSize,
          foundedYear,
          isHiring,
          ...socialLinks,
          ...companySocial,
        });
      }
    }
  }

  return founders.filter(f => {
    if (!f.name || f.name.length < 4) return false;
    if (f.name.length > 40) return false;
    if (f.name.split(/\s+/).length < 2) return false;
    return true;
  });
}

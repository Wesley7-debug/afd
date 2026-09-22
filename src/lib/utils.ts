import slugify from "slugify";

export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "")
    .replace(/\b(ltd|limited|inc|llc|corp|co)\b\.?/g, "")
    .trim();
}

export function normalizeFounderName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b(dr|mr|mrs|ms|prof|chief|eng)\.?\s*/g, "")
    .replace(/[^\w\s]/g, "")
    .trim();
}

export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b(ltd|limited|inc|llc|corp|co|technologies?|tech|solutions?|enterprises?|ventures?|group|holdings?)\b\.?/g, "")
    .replace(/[^\w\s]/g, "")
    .trim();
}

export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isSameDomain(url: string, baseUrl: string): boolean {
  try {
    const urlObj = new URL(url);
    const baseObj = new URL(baseUrl);
    return urlObj.hostname === baseObj.hostname;
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string, baseUrl: string): string {
  try {
    const urlObj = new URL(url, baseUrl);
    urlObj.hash = "";
    const path = urlObj.pathname.replace(/\/+$/, "") || "/";
    return `${urlObj.origin}${path}${urlObj.search}`;
  } catch {
    return url;
  }
}

export function shouldSkipUrl(url: string): boolean {
  const skipPatterns = [
    /\.(jpg|jpeg|png|gif|svg|webp|ico|bmp|tiff)$/i,
    /\.(mp4|mp3|avi|mov|wmv|flv|webm|ogg|wav)$/i,
    /\.(css|scss|sass|less)$/i,
    /\.(js|jsx|ts|tsx|mjs|cjs)$/i,
    /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|gz)$/i,
    /\/login/i,
    /\/signup/i,
    /\/register/i,
    /\/signin/i,
    /\/auth/i,
    /\/payment/i,
    /\/checkout/i,
    /\/cart/i,
    /mailto:/i,
    /tel:/i,
    /javascript:/i,
    /#/i,
    /\/wp-admin/i,
    /\/wp-login/i,
    /\/feed$/i,
    /\/rss$/i,
    /\/atom$/i,
    /\/sitemap/i,
    /\/tag\//i,
    /\/category\//i,
    /\/author\//i,
    /\/page\/\d+$/i,
  ];

  return skipPatterns.some((pattern) => pattern.test(url));
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}

export function buildFounderQuery(searchParams: URLSearchParams): Record<string, unknown> {
  const query: Record<string, unknown> = {};

  const search = searchParams.get("search") || searchParams.get("q") || "";
  const industry = searchParams.get("industry") || "";
  const location = searchParams.get("location") || "";
  const country = searchParams.get("country") || "";
  const role = searchParams.get("role") || "";
  const hasX = searchParams.get("hasX") === "true";
  const isHiring = searchParams.get("isHiring") === "true";
  const notHiring = searchParams.get("notHiring") === "true";
  const foundedYear = searchParams.get("foundedYear") || "";
  const foundedYearRange = searchParams.get("foundedYearRange") || "";
  const discoveredAfter = searchParams.get("discoveredAfter") || "";

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { industry: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } },
      { bio: { $regex: search, $options: "i" } },
      { xHandle: { $regex: search, $options: "i" } },
      { oneLiner: { $regex: search, $options: "i" } },
    ];
  }

  if (industry) {
    const industries = industry.split(",").map((s) => s.trim()).filter(Boolean);
    query.industry = industries.length === 1 ? industries[0] : { $in: industries };
  }

  if (location) {
    const locations = location.split(",").map((s) => s.trim()).filter(Boolean);
    query.location = locations.length === 1 ? locations[0] : { $in: locations };
  }

  if (country) {
    const countries = country.split(",").map((s) => s.trim()).filter(Boolean);
    query.country = countries.length === 1 ? countries[0] : { $in: countries };
  }

  if (role) {
    const roles = role.split(",").map((s) => s.trim()).filter(Boolean);
    query.role =
      roles.length === 1
        ? { $regex: roles[0], $options: "i" }
        : { $in: roles.map((r) => new RegExp(r, "i")) };
  }

  if (hasX) query.xUrl = { $ne: "" };
  if (isHiring) query.isHiring = true;
  if (notHiring) query.isHiring = { $ne: true };

  if (foundedYearRange) {
    const [from, to] = foundedYearRange.split("-").map((y) => parseInt(y.trim(), 10));
    if (!isNaN(from) && !isNaN(to)) {
      query.foundedYear = { $gte: from, $lte: to };
    }
  } else if (foundedYear) {
    const years = foundedYear.split(",").map((s) => parseInt(s.trim(), 10)).filter((y) => !isNaN(y));
    if (years.length === 1) query.foundedYear = years[0];
    else if (years.length > 1) query.foundedYear = { $in: years };
  }

  if (discoveredAfter) {
    query.discoveredAt = { $gt: new Date(discoveredAfter) };
  }

  return query;
}

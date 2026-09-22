import { connectDB } from "@/lib/mongodb";
import { CrawlSource } from "@/models";

const INITIAL_SOURCES = [
  // --- Africa-wide & Pan-African News & Media ---
  {
    name: "TechCabal",
    baseUrl: "https://techcabal.com/",
    country: "Nigeria",
    category: "Startup News",
  },
  {
    name: "Techpoint Africa",
    baseUrl: "https://techpoint.africa/",
    country: "Africa",
    category: "Startup News",
  },
  {
    name: "Disrupt Africa",
    baseUrl: "https://disruptafrica.com/",
    country: "Africa",
    category: "Startup News",
  },
  {
    name: "Ventures Africa",
    baseUrl: "https://venturesafrica.com/",
    country: "Africa",
    category: "Business Publications",
  },
  {
    name: "Forbes Africa",
    baseUrl: "https://forbesafrica.com/",
    country: "Africa",
    category: "Business Publications",
  },
  {
    name: "How We Made It in Africa",
    baseUrl: "https://howwemadeitinafrica.com/",
    country: "Africa",
    category: "Business Publications",
  },
  {
    name: "Africa Business Communities",
    baseUrl: "https://africabusinesscommunities.com/",
    country: "Africa",
    category: "Business Publications",
  },
  {
    name: "Startup Africa News",
    baseUrl: "https://startupafricanews.com/",
    country: "Africa",
    category: "Startup News",
  },
  {
    name: "WeTracker",
    baseUrl: "https://wetracker.com/",
    country: "Africa",
    category: "Startup News",
  },
  {
    name: "Semafor Africa",
    baseUrl: "https://www.semafor.com/africa",
    country: "Africa",
    category: "Business Publications",
  },
  {
    name: "Rest of World Africa",
    baseUrl: "https://restofworld.org/region/africa/",
    country: "Africa",
    category: "Tech Publications",
  },

  // --- Funding Databases & Market Intelligence ---
  {
    name: "Africa: The Big Deal",
    baseUrl: "https://africathebigdeal.substack.com/",
    country: "Africa",
    category: "Funding Databases",
  },
  {
    name: "Briter Bridges",
    baseUrl: "https://briterbridges.com/",
    country: "Africa",
    category: "Funding Databases",
  },
  {
    name: "Dealroom Africa",
    baseUrl: "https://dealroom.co/guides/african-startups",
    country: "Africa",
    category: "Funding Databases",
  },
  {
    name: "CB Insights Africa",
    baseUrl: "https://www.cbinsights.com/research/report/africa-tech-trends/",
    country: "Africa",
    category: "Funding Databases",
  },
  {
    name: "MAGNiTT",
    baseUrl: "https://magnitt.com/",
    country: "Africa",
    category: "Funding Databases",
  },
  {
    name: "Startup Genome Africa",
    baseUrl: "https://startupgenome.com/",
    country: "Africa",
    category: "Funding Databases",
  },
  {
    name: "Stears",
    baseUrl: "https://www.stears.co/",
    country: "Africa",
    category: "Funding Databases",
  },

  // --- Startup Directories & Pan-African Ecosystem Networks ---
  {
    name: "Startup List Africa",
    baseUrl: "https://www.startuplist.africa/",
    country: "Africa",
    category: "Startup Directories",
  },
  {
    name: "AU Startups",
    baseUrl: "https://www.au-startups.com/",
    country: "Africa",
    category: "Startup Directories",
  },
  {
    name: "African Startups Database",
    baseUrl: "https://africanstartups.io/",
    country: "Africa",
    category: "Startup Directories",
  },
  {
    name: "VC4A",
    baseUrl: "https://vc4a.com/",
    country: "Africa",
    category: "Startup Directories",
  },
  {
    name: "Tech in Africa",
    baseUrl: "https://techinafrica.com/",
    country: "Africa",
    category: "Tech Publications",
  },
  {
    name: "AfriTech News",
    baseUrl: "https://afritech.news/",
    country: "Africa",
    category: "Tech Publications",
  },
  {
    name: "Digital Africa",
    baseUrl: "https://digital-africa.co/",
    country: "Africa",
    category: "Tech Publications",
  },
  {
    name: "Innovation Hub Africa",
    baseUrl: "https://innovationhubafrica.com/",
    country: "Africa",
    category: "Tech Publications",
  },
  {
    name: "Smart Africa",
    baseUrl: "https://smartafrica.org/",
    country: "Africa",
    category: "Startup Directories",
  },

  // --- Nigeria Ecosystem ---
  {
    name: "Nairametrics",
    baseUrl: "https://nairametrics.com/",
    country: "Nigeria",
    category: "Business Publications",
  },
  {
    name: "Benjamindada.com",
    baseUrl: "https://www.benjamindada.com/",
    country: "Nigeria",
    category: "Startup News",
  },
  {
    name: "Nigerian Finder",
    baseUrl: "https://nigerianfinder.com/",
    country: "Nigeria",
    category: "Startup Directories",
  },
  {
    name: "Startup Nigeria",
    baseUrl: "https://startupnigeria.ng/",
    country: "Nigeria",
    category: "Startup Directories",
  },
  {
    name: "Nigeria Startup Report",
    baseUrl: "https://nigerianstartupreport.com/",
    country: "Nigeria",
    category: "Startup News",
  },
  {
    name: "StartupDigest Nigeria",
    baseUrl: "https://startupdigest.com/locations/lagos/",
    country: "Nigeria",
    category: "Startup News",
  },
  {
    name: "Lagos Startup Map",
    baseUrl: "https://lagosstartupmap.com/",
    country: "Nigeria",
    category: "Startup Directories",
  },
  {
    name: "The Tech Guy",
    baseUrl: "https://thetechguy.ng/",
    country: "Nigeria",
    category: "Tech Publications",
  },
  {
    name: "Tech Ecosystem Nigeria",
    baseUrl: "https://techecosystem.ng/",
    country: "Nigeria",
    category: "Tech Publications",
  },
  {
    name: "Startup Act Nigeria",
    baseUrl: "https://startupact.ng/",
    country: "Nigeria",
    category: "Startup Directories",
  },

  // --- Kenya & East Africa Ecosystem ---
  {
    name: "Techweez",
    baseUrl: "https://techweez.com/",
    country: "Kenya",
    category: "Tech Publications",
  },
  {
    name: "TechMoran",
    baseUrl: "https://techmoran.com/",
    country: "Kenya",
    category: "Tech Publications",
  },
  {
    name: "Disrupt Kenya",
    baseUrl: "https://disruptafrica.com/kenya/",
    country: "Kenya",
    category: "Startup News",
  },
  {
    name: "Business Daily Africa",
    baseUrl: "https://www.businessdailyafrica.com/",
    country: "Kenya",
    category: "Business Publications",
  },
  {
    name: "Tech Trends KE",
    baseUrl: "https://techtrendske.co.ke/",
    country: "Kenya",
    category: "Tech Publications",
  },
  {
    name: "Kenya Startups Directory",
    baseUrl: "https://www.kenyaweb.com/startups/",
    country: "Kenya",
    category: "Startup Directories",
  },
  {
    name: "Shega",
    baseUrl: "https://shega.co/",
    country: "Ethiopia",
    category: "Startup News",
  },
  {
    name: "Disrupt Ethiopia",
    baseUrl: "https://disruptafrica.com/ethiopia/",
    country: "Ethiopia",
    category: "Startup News",
  },
  {
    name: "Dignited",
    baseUrl: "https://dignited.com/",
    country: "Uganda",
    category: "Tech Publications",
  },
  {
    name: "Innovation Village Uganda",
    baseUrl: "https://innovationvillage.co.ug/",
    country: "Uganda",
    category: "Startup News",
  },
  {
    name: "Disrupt Uganda",
    baseUrl: "https://disruptafrica.com/uganda/",
    country: "Uganda",
    category: "Startup News",
  },
  {
    name: "Disrupt Tanzania",
    baseUrl: "https://disruptafrica.com/tanzania/",
    country: "Tanzania",
    category: "Startup News",
  },

  // --- South Africa & Southern Africa Ecosystem ---
  {
    name: "Ventureburn",
    baseUrl: "https://ventureburn.com/",
    country: "South Africa",
    category: "Tech Publications",
  },
  {
    name: "TechCentral",
    baseUrl: "https://techcentral.co.za/",
    country: "South Africa",
    category: "Tech Publications",
  },
  {
    name: "ITWeb",
    baseUrl: "https://www.itweb.co.za/",
    country: "South Africa",
    category: "Tech Publications",
  },
  {
    name: "Fin24 Tech",
    baseUrl: "https://www.news24.com/fin24/tech",
    country: "South Africa",
    category: "Business Publications",
  },
  {
    name: "Disrupt South Africa",
    baseUrl: "https://disruptafrica.com/south-africa/",
    country: "South Africa",
    category: "Startup News",
  },
  {
    name: "SA Startup News",
    baseUrl: "https://www.startupcentral.co.za/",
    country: "South Africa",
    category: "Startup News",
  },
  {
    name: "Top Tech SA",
    baseUrl: "https://www.toptech.co.za/",
    country: "South Africa",
    category: "Tech Publications",
  },

  // --- North Africa & MENA Ecosystem ---
  {
    name: "Wamda",
    baseUrl: "https://www.wamda.com/",
    country: "Egypt",
    category: "Startup News",
  },
  {
    name: "Enterprise MENA",
    baseUrl: "https://enterprise.press/",
    country: "Egypt",
    category: "Business Publications",
  },
  {
    name: "WAYA Media",
    baseUrl: "https://waya.media/",
    country: "Egypt",
    category: "Startup News",
  },
  {
    name: "Disrupt Egypt",
    baseUrl: "https://disruptafrica.com/egypt/",
    country: "Egypt",
    category: "Startup News",
  },
  {
    name: "Egypt Innovate",
    baseUrl: "https://www.egyptinnovate.com/",
    country: "Egypt",
    category: "Startup Directories",
  },
  {
    name: "Disrupt Morocco",
    baseUrl: "https://disruptafrica.com/morocco/",
    country: "Morocco",
    category: "Startup News",
  },
  {
    name: "Medias24 Tech",
    baseUrl: "https://medias24.com/",
    country: "Morocco",
    category: "Business Publications",
  },

  // --- Francophone West & Central Africa Ecosystem ---
  {
    name: "Le Tech Observer",
    baseUrl: "https://letechobserver.com/",
    country: "Senegal",
    category: "Tech Publications",
  },
  {
    name: "Disrupt Senegal",
    baseUrl: "https://disruptafrica.com/senegal/",
    country: "Senegal",
    category: "Startup News",
  },
  {
    name: "CIO Mag Africa",
    baseUrl: "https://cio-mag.com/",
    country: "Africa",
    category: "Tech Publications",
  },
  {
    name: "Financial Afrik",
    baseUrl: "https://www.financialafrik.com/",
    country: "Africa",
    category: "Business Publications",
  },
  {
    name: "Digital Business Africa",
    baseUrl: "https://www.digitalbusiness.africa/",
    country: "Cameroon",
    category: "Tech Publications",
  },
  {
    name: "Disrupt Cameroon",
    baseUrl: "https://disruptafrica.com/cameroon/",
    country: "Cameroon",
    category: "Startup News",
  },
  {
    name: "Disrupt Ghana",
    baseUrl: "https://disruptafrica.com/ghana/",
    country: "Ghana",
    category: "Startup News",
  },
  {
    name: "Ghana Startups",
    baseUrl: "https://ghanastartups.com/",
    country: "Ghana",
    category: "Startup Directories",
  },
  {
    name: "Disrupt Rwanda",
    baseUrl: "https://disruptafrica.com/rwanda/",
    country: "Rwanda",
    category: "Startup News",
  },
  {
    name: "Rwanda Startups",
    baseUrl: "https://www.rwandastartups.com/",
    country: "Rwanda",
    category: "Startup Directories",
  },

  // --- Accelerators & Incubators ---
  {
    name: "Africa's Business Heroes",
    baseUrl: "https://africabusinessheroes.org/",
    country: "Africa",
    category: "Accelerators",
  },
  {
    name: "Africans4Future",
    baseUrl: "https://africans4future.org/",
    country: "Africa",
    category: "Accelerators",
  },
  {
    name: "Google for Startups Africa",
    baseUrl: "https://startupslab.withgoogle.com/",
    country: "Africa",
    category: "Accelerators",
  },
  {
    name: "Techstars Africa",
    baseUrl: "https://www.techstars.com/",
    country: "Africa",
    category: "Accelerators",
  },
  {
    name: "Y Combinator",
    baseUrl: "https://www.ycombinator.com/",
    country: "Africa",
    category: "Accelerators",
  },
  {
    name: "Founders Factory Africa",
    baseUrl: "https://foundersfactory.co/",
    country: "Africa",
    category: "Accelerators",
  },
  {
    name: "The Baobab Network",
    baseUrl: "https://thebaobabnetwork.com/",
    country: "Africa",
    category: "Accelerators",
  },
  {
    name: "Tony Elumelu Foundation",
    baseUrl: "https://tonyelumelufoundation.org/",
    country: "Nigeria",
    category: "Accelerators",
  },
  {
    name: "MEST Africa",
    baseUrl: "https://meltwater.org/",
    country: "Ghana",
    category: "Accelerators",
  },
  {
    name: "Flat6Labs",
    baseUrl: "https://www.flat6labs.com/",
    country: "Egypt",
    category: "Accelerators",
  },
  {
    name: "250STARTUPS",
    baseUrl: "https://250startups.rw/",
    country: "Rwanda",
    category: "Accelerators",
  },
  {
    name: "CcHUB (Co-Creation Hub)",
    baseUrl: "https://cchub.africa/",
    country: "Nigeria",
    category: "Incubators",
  },
  {
    name: "AfriLabs",
    baseUrl: "https://afrilabs.com/",
    country: "Africa",
    category: "Incubators",
  },
  {
    name: "iHub Kenya",
    baseUrl: "https://ihub.co.ke/",
    country: "Kenya",
    category: "Incubators",
  },
  {
    name: "Buni Hub",
    baseUrl: "https://buni.or.tz/",
    country: "Tanzania",
    category: "Incubators",
  },

  // --- Venture Capital Firms & Investment Funds ---
  {
    name: "Partech Africa",
    baseUrl: "https://partechpartners.com/",
    country: "Africa",
    category: "VC Portfolios",
  },
  {
    name: "TLcom Capital",
    baseUrl: "https://tlcom.com/",
    country: "Africa",
    category: "VC Portfolios",
  },
  {
    name: "Novastar Ventures",
    baseUrl: "https://novastarventures.com/",
    country: "Africa",
    category: "VC Portfolios",
  },
  {
    name: "Norrsken 22",
    baseUrl: "https://www.norrsken22.org/",
    country: "Africa",
    category: "VC Portfolios",
  },
  {
    name: "4DX Ventures",
    baseUrl: "https://www.4dxventures.com/",
    country: "Africa",
    category: "VC Portfolios",
  },
  {
    name: "P1 Ventures",
    baseUrl: "https://p1.ventures/",
    country: "Africa",
    category: "VC Portfolios",
  },
  {
    name: "Unicorn Growth Capital",
    baseUrl: "https://www.unicorn.vc/",
    country: "Africa",
    category: "VC Portfolios",
  },
  {
    name: "Speedinvest Africa",
    baseUrl: "https://www.speedinvest.com/",
    country: "Africa",
    category: "VC Portfolios",
  },
  {
    name: "Ventures Platform",
    baseUrl: "https://venturesplatform.com/",
    country: "Nigeria",
    category: "VC Portfolios",
  },
  {
    name: "Future Africa",
    baseUrl: "https://futureafrica.io/",
    country: "Nigeria",
    category: "VC Portfolios",
  },
  {
    name: "Microtraction",
    baseUrl: "https://microtraction.com/",
    country: "Nigeria",
    category: "VC Portfolios",
  },
  {
    name: "Ingressive Capital",
    baseUrl: "https://www.ingressivecapital.com/",
    country: "Nigeria",
    category: "VC Portfolios",
  },
  {
    name: "Greenhouse Capital",
    baseUrl: "https://greenhousecapital.io/",
    country: "Nigeria",
    category: "VC Portfolios",
  },
  {
    name: "Verod Capital",
    baseUrl: "https://verodcapital.com/",
    country: "Nigeria",
    category: "VC Portfolios",
  },
  {
    name: "LoftyInc Capital",
    baseUrl: "https://loftyinccapital.vc/",
    country: "Nigeria",
    category: "VC Portfolios",
  },
  {
    name: "FirstCheck Africa",
    baseUrl: "https://firstcheck.africa/",
    country: "Nigeria",
    category: "VC Portfolios",
  },
  {
    name: "Savannah Fund",
    baseUrl: "https://savannah.vc/",
    country: "Kenya",
    category: "VC Portfolios",
  },
  {
    name: "Enza Capital",
    baseUrl: "https://enza.capital/",
    country: "Kenya",
    category: "VC Portfolios",
  },
  {
    name: "Launch Africa Ventures",
    baseUrl: "https://launchafrica.vc/",
    country: "South Africa",
    category: "VC Portfolios",
  },
  {
    name: "Kalon Venture Partners",
    baseUrl: "https://www.kalonvp.com/",
    country: "South Africa",
    category: "VC Portfolios",
  },
  {
    name: "Algebra Ventures",
    baseUrl: "https://algebraventures.com/",
    country: "Egypt",
    category: "VC Portfolios",
  },
  {
    name: "Sawari Ventures",
    baseUrl: "https://sawariventures.com/",
    country: "Egypt",
    category: "VC Portfolios",
  },
  {
    name: "DisrupTech Ventures",
    baseUrl: "https://disruptech.vc/",
    country: "Egypt",
    category: "VC Portfolios",
  },

  // --- Angel Networks & Investment Groups ---
  {
    name: "ABAN (African Business Angel Network)",
    baseUrl: "https://abanangels.org/",
    country: "Africa",
    category: "VC Portfolios",
  },
  {
    name: "Africa Angel Network",
    baseUrl: "https://africaangelnetwork.com/",
    country: "Africa",
    category: "VC Portfolios",
  },
  {
    name: "Lagos Angel Network",
    baseUrl: "https://lagosangelnetwork.com/",
    country: "Nigeria",
    category: "VC Portfolios",
  },
  {
    name: "Rising Tide Africa",
    baseUrl: "https://risingtideafrica.com/",
    country: "Nigeria",
    category: "VC Portfolios",
  },
  {
    name: "VestedWorld",
    baseUrl: "https://www.vestedworld.com/",
    country: "Africa",
    category: "VC Portfolios",
  },
  {
    name: "Cairo Angels",
    baseUrl: "https://cairoangels.com/",
    country: "Egypt",
    category: "VC Portfolios",
  },
  {
    name: "Jozi Angels",
    baseUrl: "https://www.joziangels.co.za/",
    country: "South Africa",
    category: "VC Portfolios",
  },
  {
    name: "Victoria Ventures Academy",
    baseUrl: "https://vva.africa/",
    country: "Kenya",
    category: "VC Portfolios",
  },
];

export async function seedInitialSources() {
  await connectDB();

  let created = 0;
  for (const source of INITIAL_SOURCES) {
    const exists = await CrawlSource.findOne({ baseUrl: source.baseUrl });
    if (!exists) {
      await CrawlSource.create({
        ...source,
        enabled: true,
        nextCrawlAt: new Date(),
      });
      created++;
    }
  }

  console.log(
    `[Seed] ${created} new sources created (${INITIAL_SOURCES.length} total)`,
  );
}

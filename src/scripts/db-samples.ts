import mongoose from "mongoose";
import Founder from "../models/Founder";
import Company from "../models/Company";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const total = await Founder.countDocuments();
  const withCompany = await Founder.countDocuments({ companies: { $exists: true, $ne: [] } });
  const withX = await Founder.countDocuments({ $or: [{ xUrl: { $ne: "" } }, { xHandle: { $ne: "" } }] });
  const withSentence = await Founder.countDocuments({ sourceSentence: { $ne: "" } });
  const hiringTrue = await Founder.countDocuments({ isHiring: true });
  const hiringNull = await Founder.countDocuments({ isHiring: null });
  console.log(`founders=${total} withCompany=${withCompany} withX=${withX} withSourceSentence=${withSentence} hiringTrue=${hiringTrue} hiringNull=${hiringNull}`);

  const founders = await Founder.find({})
    .populate("companies", "name")
    .limit(10)
    .lean();
  for (const f of founders) {
    const cos = (f.companies as unknown as { name: string }[] | null)?.map((c) => c.name).join(", ") || "-";
    console.log(`- ${f.name} | companies=${cos} | x=${f.xHandle || f.xUrl || "-"} | email=${f.email || "-"} | hiring=${f.isHiring}`);
    console.log(`  sent: ${(f.sourceSentence || "").slice(0, 110)}`);
  }

  const cos = await Company.find({}).lean();
  console.log(`companies=${cos.length}`);
  for (const c of cos.slice(0, 10)) {
    console.log(`- ${c.name} | hiring=${c.isHiring} | ev=${(c.hiringEvidence || "").slice(0, 70)}`);
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

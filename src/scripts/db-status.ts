import mongoose from "mongoose";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const db = mongoose.connection.db!;
  const q = db.collection("crawlurlqueues");
  const byStatus = await q.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]).toArray();
  console.log("queue by status:", JSON.stringify(byStatus));
  console.log("founders:", await db.collection("founders").countDocuments());
  console.log("companies:", await db.collection("companies").countDocuments());
  const f = await db.collection("founders").findOne({});
  if (f) {
    console.log("sample founder:", f.name, "| xUrl:", f.xUrl || "-", "| hiring:", f.isHiring, "| srcSent:", (f.sourceSentence || "").slice(0, 80));
  }
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

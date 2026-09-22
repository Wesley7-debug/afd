import mongoose from "mongoose";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const db = mongoose.connection.db!;
  const companies = db.collection("companies");
  const founders = db.collection("founders");

  const garbage = await companies
    .find({}, { projection: { name: 1 } })
    .toArray()
    .then((rows) =>
      rows.filter((r) => {
        const n = (r.name || "").trim();
        if (/^by\s+/i.test(n)) return true;
        if (n.split(/\s+/).length > 5) return true;
        return false;
      })
    );

  const ids = garbage.map((g) => g._id);
  console.log("deleting garbage companies:", garbage.map((g) => g.name));
  if (ids.length > 0) {
    const res = await companies.deleteMany({ _id: { $in: ids } });
    const pull = await founders.updateMany({}, { $pull: { companies: { $in: ids } } });
    console.log("deleted:", res.deletedCount, "| founder refs pulled:", pull.modifiedCount);
  } else {
    console.log("nothing to delete");
  }
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

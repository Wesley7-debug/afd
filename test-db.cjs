const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://nfd:g7ZeVNGDBACqDb01@ac-vlsfgoj-shard-00-00.ylzwses.mongodb.net:27017,ac-vlsfgoj-shard-00-01.ylzwses.mongodb.net:27017,ac-vlsfgoj-shard-00-02.ylzwses.mongodb.net:27017/?ssl=true&replicaSet=atlas-l1cq0l-shard-0&authSource=admin&appName=Cluster0';

async function test() {
  try {
    console.log('Connecting...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected!');
    const db = mongoose.connection.db;
    const cols = await db.listCollections().toArray();
    console.log('Collections:', cols.map(c => c.name));
    for (const col of cols) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  ${col.name}: ${count} documents`);
    }
    await mongoose.disconnect();
    console.log('Done.');
  } catch (err) {
    console.error('FAILED:', err.message);
  }
}
test();

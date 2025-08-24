import { MongoClient, ServerApiVersion } from 'mongodb';
const uri = "mongodb+srv://admin:admin@cluster1.x8bbsz2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// async function run() {
//    return await client.connect();
// }
// run();
export default client
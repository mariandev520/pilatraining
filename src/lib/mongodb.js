import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://mardev520:sauro333@cluster0.4meji.mongodb.net/test?retryWrites=true&w=majority";
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('⚠️ Por favor define MONGODB_URI en .env.local');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
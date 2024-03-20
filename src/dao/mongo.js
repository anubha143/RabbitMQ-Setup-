const { MongoClient } = require("mongodb");
require("dotenv").config();

const url = process.env.MONGO_URL;

const client = new MongoClient(url, {
  appName: "inventory-management",
  maxPoolSize: 20,
  minPoolSize: 5,
});

let db = null;

async function mongo() {
  if (db) {
    console.log("using cached connected to mongo");
    return db;
  }
  await client.connect();
  console.log("connected successfully to database");
  db = client.db("inventory-management");
  return db;
}

module.exports = mongo;

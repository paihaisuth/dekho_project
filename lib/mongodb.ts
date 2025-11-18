import { MongoClient } from "mongodb";

const CONNECTION_STRING = process.env.CONNECTION_STRING;

if (!CONNECTION_STRING)
  throw new Error("MongoDB connection string not provided");

const mongoDBConnectionString = CONNECTION_STRING;

const client = new MongoClient(mongoDBConnectionString);

export const mongoClient = client;

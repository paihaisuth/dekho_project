import { Collection } from "mongodb";
import { mongoClient } from "./mongodb";
import { Icontract } from "@/schema";

const databaseName = process.env.DATABASE_NAME;

if (!databaseName) throw new Error("Database name not provided");

export const contractConnection: Collection<Icontract> = mongoClient
  .db(databaseName)
  .collection<Icontract>("contracts");

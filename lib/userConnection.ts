import { Iuser } from "@/schema";
import { mongoClient } from "./mongodb";
import type { Collection } from "mongodb";

const databaseName = process.env.DATABASE_NAME;

if (!databaseName) throw new Error("Database name not provided");

export const userConnection: Collection<Iuser> = mongoClient
  .db(databaseName)
  .collection<Iuser>("users");

import { mongoClient } from "./mongodb";
import type { Collection } from "mongodb";
import dotenv from "dotenv";
import Ifile from "@/schema/File";

dotenv.config();

const databaseName = process.env.DATABASE_NAME;

if (!databaseName) throw new Error("Database name not provided");

export const fileConnection: Collection<Ifile> = mongoClient
  .db(databaseName)
  .collection<Ifile>("files");

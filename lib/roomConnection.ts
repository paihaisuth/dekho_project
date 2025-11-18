import { Collection } from "mongodb";
import { mongoClient } from "./mongodb";
import { Iroom } from "@/schema";
import dotenv from "dotenv";

dotenv.config();

const databaseName = process.env.DATABASE_NAME;

if (!databaseName) throw new Error("Database name not provided");

export const roomConnection: Collection<Iroom> = mongoClient
  .db(databaseName)
  .collection<Iroom>("rooms");

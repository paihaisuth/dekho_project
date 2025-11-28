import { mongoClient } from "./mongodb";
import type { Collection } from "mongodb";
import dotenv from "dotenv";
import IrepairRequest from "@/schema/RepairRequest";

dotenv.config();

const databaseName = process.env.DATABASE_NAME;

if (!databaseName) throw new Error("Database name not provided");

export const repairRequestConnection: Collection<IrepairRequest> = mongoClient
  .db(databaseName)
  .collection<IrepairRequest>("repairRequests");

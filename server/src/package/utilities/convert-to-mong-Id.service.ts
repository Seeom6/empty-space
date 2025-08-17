import mongoose from "mongoose";

export type MongoId = mongoose.Types.ObjectId

export function toMongoId (id: string): MongoId{
    return new mongoose.Types.ObjectId(id)
}
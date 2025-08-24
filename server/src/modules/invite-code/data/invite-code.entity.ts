import mongoose from "mongoose";

export interface IInviteCode {
    _id?: mongoose.Types.ObjectId
    code: string
    position: mongoose.Types.ObjectId
    privilege: mongoose.Types.ObjectId[]
}
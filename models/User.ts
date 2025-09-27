import { Schema, model, models } from "mongoose";


export type Role = "user" | "admin";
export interface IUser {
email: string;
name?: string;
password: string; // hashed
role: Role;
createdAt: Date;
}


const UserSchema = new Schema<IUser>({
email: { type: String, unique: true, required: true },
name: String,
password: { type: String, required: true },
role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });


export default models.User || model<IUser>("User", UserSchema);
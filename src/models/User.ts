import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: "USER" | "ADMIN";
    isVerified: boolean;
    verificationToken?: string;
    verificationTokenExpiry?: Date;
    createdAt: Date;
    updatedAt: Date;
    passwordResetOTP?: string;
    passwordResetOTPExpiry?: Date;
}

const UserSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["USER", "ADMIN"],
            default: "USER"
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        verificationToken: {
            type: String
        },

        verificationTokenExpiry: {
            type: Date
        },
        passwordResetOTP: {
            type: String
        },

        passwordResetOTPExpiry: {
            type: Date
        }
    },
    { timestamps: true }
);

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
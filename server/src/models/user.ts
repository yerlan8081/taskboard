import { Schema, model, type Document } from 'mongoose';

export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface UserDocument extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    status: { type: String, enum: ['ACTIVE', 'DISABLED'], default: 'ACTIVE' },
    avatarUrl: { type: String }
  },
  { timestamps: true }
);

export const UserModel = model<UserDocument>('User', UserSchema);

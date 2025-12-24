"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    status: { type: String, enum: ['ACTIVE', 'DISABLED'], default: 'ACTIVE' },
    avatarUrl: { type: String }
}, { timestamps: true });
UserSchema.index({ email: 1 }, { unique: true });
exports.UserModel = (0, mongoose_1.model)('User', UserSchema);
//# sourceMappingURL=user.js.map
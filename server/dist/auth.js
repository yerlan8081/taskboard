"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.createToken = createToken;
exports.getUserIdFromAuthHeader = getUserIdFromAuthHeader;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SALT_ROUNDS = 10;
async function hashPassword(password) {
    return bcrypt_1.default.hash(password, SALT_ROUNDS);
}
async function verifyPassword(password, hash) {
    return bcrypt_1.default.compare(password, hash);
}
function createToken(userId) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jsonwebtoken_1.default.sign({ userId }, secret, { expiresIn: '7d' });
}
function getUserIdFromAuthHeader(header) {
    var _a;
    if (!header) {
        return null;
    }
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return null;
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, secret);
        return (_a = payload.userId) !== null && _a !== void 0 ? _a : null;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=auth.js.map
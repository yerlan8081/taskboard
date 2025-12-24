"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
let isConnected = false;
async function connectToDatabase(uri) {
    const mongoUri = uri || process.env.MONGO_URI || process.env.MONGO_URL;
    if (!mongoUri) {
        throw new Error('MONGO_URI is not defined');
    }
    if (isConnected) {
        return;
    }
    await mongoose_1.default.connect(mongoUri);
    isConnected = true;
    console.log('Connected to MongoDB');
}
//# sourceMappingURL=db.js.map
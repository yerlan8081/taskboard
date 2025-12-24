"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardModel = void 0;
const mongoose_1 = require("mongoose");
const BoardSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String },
    ownerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    visibility: { type: String, enum: ['PRIVATE', 'PUBLIC'], default: 'PRIVATE' },
    cover: { type: String },
    isArchived: { type: Boolean, default: false }
}, { timestamps: true });
BoardSchema.index({ ownerId: 1 });
exports.BoardModel = (0, mongoose_1.model)('Board', BoardSchema);
//# sourceMappingURL=board.js.map
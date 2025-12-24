"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListModel = void 0;
const mongoose_1 = require("mongoose");
const ListSchema = new mongoose_1.Schema({
    boardId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Board', required: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true },
    color: { type: String },
    isArchived: { type: Boolean, default: false },
    wipLimit: { type: Number }
}, { timestamps: true });
ListSchema.index({ boardId: 1 });
exports.ListModel = (0, mongoose_1.model)('List', ListSchema);
//# sourceMappingURL=list.js.map
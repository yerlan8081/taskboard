"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskModel = void 0;
const mongoose_1 = require("mongoose");
const TaskSchema = new mongoose_1.Schema({
    listId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'List', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    assigneeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    status: { type: String, enum: ['TODO', 'DOING', 'DONE'], default: 'TODO' },
    dueDate: { type: Date },
    tags: { type: [String], default: [] }
}, { timestamps: true });
TaskSchema.index({ listId: 1 });
exports.TaskModel = (0, mongoose_1.model)('Task', TaskSchema);
//# sourceMappingURL=task.js.map
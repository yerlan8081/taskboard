import { Schema, model, type Document, Types } from 'mongoose';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'TODO' | 'DOING' | 'DONE';

export interface TaskDocument extends Document {
  listId: Types.ObjectId;
  title: string;
  description?: string;
  assigneeId?: Types.ObjectId;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<TaskDocument>(
  {
    listId: { type: Schema.Types.ObjectId, ref: 'List', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    status: { type: String, enum: ['TODO', 'DOING', 'DONE'], default: 'TODO' },
    dueDate: { type: Date },
    tags: { type: [String], default: [] }
  },
  { timestamps: true }
);

TaskSchema.index({ listId: 1 });

export const TaskModel = model<TaskDocument>('Task', TaskSchema);

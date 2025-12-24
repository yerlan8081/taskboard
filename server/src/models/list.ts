import { Schema, model, type Document, Types } from 'mongoose';

export interface ListDocument extends Document {
  boardId: Types.ObjectId;
  title: string;
  order: number;
  color?: string;
  isArchived: boolean;
  wipLimit?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ListSchema = new Schema<ListDocument>(
  {
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true },
    color: { type: String },
    isArchived: { type: Boolean, default: false },
    wipLimit: { type: Number }
  },
  { timestamps: true }
);

ListSchema.index({ boardId: 1 });

export const ListModel = model<ListDocument>('List', ListSchema);

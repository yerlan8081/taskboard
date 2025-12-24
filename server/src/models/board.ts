import { Schema, model, type Document, Types } from 'mongoose';

export type BoardVisibility = 'PRIVATE' | 'PUBLIC';

export interface BoardDocument extends Document {
  title: string;
  description?: string;
  ownerId: Types.ObjectId;
  visibility: BoardVisibility;
  cover?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BoardSchema = new Schema<BoardDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    visibility: { type: String, enum: ['PRIVATE', 'PUBLIC'], default: 'PRIVATE' },
    cover: { type: String },
    isArchived: { type: Boolean, default: false }
  },
  { timestamps: true }
);

BoardSchema.index({ ownerId: 1 });

export const BoardModel = model<BoardDocument>('Board', BoardSchema);

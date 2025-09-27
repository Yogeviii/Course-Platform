// models/Lesson.ts
import { Schema, model, models, Types } from "mongoose";

export interface ILesson {
  course: Types.ObjectId;
  title: string;
  vimeoId: string;
  order: number;
  durationSec?: number;
  freePreview?: boolean;
  thumbnailUrl?: string;   // 👈 NEW
}

const LessonSchema = new Schema<ILesson>(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    vimeoId: { type: String, required: true },
    order: { type: Number, default: 0 },
    durationSec: Number,
    freePreview: { type: Boolean, default: false },
    thumbnailUrl: String,  // 👈 NEW
  },
  { timestamps: true }
);

LessonSchema.index({ course: 1, order: 1 });

export default models.Lesson || model<ILesson>("Lesson", LessonSchema);

// models/LessonLike.ts
import { Schema, model, models, Types } from "mongoose";

const LessonLikeSchema = new Schema(
  {
    lesson: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    user:   { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// ensure one like per user per lesson
LessonLikeSchema.index({ lesson: 1, user: 1 }, { unique: true });

export default models.LessonLike || model("LessonLike", LessonLikeSchema);

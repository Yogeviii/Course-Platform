import { Schema, model, models } from "mongoose";

const CourseSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    thumbnailUrl: String,
    published: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/** Virtual array of lessons (course field on Lesson points back here) */
CourseSchema.virtual("lessons", {
  ref: "Lesson",
  localField: "_id",
  foreignField: "course",
  justOne: false,
});

/** Virtual numeric count of lessons (fast count, no docs) */
CourseSchema.virtual("lessonsCount", {
  ref: "Lesson",
  localField: "_id",
  foreignField: "course",
  count: true,
});

export default models.Course || model("Course", CourseSchema);

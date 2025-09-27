import { dbConnect } from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";


(async () => {
await dbConnect();
const c = await Course.create({ title: "Summer Edition Challenge", description: "Low impact cardio.", thumbnailUrl: "/placeholder-thumb.jpg" });
await Lesson.create({ course: c._id, title: "Day 1", vimeoId: "123456789", order: 0 });
await Lesson.create({ course: c._id, title: "Day 2", vimeoId: "987654321", order: 1 });
console.log("Seeded");
process.exit(0);
})();
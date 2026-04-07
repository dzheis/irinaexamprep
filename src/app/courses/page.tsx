import CoursesClient from "./courses-client";
import { fetchStory } from "@/lib/storyblok";
import type { CoursesStoryContent } from "@/lib/storyblok-types";

function normalizeCoursesContent(raw: Record<string, unknown> | null): CoursesStoryContent | null {
  if (!raw || typeof raw !== "object") return null;
  const getTitle = (r: Record<string, unknown>) =>
    (r.title as string) || (r.headline as string) || "";
  const getCourses = (r: Record<string, unknown>): unknown[] => {
    const arr = r.courses ?? r.Blocks ?? r.course_cards ?? r.items ?? r.blocks;
    return Array.isArray(arr) ? arr : [];
  };
  const body = raw.body as Record<string, unknown>[] | undefined;
  const first = Array.isArray(body) ? body[0] : undefined;
  const title = getTitle(raw) || (first ? getTitle(first) : "");
  const courses = getCourses(raw).length ? getCourses(raw) : first ? getCourses(first) : [];
  return { title: title || undefined, courses: courses as CoursesStoryContent["courses"] };
}

export default async function Courses() {
  const story = await fetchStory<Record<string, unknown>>("courses");
  const raw = story?.content ?? null;
  const data = normalizeCoursesContent(raw);
  return <CoursesClient data={data} />;
}

const COURSE_ID_MAP: Record<string, string> = {
  ct: "qualifier-computational-thinking",
  "stats-1": "qualifier-stats-1",
  "math-1": "qualifier-math-1",
  "qualifier-python": "qualifier-python",
  "qualifier-java": "qualifier-java",
};

export function canAccessLiveClass(courseCode: string, enrolledCourseIds: string[]): boolean {
  const code = courseCode.toLowerCase();
  // Python and Doubts classes are visible to everyone.
  if (code === "python" || code === "doubts") {
    return true;
  }
  const courseId = COURSE_ID_MAP[code];
  return courseId ? enrolledCourseIds.includes(courseId) : false;
}

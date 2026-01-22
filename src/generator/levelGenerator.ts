import { CURRICULUM } from "./curriculum";
import { getChapterForLevel } from "./progression";
import { getDifficultyProfile } from "./levelProfiles";

export function generateLevel(level: number) {
  const chapterIndex = getChapterForLevel(level);
  const chapter = CURRICULUM[chapterIndex];

  const difficulty = getDifficultyProfile(level);

  const allowedConcepts = chapter.concepts;
  for (let i = 0; i < chapterIndex; i++) {
    allowedConcepts.push(...CURRICULUM[i].concepts);
  }
  return {
    level,
    chapter: chapter.name,
    allowedConcepts,
    difficulty
  };
}

export function getChapterForLevel(level: number) {
  if (level <= 15) return 0;      // Basics
  if (level <= 50) return 1;      // Properties
  if (level <= 75) return 2;      // Selectors
  return 3;                       // Interactive
}
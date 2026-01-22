export function getDifficultyProfile(level: number) {
  if (level < 10) return { maxProps: 1, maxSelectors: 1 };
  if (level < 30) return { maxProps: 2, maxSelectors: 1 };
  if (level < 60) return { maxProps: 3, maxSelectors: 2 };
  return { maxProps: 4, maxSelectors: 3 };
}
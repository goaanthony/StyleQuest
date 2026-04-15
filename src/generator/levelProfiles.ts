export function getDifficultyProfile(level: number, isTest: boolean, step: number) {
  let itemCount = Math.ceil(step / 2); 
  if (isTest) itemCount += 1; 
  const selectorComplexity = level < 10 ? 1 : level < 25 ? 2 : 3;
  return {
    itemCount: Math.min(itemCount, 6),
    selectorComplexity,
    mixOldConcepts: isTest || level > 10
  };
}
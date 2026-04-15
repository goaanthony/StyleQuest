import { getProgressionState } from "./progression";
import { getDifficultyProfile } from "./levelProfiles";

export function generateLevel(level: number) {
  const { 
    currentConcept, 
    currentChapter, 
    unlockedConcepts, 
    isTestLevel, 
    stepInConcept 
  } = getProgressionState(level);
  const difficulty = getDifficultyProfile(level, isTestLevel, stepInConcept);
  const focusConcepts = [currentConcept];
  let allowedConcepts = [...focusConcepts];
  if (difficulty.mixOldConcepts) {
    const oldConcepts = unlockedConcepts.filter(c => c !== currentConcept);
    allowedConcepts = [...allowedConcepts, ...oldConcepts];
  }

  return {
    level,
    chapterName: currentChapter.name,
    newConcept: currentConcept,
    availableTools: allowedConcepts,
    difficulty,
    isTestLevel,
    progress: `${stepInConcept}/5`
  };
}
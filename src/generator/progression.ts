import { LEARNING_PATH, CURRICULUM } from "./curriculum";
const STEPS_PER_CONCEPT = 5;

export function getProgressionState(level: number) {
  const conceptIndex = Math.min(
    Math.floor((level - 1) / STEPS_PER_CONCEPT),
    LEARNING_PATH.length - 1
  );
  const stepInConcept = ((level - 1) % STEPS_PER_CONCEPT) + 1;
  const isTestLevel = stepInConcept === STEPS_PER_CONCEPT;
  const currentConcept = LEARNING_PATH[conceptIndex];
  const currentChapter = CURRICULUM.find(c =>
    c.concepts.includes(currentConcept)
  ) || CURRICULUM[0];
  const unlockedConcepts = LEARNING_PATH.slice(0, conceptIndex + 1);
  return {
    currentConcept,
    currentChapter,
    unlockedConcepts,
    isTestLevel,
    stepInConcept
  };
}
import { Concept } from "./concepts";

export const CURRICULUM = [
  {
    id: "Basics",
    name: "Basics & HTML",
    concepts: ["elements"] as Concept[]
  },
  {
    id: "properties",
    name: "Properties",
    concepts: [
      "dimensions",
      "align",
      "margin",
      "padding",
      "background",
      "color",
      "typography",
      "border",
      "images"
    ] as Concept[]
  },
  {
    id: "selectors",
    name: "Other Selectors",
    concepts: [
      "id_selector",
      "universal_selector",
      "class_selector",
      "attribute_selector"
    ] as Concept[]
  },
  {
    id: "interactive",
    name: "Interactive",
    concepts: [
      "hover",
      "active",
      "focus",
      "visited",
      "translate"
    ] as Concept[]
  }
] as const;

export const LEARNING_PATH: Concept[] = CURRICULUM.flatMap(c => c.concepts);
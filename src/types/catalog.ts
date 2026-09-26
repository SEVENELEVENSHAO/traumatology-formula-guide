export type RelationshipType = "derived_from" | "contains_formula" | "combination_of" | "variant_of" | "shares_core";

export interface SourceReference {
  sourceId: string;
  locator: { kind: string; index: number };
  recordId: string;
  text: string;
  reviewStatus: "reviewed" | "pending";
}

export interface Formula {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  family: string;
  exam: boolean;
  examHerbCount?: number;
  ingredientCount: number;
  ingredients: string[];
  contexts: string[];
  reviewStatus: "reviewed" | "pending";
  sourceReferences: SourceReference[];
  searchText: string;
}

export interface FormulaRelationship {
  id: string;
  from: string;
  to: string;
  type: RelationshipType;
  evidence: RelationshipEvidence;
  addedHerbs?: string[];
  removedHerbs?: string[];
}

export interface RelationshipEvidence {
  kind: "explicit" | "computed";
  summary: string;
  sourceReferences: Array<Pick<SourceReference, "sourceId" | "locator" | "recordId">>;
}

export interface Herb {
  id: string;
  name: string;
  aliases: string[];
  processingVariants: string[];
  formulaIds: string[];
}

export interface StudyProgress {
  questionIndex: number;
  score: number;
  answeredPromptIds: string[];
}

export interface QuizPrompt {
  id: string;
  type: string;
  formulaId: string;
  prompt: string;
  answer: string;
  choices: string[];
}

export interface Catalog {
  generatedUtc: string;
  formulas: Formula[];
  relationships: FormulaRelationship[];
  quizPrompts: QuizPrompt[];
  sources: Array<{ id: string; title: string; sha256: string; path: string }>;
  herbs: Herb[];
}

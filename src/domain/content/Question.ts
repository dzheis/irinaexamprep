export type Question = {
  id: string;
  examId: string;
  prompt: string;
  options?: string[];
  correctAnswer?: string;
};

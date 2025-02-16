export type Priority = "low" | "medium" | "high";
export type Status = "pending" | "in-progress" | "completed";
export type Category = "work" | "personal" | "shopping" | "health" | "other";

export type Todo = {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: Category;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
};

import { Task } from "../task-manager";

// This will handle the sorting logic in order to have the priority working, while higher the number then higher the priority.
export function priorityRank(p: Task["priority"]): number {
  switch (p) {
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
  }
}

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

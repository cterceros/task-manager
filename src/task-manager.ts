import { priorityRank, startOfToday } from "./utils/helpers";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: Date;
}

type ProjectStatuses = {
  active: Task[];
  completed: Task[];
};

export class TaskManager {
  private projects: Map<string, ProjectStatuses> = new Map();

  // Add a task to a specific project
  addTask(projectName: string, task: Omit<Task, "id">): string {
    const id = this.generateId();
    const project = this.getProject(projectName);

    const fullTask: Task = { id, ...task };
    if (fullTask.completed) {
      project.completed.push(fullTask);
    } else {
      project.active.push(fullTask);
    }
    return id;
  }

  // Get all tasks for a project, optionally filtered by completion status
  getTasks(projectName: string, completed?: boolean): Task[] {
    const project = this.projects.get(projectName);
    if (!project) return [];

    if (completed === true) return [...project.completed];
    if (completed === false) return [...project.active];
    return [...project.active, ...project.completed];
  }

  // Get tasks across all projects, sorted by priority (high -> medium -> low)
  getAllTasksByPriority(): Array<Task & { project: string }> {
    const all: Array<Task & { project: string }> = [];

    for (const [project, buckets] of this.projects) {
      for (const t of buckets.active) all.push({ ...t, project });
      for (const t of buckets.completed) all.push({ ...t, project });
    }

    return all.sort((a, b) => {
      const byPriority = priorityRank(b.priority) - priorityRank(a.priority); // high first
      if (byPriority !== 0) return byPriority;

      return a.id.localeCompare(b.id);
    });
  }

  // Mark task as completed and move it to a "completed" array within the project
  completeTask(projectName: string, taskId: string): boolean {
    const project = this.projects.get(projectName);
    if (!project) return false;

    const idx = project.active.findIndex((t) => t.id === taskId);
    if (idx === -1) {
      return false;
    }

    const [task] = project.active.splice(idx, 1);
    const completedTask: Task = { ...task, completed: true };
    project.completed.push(completedTask);
    return true;
  }

  // Get project statistics: total tasks, completed, by priority breakdown
  getProjectStats(projectName: string): {
    total: number;
    completed: number;
    byPriority: Record<Task["priority"], number>;
  } {
    const project = this.projects.get(projectName);
    if (!project) {
      return {
        total: 0,
        completed: 0,
        byPriority: { high: 0, medium: 0, low: 0 },
      };
    }

    const all = [...project.active, ...project.completed];

    const byPriority: Record<Task["priority"], number> = {
      high: 0,
      medium: 0,
      low: 0,
    };
    for (const t of all) byPriority[t.priority]++;

    return {
      total: all.length,
      completed: project.completed.length,
      byPriority,
    };
  }

  // Find overdue tasks across all projects (tasks with dueDate before today)
  getOverdueTasks(): Array<Task & { project: string }> {
    const out: Array<Task & { project: string }> = [];
    const todayStart = startOfToday();

    for (const [project, buckets] of this.projects) {
      for (const t of buckets.active) {
        if (t.dueDate && t.dueDate.getTime() < todayStart.getTime()) {
          out.push({ ...t, project });
        }
      }
    }

    out.sort(
      (a, b) => (a.dueDate?.getTime() ?? 0) - (b.dueDate?.getTime() ?? 0)
    );
    return out;
  }

  private getProject(name: string): ProjectStatuses {
    let statuses = this.projects.get(name);
    if (!statuses) {
      // If project is empty then we need to create a new one
      statuses = { active: [], completed: [] };
      this.projects.set(name, statuses);
    }
    return statuses;
  }

  private generateId(): string {
    const rand = Math.random().toString(36).slice(2, 8);
    return `${Date.now().toString(36)}-${rand}`;
  }
}

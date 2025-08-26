import { TaskManager } from "./task-manager";

const tm = new TaskManager();

// Add tasks
const id1 = tm.addTask("Website", {
  title: "Hero copy",
  completed: false,
  priority: "high",
  dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // tomorrow
});

// Get tasks
console.log("Website tasks:", tm.getTasks("Website"));
console.log("All tasks by priority:", tm.getAllTasksByPriority());

// Complete a task
tm.completeTask("Website", id1);
console.log("Website after completing id1:", tm.getTasks("Website"));

// Stats
console.log("Website stats:", tm.getProjectStats("Website"));

// Overdue tasks
console.log("Overdue tasks:", tm.getOverdueTasks());

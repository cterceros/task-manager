"use strict";
// TaskManager.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskManager = void 0;
class TaskManager {
    constructor() {
        /** Map keyed by project name -> { active[], completed[] } */
        this.projects = new Map();
    }
    // ---------- Public API ----------
    /**
     * Add a task to a specific project.
     * Returns the generated task id.
     */
    addTask(projectName, task) {
        const id = this.generateId();
        const project = this.getOrCreateProject(projectName);
        // Normalize input: if caller passed completed=true by mistake,
        // we still respect it and place it in the right bucket.
        const fullTask = { id, ...task };
        if (fullTask.completed) {
            project.completed.push(fullTask);
        }
        else {
            project.active.push(fullTask);
        }
        return id;
    }
    /**
     * Get tasks for a project.
     * - completed === true  -> only completed
     * - completed === false -> only active
     * - completed === undefined -> all (active + completed)
     */
    getTasks(projectName, completed) {
        const project = this.projects.get(projectName);
        if (!project)
            return [];
        if (completed === true)
            return [...project.completed];
        if (completed === false)
            return [...project.active];
        return [...project.active, ...project.completed];
    }
    /**
     * Get tasks across all projects, sorted by priority (high -> medium -> low).
     * We include BOTH active and completed tasks here; if you prefer only active,
     * filter by t.completed === false before sorting.
     */
    getAllTasksByPriority() {
        const all = [];
        for (const [project, buckets] of this.projects) {
            for (const t of buckets.active)
                all.push({ ...t, project });
            for (const t of buckets.completed)
                all.push({ ...t, project });
        }
        return all.sort((a, b) => {
            const byPriority = priorityRank(b.priority) - priorityRank(a.priority); // high first
            if (byPriority !== 0)
                return byPriority;
            // (Optional tie-breakers that keep results predictable)
            // Earlier due dates first, then fallback to id for a stable order
            const aDue = a.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
            const bDue = b.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
            if (aDue !== bDue)
                return aDue - bDue;
            return a.id.localeCompare(b.id);
        });
    }
    /**
     * Mark task as completed and move it from "active" to "completed"
     * within the given project. Returns true if a task was found & moved,
     * false if not found.
     */
    completeTask(projectName, taskId) {
        const project = this.projects.get(projectName);
        if (!project)
            return false;
        const idx = project.active.findIndex((t) => t.id === taskId);
        if (idx === -1) {
            // Already completed or nonexistent
            return false;
        }
        const [task] = project.active.splice(idx, 1);
        const completedTask = { ...task, completed: true };
        project.completed.push(completedTask);
        return true;
    }
    /**
     * Project statistics:
     * - total: active + completed
     * - completed: number completed
     * - byPriority: counts across ALL tasks (active + completed)
     */
    getProjectStats(projectName) {
        const project = this.projects.get(projectName);
        if (!project) {
            return {
                total: 0,
                completed: 0,
                byPriority: { high: 0, medium: 0, low: 0 },
            };
        }
        const all = [...project.active, ...project.completed];
        const byPriority = {
            high: 0,
            medium: 0,
            low: 0,
        };
        for (const t of all)
            byPriority[t.priority]++;
        return {
            total: all.length,
            completed: project.completed.length,
            byPriority,
        };
    }
    /**
     * Find overdue tasks across ALL projects.
     * We consider only ACTIVE tasks (incomplete). A task is overdue if it has a
     * dueDate and that date is strictly before "today" (local).
     */
    getOverdueTasks() {
        const out = [];
        const todayStart = startOfToday();
        for (const [project, buckets] of this.projects) {
            for (const t of buckets.active) {
                if (t.dueDate && t.dueDate.getTime() < todayStart.getTime()) {
                    out.push({ ...t, project });
                }
            }
        }
        // Often helpful to see the most urgent first: earlier due dates first.
        out.sort((a, b) => (a.dueDate?.getTime() ?? 0) - (b.dueDate?.getTime() ?? 0));
        return out;
    }
    // ---------- Private helpers ----------
    /** Create project bucket if missing, then return it. */
    getOrCreateProject(name) {
        let buckets = this.projects.get(name);
        if (!buckets) {
            buckets = { active: [], completed: [] };
            this.projects.set(name, buckets);
        }
        return buckets;
    }
    /** Lightweight id generator (timestamp + random). */
    generateId() {
        const rand = Math.random().toString(36).slice(2, 8);
        return `${Date.now().toString(36)}-${rand}`;
    }
}
exports.TaskManager = TaskManager;
// ---------- Small utilities (module-local) ----------
function priorityRank(p) {
    // Higher number means "higher" priority for sorting purposes
    switch (p) {
        case "high":
            return 3;
        case "medium":
            return 2;
        case "low":
            return 1;
    }
}
function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

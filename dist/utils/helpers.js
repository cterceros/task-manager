"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priorityRank = priorityRank;
exports.startOfToday = startOfToday;
// This will handle the sorting logic in order to have the priority working, while higher the number then higher the priority.
function priorityRank(p) {
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

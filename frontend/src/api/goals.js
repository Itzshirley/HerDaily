import api from "./client";

export const getGoals = () => api.get("goals/").then((res) => res.data);

export const createGoal = (goal) => api.post("goals/", goal).then((res) => res.data);

export const updateGoal = (id, goal) =>
  api.patch(`goals/${id}/`, goal).then((res) => res.data);

export const deleteGoal = (id) => api.delete(`goals/${id}/`);

export const setGoalProgress = (id, progress) =>
  api.patch(`goals/${id}/set_progress/`, { progress }).then((res) => res.data);

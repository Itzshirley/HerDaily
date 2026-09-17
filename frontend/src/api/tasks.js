import api from "./client";

export const getTasks = () => api.get("tasks/").then((res) => res.data);

export const createTask = (task) => api.post("tasks/", task).then((res) => res.data);

export const updateTask = (id, task) =>
  api.patch(`tasks/${id}/`, task).then((res) => res.data);

export const deleteTask = (id) => api.delete(`tasks/${id}/`);

export const toggleTaskComplete = (id) =>
  api.patch(`tasks/${id}/toggle_complete/`).then((res) => res.data);

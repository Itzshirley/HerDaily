import api from "./client";

export const getHabits = () => api.get("habits/").then((res) => res.data);

export const createHabit = (habit) => api.post("habits/", habit).then((res) => res.data);

export const deleteHabit = (id) => api.delete(`habits/${id}/`);

export const toggleHabitToday = (id) =>
  api.post(`habits/${id}/toggle_today/`).then((res) => res.data);

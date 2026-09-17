import api from "./client";

export const getTodayWaterLog = () => api.get("water/today/").then((res) => res.data);

export const getWaterHistory = () => api.get("water/").then((res) => res.data);

export const incrementWater = (id) =>
  api.patch(`water/${id}/increment/`).then((res) => res.data);

export const decrementWater = (id) =>
  api.patch(`water/${id}/decrement/`).then((res) => res.data);

export const setWaterGoal = (id, goal) =>
  api.patch(`water/${id}/`, { goal }).then((res) => res.data);

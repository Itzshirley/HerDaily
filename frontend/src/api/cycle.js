import api from "./client";

export const getCycleLogs = () => api.get("cycle-logs/").then((res) => res.data);

export const createCycleLog = (log) =>
  api.post("cycle-logs/", log).then((res) => res.data);

export const deleteCycleLog = (id) => api.delete(`cycle-logs/${id}/`);

export const getCycleSettings = () =>
  api.get("cycle-settings/").then((res) => res.data);

export const updateCycleSettings = (settings) =>
  api.patch("cycle-settings/", settings).then((res) => res.data);

export const getCyclePrediction = () =>
  api.get("cycle-predict/").then((res) => res.data);

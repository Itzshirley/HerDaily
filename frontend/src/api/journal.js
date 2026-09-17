import api from "./client";

export const getEntries = () => api.get("journal/").then((res) => res.data);

export const createEntry = (entry) => api.post("journal/", entry).then((res) => res.data);

export const updateEntry = (id, entry) =>
  api.patch(`journal/${id}/`, entry).then((res) => res.data);

export const deleteEntry = (id) => api.delete(`journal/${id}/`);

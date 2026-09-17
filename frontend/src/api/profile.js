import api from "./client";

export const getProfile = () => api.get("profile/").then((res) => res.data);

export const updateProfile = (profile) =>
  api.patch("profile/", profile).then((res) => res.data);

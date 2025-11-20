import api from "./axios";
import { User } from "../types";

const mapUser = (u: any): User => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  createdAt: u.created_at,
});

export const login = async (data: {
  email: string;
  password: string;
}): Promise<{ token: string; user: User }> => {
  const res = await api.post("/auth/login", data);
  return {
    token: res.data.token,
    user: mapUser(res.data.user),
  };
};

export const register = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<{ token: string; user: User }> => {
  const res = await api.post("/auth/register", data);
  return {
    token: res.data.token,
    user: mapUser(res.data.user),
  };
};

export const getUser = async (): Promise<{ user: User }> => {
  const res = await api.get("/auth/me");
  return { user: mapUser(res.data.user) };
};

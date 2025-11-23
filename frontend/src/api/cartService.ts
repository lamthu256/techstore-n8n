import api from "./axios";
import { CartItem } from "../types";

export const getCart = async (userId: string): Promise<CartItem[]> => {
  const res = await api.get("/cart", { params: { userId } });
  return res.data;
};

export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<void> => {
  const res = await api.post("/cart", { userId, productId, quantity });
  return res.data;
};

export const updateCartItem = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<void> => {
  const res = await api.put("/cart", { userId, productId, quantity });
  return res.data;
};

export const removeFromCart = async (
  userId: string,
  productId: string
): Promise<void> => {
  const res = await api.delete(`/cart/${productId}`, { params: { userId } });
  return res.data;
};

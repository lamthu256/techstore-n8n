import api from "./axios";
import { CartItem } from "../types";

export const getCart = async (): Promise<CartItem[]> => {
  const res = await api.get("/cart");
  return res.data;
};

export const addToCart = async (
  productId: string,
  quantity: number
): Promise<void> => {
  const res = await api.post("/cart", { productId, quantity });
  return res.data;
};

export const updateCartItem = async (
  productId: string,
  quantity: number
): Promise<void> => {
  const res = await api.put("/cart", { productId, quantity });
  return res.data;
};

export const removeFromCart = async (productId: string): Promise<void> => {
  const res = await api.delete(`/cart/${productId}`);
  return res.data;
};

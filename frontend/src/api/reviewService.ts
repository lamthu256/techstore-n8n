import api from "./axios";
import { ProductReview } from "../types";

const mapReview = (p: any): ProductReview => ({
  id: p.id,
  productId: p.product_id,
  userId: p.user_id,
  userName: p.name,
  rating: p.rating,
  comment: p.comment,
  createdAt: p.created_at,
});

// Reviews
export const getProductReviews = async (
  productId: string
): Promise<ProductReview[]> => {
  const res = await api.get(`/reviews/${productId}`);
  return res.data.map(mapReview);
};

export const addReview = async (
  productId: string,
  data: { rating: number; comment: string }
): Promise<ProductReview> => {
  const res = await api.post(`/reviews/${productId}`, data);
  return res.data;
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  const res = await api.delete(`/reviews/${reviewId}`);
  return res.data;
};

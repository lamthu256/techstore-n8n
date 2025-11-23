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
  userId: string,
  productId: string,
  data: { rating: number; comment: string }
): Promise<ProductReview> => {
  const res = await api.post(`/reviews/${productId}`, { userId, ...data });
  return res.data;
};

export const deleteReview = async (
  userId: string,
  reviewId: string
): Promise<void> => {
  const res = await api.delete(`/reviews/${reviewId}`, { params: { userId } });
  return res.data;
};

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ProductReview } from "../types";
import * as reviewApi from "../api/reviewService";
import { useProduct } from "./ProductContext";

export interface ReviewContextType {
  reviews: ProductReview[];
  isLoading: boolean;
  error: any;
  getReviews: (productId: string) => Promise<void>;
  addReview: (
    productId: string,
    data: { rating: number; comment: string }
  ) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider: React.FC<{
  children: ReactNode;
  productId: string;
}> = ({ children, productId }) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { getProducts } = useProduct();

  const getReviews = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await reviewApi.getProductReviews(id);
      setReviews(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addReview = async (
    productId: string,
    data: { rating: number; comment: string }
  ) => {
    setIsLoading(true);
    try {
      await reviewApi.addReview(productId, data);
      await getReviews(productId);
      await getProducts();
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    setIsLoading(true);
    try {
      await reviewApi.deleteReview(reviewId);
      await getReviews(productId);
      await getProducts();
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getReviews(productId);
  }, [productId]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        window.location.reload();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value: ReviewContextType = {
    reviews,
    isLoading,
    error,
    getReviews,
    addReview,
    deleteReview,
  };

  return (
    <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
  );
};

export const useReview = (): ReviewContextType => {
  const context = useContext(ReviewContext);
  if (!context)
    throw new Error("useReview must be used within a ReviewProvider");
  return context;
};

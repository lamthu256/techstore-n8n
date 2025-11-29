import api from "./axios";
import { Product } from "../types";

// DTO khi tạo/cập nhật sản phẩm
interface ProductPayload {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

// Convert snake_case → camelCase
const mapProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  description: p.description,
  price: p.price,
  image: p.image,
  category: p.category,
  stock: p.stock,
  rating: p.rating ?? 0,
  reviewsCount: p.reviews_count ?? 0,
  createdAt: p.created_at,
});

// Products (Public)
export const getProducts = async (): Promise<Product[]> => {
  const res = await api.get("/products");

  return res.data.map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    image: item.image,
    category: item.category,
    stock: item.stock,
    rating: item.rating,
    reviewsCount: item.reviews_count ?? 0,
    createdAt: item.created_at,

    // 🔥 2 trường flash sale
    final_price: item.final_price,
    flash_discount_percent: item.flash_discount_percent,
  }));
};

// Product Details
export const getProductDetails = async (id: string): Promise<Product> => {
  const res = await api.get(`/products/${id}`);
  return mapProduct(res.data);
};

// Admin - Create Product
export const createProduct = async (data: ProductPayload): Promise<Product> => {
  const res = await api.post("/products", data);
  return mapProduct(res.data);
};

// Admin - Update Product
export const updateProduct = async (
  id: string,
  data: ProductPayload
): Promise<Product> => {
  const res = await api.put(`/products/${id}`, data);
  return mapProduct(res.data);
};

// Admin - Delete Product
export const deleteProduct = async (id: string): Promise<void> => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};

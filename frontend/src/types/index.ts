export interface User {
  id: string;
  email: string;
  name: string;
  role?: "admin" | "user";
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  createdAt?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Address {
  fullName: string;
  phone: string;
  street: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  createdAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  address: Address;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

export interface CustomerProfile {
  id: string;
  user: {
    name: string;
    email: string;
  };
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

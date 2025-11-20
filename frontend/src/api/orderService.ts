import api from "./axios";
import { Order, Address } from "../types";

interface CreateOrderDTO {
  items: any[];
  total: number;
  address: Address;
}

// Convert snake_case → camelCase
const mapOrder = (o: any): Order => ({
  id: o.id,
  userId: o.user_id,
  total: o.total,
  address: o.address,
  status: o.status,
  createdAt: o.created_at,
  items: o.items ?? [], // trong trường hợp API trả kèm items
});

// User - Create Order
export const createOrder = async (
  data: CreateOrderDTO
): Promise<{ orderId: string }> => {
  const res = await api.post("/orders", data);
  return res.data; // không cần map
};

// User - Get User Orders
export const getOrders = async (): Promise<Order[]> => {
  const res = await api.get("/orders");
  return res.data.map((o: any) => mapOrder(o));
};

// Admin - Get All Orders
export const getAllOrders = async (): Promise<Order[]> => {
  const res = await api.get(`/orders/admin`);
  return res.data.map((o: any) => mapOrder(o));
};

// Admin - Get Order Details
export const getOrderDetails = async (orderId: string): Promise<Order> => {
  const res = await api.get(`/orders/admin/${orderId}`);
  return mapOrder(res.data);
};

// Admin - Update Order Status
export const updateOrderStatus = async (
  orderId: string,
  status: string
): Promise<Order> => {
  const res = await api.put(`/orders/admin/${orderId}/status`, {
    status,
  });
  return mapOrder(res.data);
};

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Order, Address } from "../types";
import * as orderApi from "../api/orderService";
import { useAuth } from "./AuthContext";

export interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  error: any;
  createOrder: (data: {
    items: any[];
    total: number;
    address: Address;
  }) => Promise<string | null>;
  getOrders: () => Promise<void>;
  getOrderDetails?: (orderId: string) => Promise<Order | null>;
  getAllOrders?: () => Promise<void>;
  updateOrderStatus?: (orderId: string, status: string) => Promise<void>;
}

export const OrderContext = createContext<OrderContextType | undefined>(
  undefined
);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const createOrder = async (data: {
    items: any[];
    total: number;
    address: Address;
  }) => {
    setIsLoading(true);
    try {
      const result = await orderApi.createOrder(data);
      await getOrders();
      setError(null);
      return result.orderId || null;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await orderApi.getOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      getOrders();
    } else {
      setOrders([]);
    }
  }, [user]);

  // Admin: lấy tất cả đơn hàng
  const getAllOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderApi.getAllOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Admin: lấy chi tiết đơn hàng
  const getOrderDetails = async (orderId: string) => {
    setIsLoading(true);
    try {
      const order = await orderApi.getOrderDetails(orderId);
      setError(null);
      return order;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Admin: cập nhật trạng thái đơn hàng
  const updateOrderStatus = async (orderId: string, status: string) => {
    setIsLoading(true);
    try {
      await orderApi.updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: status as Order["status"] }
            : order
        )
      );
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const value: OrderContextType = {
    orders,
    isLoading,
    error,
    createOrder,
    getOrders,
    getOrderDetails,
    getAllOrders,
    updateOrderStatus,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};

export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context)
    throw new Error("useOrder must be used within an OrderProvider");
  return context;
};

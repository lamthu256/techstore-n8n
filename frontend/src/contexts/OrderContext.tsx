import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Order } from "../types";
import { useAuth } from "./AuthContext";

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
  addOrder: (
    order: Omit<Order, "id" | "createdAt" | "status">
  ) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const API_URL = "http://localhost:4000";

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("fetchOrders error:", err);
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (
    order: Omit<Order, "id" | "createdAt" | "status">
  ) => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new Error("Failed to create order");
      const data = await res.json();
      await fetchOrders(); // Refresh orders after adding
      return data;
    } catch (err) {
      console.error("addOrder error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  return (
    <OrderContext.Provider value={{ orders, loading, fetchOrders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrders must be used within OrderProvider");
  return context;
};

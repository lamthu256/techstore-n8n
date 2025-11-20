import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getProducts } from "../api/productService";
import { getAllOrders } from "../api/orderService";
import { getCustomers } from "../api/customerService";

export interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalRevenue: number;
}

interface DashboardContextType {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: any;
  refresh: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [products, orders, customers] = await Promise.all([
        getProducts(),
        getAllOrders(),
        getCustomers(),
      ]);
      const totalRevenue = customers.reduce(
        (sum: number, c: any) => sum + (c.totalSpent || 0),
        0
      );
      setStats({
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: customers.length,
        totalRevenue,
      });
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const value: DashboardContextType = {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context)
    throw new Error("useDashboard must be used within a DashboardProvider");
  return context;
};

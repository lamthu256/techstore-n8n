import React, { createContext, useState, useContext, ReactNode } from "react";
import { CustomerProfile } from "../types";
import * as customerApi from "../api/customerService";

export interface CustomerContextType {
  customers: CustomerProfile[];
  isLoading: boolean;
  error: any;
  getAllProfiles: () => Promise<void>;
  getProfileById: (customerId: string) => Promise<CustomerProfile | null>;
}

export const CustomerContext = createContext<CustomerContextType | undefined>(
  undefined
);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const getAllProfiles = async () => {
    setIsLoading(true);
    try {
      const data = await customerApi.getCustomers();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    getAllProfiles();
  }, []);

  const getProfileById = async (customerId: string) => {
    setIsLoading(true);
    try {
      const profile = await customerApi.getCustomerById(customerId);
      setError(null);
      return profile;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <CustomerContext.Provider
      value={{
        customers,
        isLoading,
        error,
        getAllProfiles,
        getProfileById,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = (): CustomerContextType => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return context;
};

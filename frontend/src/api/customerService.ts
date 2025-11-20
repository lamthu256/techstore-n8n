import api from "./axios";
import { CustomerProfile } from "../types";

// Lấy tất cả profile khách hàng (dành cho admin)
export const getCustomers = async (): Promise<CustomerProfile[]> => {
  const response = await api.get("/customers");
  return response.data;
};

// Lấy thông tin profile cá nhân của khách hàng theo ID
export const getCustomerById = async (
  customerId: string
): Promise<CustomerProfile> => {
  const response = await api.get(`/customers/${customerId}`);
  return response.data;
};

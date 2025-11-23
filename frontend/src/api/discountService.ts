import api from "./axios";

interface DiscountResponse {
  code: string;
  discount: number;
  message: string;
}

export const validateDiscountCode = async (
  code: string
): Promise<DiscountResponse> => {
  const res = await api.post("/discounts/validate", { code });
  return res.data;
};

export const toggleDiscountCode = async (
  code: string,
  isActive: boolean
): Promise<DiscountResponse> => {
  const res = await api.put(`/discounts/${code}`, { isActive });
  return res.data;
};

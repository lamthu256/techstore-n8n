import axios from "axios";

export interface InviteUsedPayload {
  customerEmail: string;
  discountCode: string;
  orderId?: string | null;
  total: number;
}

export const notifyInviteUsed = (payload: InviteUsedPayload) => {
  return axios.post("/ref-share/invite-used", payload);
};

import api from "./axios";

export const trackView = async (userId: string, productId: string) => {
  try {
    await api.post("/track/view", {
      userId,
      productId,
      viewedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Track view error:", error);
  }
};

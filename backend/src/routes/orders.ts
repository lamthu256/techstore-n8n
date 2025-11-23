import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController";

const router = Router();

// Admin routes
router.get("/admin", getAllOrders);
router.get("/admin/:id", getOrderById);
router.put("/admin/:id/status", updateOrderStatus);

// User routes
router.post("/", createOrder);
router.get("/", getOrders);

export default router;

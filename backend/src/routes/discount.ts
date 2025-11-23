import { Router } from "express";
import {
  addDiscountCode,
  toggleDiscountCode,
  validateDiscountCode,
} from "../controllers/discountController";

const router = Router();

// Xác thực mã giảm giá (public)
router.post("/validate", validateDiscountCode);

// Admin routes
router.post("/", addDiscountCode);
router.put("/:code", toggleDiscountCode);

export default router;

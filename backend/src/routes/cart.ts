import { Router } from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  getCartItems,
} from "../controllers/cartController";

const router = Router();

// Tất cả routes cart
router.get("/", getCart);
router.post("/", addToCart);
router.put("/", updateCartItem);
router.delete("/:productId", removeFromCart);

// Admin routes
router.get("/all", getCartItems);

export default router;

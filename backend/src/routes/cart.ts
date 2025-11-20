import { Router } from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
} from "../controllers/cartController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

// Tất cả routes cart đều cần đăng nhập
router.use(verifyToken);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/", updateCartItem);
router.delete("/:productId", removeFromCart);

export default router;

import { Router } from "express";
import {
  getProductReviews,
  addReview,
  deleteReview,
} from "../controllers/reviewController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/:productId", getProductReviews);
router.post("/:productId", verifyToken, addReview);
router.delete("/:id", verifyToken, deleteReview);

export default router;

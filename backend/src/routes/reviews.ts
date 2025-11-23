import { Router } from "express";
import {
  getProductReviews,
  addReview,
  deleteReview,
} from "../controllers/reviewController";

const router = Router();

router.get("/:productId", getProductReviews);
router.post("/:productId", addReview);
router.delete("/:id", deleteReview);

export default router;

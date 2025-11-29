// backend/src/routes/flashSaleRoutes.ts
import { Router } from "express";
import {
  createFlashSale,
  getActiveFlashSale,
} from "../controllers/flashSaleController";

const router = Router();

router.post("/", createFlashSale);
router.get("/active", getActiveFlashSale);

export default router;

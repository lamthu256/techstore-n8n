import { Router } from "express";
import {
  getViewReport,
  getWeeklySalesReport,
} from "../controllers/reportController";

const router = Router();

router.get("/view", getViewReport);
router.get("/sales-weekly", getWeeklySalesReport);

export default router;

import { Router } from "express";
import {
  getCustomers,
  getCustomerById,
} from "../controllers/customerController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.use(verifyToken);

router.get("/", getCustomers);
router.get("/:id", getCustomerById);

export default router;

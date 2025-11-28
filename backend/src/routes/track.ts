import { Router } from "express";
import { trackView } from "../controllers/trackController";

const router = Router();

router.post("/view", trackView);

export default router;

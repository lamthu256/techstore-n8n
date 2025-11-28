// backend/src/routes/analytics.ts
import { Router } from "express";
import { getViewReminderCandidates } from "../controllers/analyticsController";

const router = Router();

router.get("/view-reminder", getViewReminderCandidates);

export default router;

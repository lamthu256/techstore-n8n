import { Router } from "express";
import { notifyInviteUsed } from "../controllers/refShareController";

const router = Router();
router.post("/invite-used", notifyInviteUsed);
export default router;

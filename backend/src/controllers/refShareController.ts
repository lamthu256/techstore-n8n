import { Request, Response } from "express";
import { pool } from "../db";
import api from "./axios";

export const notifyInviteUsed = async (req: Request, res: Response) => {
  try {
    const { customerEmail, discountCode, orderId, total } = req.body as {
      customerEmail: string;
      discountCode: string;
      orderId: string;
      total: number;
    };

    if (!customerEmail || !discountCode) {
      return res
        .status(400)
        .json({ message: "Missing customerEmail or discountCode" });
    }

    const code = discountCode.trim().toUpperCase();

    const refResult = await pool.query(
      `
        SELECT user_email
        FROM referral_invites
        WHERE invite_code = $1
        LIMIT 1
      `,
      [code]
    );

    if (!refResult.rowCount) {
      return res.json({ ok: true, message: "Not a referral code" });
    }

    const inviterEmail = refResult.rows[0].user_email;

    // Gửi sang n8n
    await api.post("/ref-share/reward", {
      inviterEmail,
      invitedEmail: customerEmail,
      discountCode: code,
      orderId,
      total,
    });

    return res.json({ ok: true, message: "Referral recorded & webhook sent" });
  } catch (err) {
    console.error("notifyInviteUsed error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Server error when handling referral" });
  }
};

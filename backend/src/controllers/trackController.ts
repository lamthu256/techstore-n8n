import { Request, Response } from "express";
import { pool } from "../db";

export const trackView = async (req: Request, res: Response) => {
  try {
    const { userId, productId, viewedAt } = req.body;

    console.log("TrackView body:", req.body);

    const result = await pool.query(
      `INSERT INTO view_logs (user_id, product_id, viewed_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, productId, viewedAt]
    );

    console.log("Inserted:", result.rows[0]);

    return res.json({ message: "Tracked view OK" });
  } catch (error: any) {
    console.error("Track view error:", error); // XEM LỖI Ở TERMINAL

    return res.status(500).json({
      message: "Error tracking view",
      error: String(error.message || error),
    });
  }
};

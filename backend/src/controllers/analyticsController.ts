import { Request, Response } from "express";
import { pool } from "../db";

export const getViewReminderCandidates = async (
  req: Request,
  res: Response
) => {
  try {
    // ví dụ: lấy những view trong 1 giờ gần nhất
    const { rows } = await pool.query(`
      SELECT
        vl.user_id,
        vl.product_id,
        MIN(vl.viewed_at) AS first_view,
        MAX(vl.viewed_at) AS last_view,
        u.name        AS user_name,
        u.email       AS user_email,
        p.name        AS product_name,
        p.price       AS product_price,
        p.image       AS product_image
      FROM view_logs vl
      JOIN users u    ON vl.user_id = u.id
      JOIN products p ON vl.product_id = p.id
      WHERE vl.viewed_at > NOW() - INTERVAL '1 hour'
      GROUP BY vl.user_id, vl.product_id, u.name, u.email, p.name, p.price, p.image
      HAVING NOT EXISTS (
        SELECT 1
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        WHERE o.user_id = vl.user_id
          AND oi.product_id = vl.product_id
          AND o.created_at > MIN(vl.viewed_at)
      )
    `);

    // Trả ra list cho n8n
    return res.json({
      items: rows,
    });
  } catch (error) {
    console.error("getViewReminderCandidates error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

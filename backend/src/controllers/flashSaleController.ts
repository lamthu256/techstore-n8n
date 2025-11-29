import { Request, Response } from "express";
import { pool } from "../db";

export const createFlashSale = async (req: Request, res: Response) => {
  try {
    const { name, discountPercent, startAt, endAt } = req.body as {
      name: string;
      discountPercent: number;
      startAt: string;
      endAt: string;
    };

    if (!name || !discountPercent || !startAt || !endAt) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const result = await pool.query(
      `
      INSERT INTO flash_sales (name, discount_percent, start_at, end_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [name, discountPercent, startAt, endAt]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("createFlashSale error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getActiveFlashSale = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM flash_sales
      WHERE start_at <= NOW()
        AND end_at   >= NOW()
      ORDER BY start_at DESC
      LIMIT 1
      `
    );

    if (rows.length === 0) {
      return res.json(null);
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("getActiveFlashSale error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

import { Request, Response } from "express";
import { pool } from "../db";

// Thêm mã giảm giá mới (Admin)
export const addDiscountCode = async (req: Request, res: Response) => {
  const { code, discount } = req.body;

  if (!code || !discount || discount <= 0 || discount > 100) {
    return res
      .status(400)
      .json({ message: "Invalid code or discount percentage" });
  }

  try {
    const upperCode = code.trim().toUpperCase();

    const result = await pool.query(
      `INSERT INTO discount_codes (code, discount, is_active)
       VALUES ($1, $2, TRUE)
       RETURNING *`,
      [upperCode, discount]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("addDiscountCode error:", error);
    res.status(500).json({ message: "Error adding discount code" });
  }
};

// Thay đổi trạng thái mã giảm giá (Admin)
export const toggleDiscountCode = async (req: Request, res: Response) => {
  const { code } = req.params;
  const { isActive } = req.body;

  try {
    const result = await pool.query(
      `UPDATE discount_codes
         SET is_active = $1
         WHERE code = $2
         RETURNING *`,
      [isActive, code.trim().toUpperCase()]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Discount code not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("toggleDiscountCode error:", error);
    res.status(500).json({ message: "Error updating discount code status" });
  }
};

// Xác thực mã giảm giá
export const validateDiscountCode = async (req: Request, res: Response) => {
  try {
    const code = req.body.code?.trim()?.toUpperCase();

    if (!code) {
      return res.status(400).json({ message: "Discount code is required" });
    }

    const { rows } = await pool.query(
      `SELECT code, discount 
       FROM discount_codes 
       WHERE code = $1 AND is_active = TRUE`,
      [code]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Invalid or inactive discount code" });
    }

    return res.json({
      code: rows[0].code,
      discount: rows[0].discount,
      message: `Discount ${rows[0].discount}% applied`,
    });
  } catch (error) {
    console.error("validateDiscountCode error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

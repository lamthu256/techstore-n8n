import { Request, Response } from "express";
import { pool } from "../db";

// Lấy tất cả thông tin customer profiles (Admin)
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, cp.*
       FROM users u
       JOIN customer_profiles cp ON u.id = cp.id`
    );

    // Map dữ liệu sang camelCase nếu cần
    const profiles = result.rows.map((row) => ({
      id: row.id,
      user: {
        name: row.name,
        email: row.email,
      },
      totalOrders: row.total_orders,
      totalSpent: row.total_spent,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer profiles" });
  }
};

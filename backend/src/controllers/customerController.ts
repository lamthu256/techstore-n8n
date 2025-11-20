import { Response } from "express";
import { pool } from "../db";
import { AuthRequest } from "../middleware/authMiddleware";

// Lấy tất cả thông tin customer profiles (Admin)
export const getCustomers = async (req: AuthRequest, res: Response) => {
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

// Lấy thông tin profile cá nhân
export const getCustomerById = async (req: AuthRequest, res: Response) => {
  const userId = req.params.id;

  try {
    // Join 2 bảng users và customer_profiles để lấy full thông tin
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, cp.*
       FROM users u
       JOIN customer_profiles cp ON u.id = cp.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const row = result.rows[0];
    const profile = {
      id: row.id,
      user: {
        name: row.name,
        email: row.email,
      },
      totalOrders: row.total_orders,
      totalSpent: row.total_spent,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// Cập nhật thông tin (Tên, Mật khẩu...)
export const updateProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { name } = req.body; // Giả sử chỉ cho đổi tên, nếu đổi pass cần hash lại

  try {
    await pool.query("UPDATE users SET name = $1 WHERE id = $2", [
      name,
      userId,
    ]);
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
};

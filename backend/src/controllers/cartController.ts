import { Response } from "express";
import { pool } from "../db";
import { AuthRequest } from "../middleware/authMiddleware";

// Lấy giỏ hàng
export const getCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const result = await pool.query(
      `SELECT c.id, c.quantity, 
              json_build_object('id', p.id, 'name', p.name, 'price', p.price, 'image', p.image) as product
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart" });
  }
};

// Thêm vào giỏ (Upsert)
export const addToCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { productId, quantity } = req.body;

  try {
    // Sử dụng cú pháp ON CONFLICT để update nếu đã tồn tại (nhờ constraint unique user_id, product_id)
    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id) 
       DO UPDATE SET quantity = cart_items.quantity + $3`,
      [userId, productId, quantity]
    );
    res.json({ message: "Added to cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding to cart" });
  }
};

// Cập nhật số lượng cụ thể
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { productId, quantity } = req.body; // quantity mới
  try {
    if (quantity <= 0) {
      await pool.query(
        "DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2",
        [userId, productId]
      );
    } else {
      await pool.query(
        "UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3",
        [quantity, userId, productId]
      );
    }
    res.json({ message: "Cart updated" });
  } catch (error) {
    res.status(500).json({ message: "Error updating cart" });
  }
};

// Xóa khỏi giỏ
export const removeFromCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { productId } = req.params;
  try {
    await pool.query(
      "DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );
    res.json({ message: "Item removed" });
  } catch (error) {
    res.status(500).json({ message: "Error removing item" });
  }
};

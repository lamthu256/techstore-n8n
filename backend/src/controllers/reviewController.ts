import { Request, Response } from "express";
import { pool } from "../db";

// Lấy danh sách review của 1 sản phẩm
export const getProductReviews = async (req: Request, res: Response) => {
  const { productId } = req.params;
  try {
    const result = await pool.query(
      `SELECT r.*, u.name
       FROM product_reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [productId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
};

// Thêm review (User)
export const addReview = async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const { productId } = req.params;
  const { rating, comment } = req.body;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    // Kiểm tra xem user đã review sản phẩm này chưa (nếu muốn chặn spam)
    /*
    const check = await pool.query('SELECT * FROM product_reviews WHERE user_id=$1 AND product_id=$2', [userId, productId]);
    if (check.rows.length > 0) return res.status(400).json({ message: 'You already reviewed this product' });
    */

    const result = await pool.query(
      `INSERT INTO product_reviews (user_id, product_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, productId, rating, comment]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding review" });
  }
};

// Xóa Review (User xóa của mình hoặc Admin xóa bất kỳ)
export const deleteReview = async (req: Request, res: Response) => {
  const userId = (req.query?.userId || req.body?.userId) as string;
  const { id } = req.params; // Review ID

  try {
    // Logic: Chỉ xóa nếu là chủ nhân review HOẶC là admin
    const result = await pool.query(
      "DELETE FROM product_reviews WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this review" });
    }

    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review" });
  }
};

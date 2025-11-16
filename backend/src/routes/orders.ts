import express from "express";
import { pool } from "../db";
import { auth } from "./auth";

const router = express.Router();

// GET ALL ORDERS of current user
router.get("/", auth, async (req: any, res) => {
  try {
    // Lấy tất cả orders của user
    const ordersResult = await pool.query(
      `SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC`,
      [req.userId]
    );

    const orders = await Promise.all(
      ordersResult.rows.map(async (order: any) => {
        // Lấy order_items của từng order
        const itemsResult = await pool.query(
          `SELECT oi.id, oi.product_id, oi.quantity, oi.price, p.name, p.image
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id=$1`,
          [order.id]
        );

        return {
          id: order.id,
          userId: order.user_id,
          total: order.total,
          address: order.address,
          createdAt: order.created_at,
          status: order.status,
          items: itemsResult.rows.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            name: item.name,
            image: item.image,
            quantity: item.quantity,
            price: item.price,
          })),
        };
      })
    );

    res.json(orders);
  } catch (err) {
    console.error("GET /orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE ORDER
router.post("/", auth, async (req: any, res) => {
  try {
    const { items, total, address } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!address) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    // 1. Tạo đơn hàng
    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, total, address, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [req.userId, total, address]
    );

    const orderId = orderResult.rows[0].id;

    // 2. Thêm từng item vào order_items
    const insertPromises = items.map((item: any) =>
      pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.productId, item.quantity, item.price]
      )
    );

    await Promise.all(insertPromises);

    res.status(201).json({ message: "Order created", orderId });
  } catch (err) {
    console.error("POST /orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

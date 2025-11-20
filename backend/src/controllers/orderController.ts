import { Response } from "express";
import { pool } from "../db";
import { AuthRequest } from "../middleware/authMiddleware";

// CREATE ORDER
export const createOrder = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { address, items, total } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Order must have items" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Tạo order
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, total, address, status)
       VALUES ($1, $2, $3, 'pending') RETURNING id, total, status, created_at`,
      [userId, total, address]
    );
    const orderId = orderRes.rows[0].id;

    // Tạo order_items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product.id, item.quantity, item.product.price]
      );
    }

    // Xóa giỏ hàng của user
    await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
    await client.query("COMMIT");
    res.status(201).json({ message: "Order placed successfully", orderId });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Error creating order" });
  } finally {
    client.release();
  }
};

// GET USER ORDERS
export const getOrders = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const ordersResult = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    const ordersWithItems = [];

    for (const order of ordersResult.rows) {
      const itemsResult = await pool.query(
        `SELECT oi.*, p.name, p.image
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1`,
        [order.id]
      );
      ordersWithItems.push({ ...order, items: itemsResult.rows });
    }

    res.json(ordersWithItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// ADMIN: GET ALL ORDERS
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const result = await pool.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// ADMIN: GET ORDER DETAIL
export const getOrderById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const orderResult = await pool.query(`SELECT * FROM orders WHERE id = $1`, [
      id,
    ]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const itemsResult = await pool.query(
      `SELECT oi.*, p.name, p.image
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    res.json({ ...orderResult.rows[0], items: itemsResult.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching order details" });
  }
};

// ADMIN: UPDATE ORDER STATUS
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const orderResult = await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(orderResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating order status" });
  }
};

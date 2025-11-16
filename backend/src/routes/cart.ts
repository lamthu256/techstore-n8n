import express from "express";
import { pool } from "../db";
import { auth } from "./auth";
const router = express.Router();

// GET cart items
router.get("/", auth, async (req: any, res) => {
  try {
    const result = await pool.query(
      `SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.description, p.price, p.image
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [req.userId]
    );

    const cartItems = result.rows.map((row: any) => ({
      id: row.id,
      product: {
        id: row.product_id,
        name: row.name,
        description: row.description,
        price: Number(row.price),
        image: row.image,
      },
      quantity: row.quantity,
    }));

    res.json(cartItems);
  } catch (err) {
    console.error("GET /cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST add to cart
router.post("/", auth, async (req: any, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const existing = await pool.query(
      `SELECT * FROM cart_items WHERE user_id=$1 AND product_id=$2`,
      [req.userId, productId]
    );

    if (existing.rows.length > 0) {
      const updated = await pool.query(
        `UPDATE cart_items
         SET quantity = quantity + $1, updated_at = NOW()
         WHERE user_id=$2 AND product_id=$3
         RETURNING *`,
        [quantity, req.userId, productId]
      );
      return res.json(updated.rows[0]);
    }

    const inserted = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.userId, productId, quantity]
    );

    res.status(201).json(inserted.rows[0]);
  } catch (err) {
    console.error("POST /cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update quantity
router.put("/:id", auth, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const updated = await pool.query(
      `UPDATE cart_items
       SET quantity = $1, updated_at = NOW()
       WHERE user_id=$2 AND id=$3
       RETURNING *`,
      [quantity, req.userId, id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json(updated.rows[0]);
  } catch (err) {
    console.error("PUT /cart/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE single cart item
router.delete("/:id", auth, async (req: any, res) => {
  try {
    const { id } = req.params;

    const deleted = await pool.query(
      `DELETE FROM cart_items
       WHERE user_id=$1 AND id=$2
       RETURNING *`,
      [req.userId, id]
    );

    if (deleted.rows.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Item removed" });
  } catch (err) {
    console.error("DELETE /cart/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE all cart items
router.delete("/", auth, async (req: any, res) => {
  try {
    await pool.query(`DELETE FROM cart_items WHERE user_id=$1`, [req.userId]);
    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("DELETE /cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

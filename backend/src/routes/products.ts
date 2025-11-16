import express from "express";
import { pool } from "../db";
const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /products error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET product by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM products WHERE id=$1", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /products/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST product
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image,
      category,
      stock,
      rating,
      reviews,
    } = req.body;
    const result = await pool.query(
      `INSERT INTO products 
       (name, description, price, image, category, stock, rating, reviews, created_at) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()) RETURNING *`,
      [name, description, price, image, category, stock, rating, reviews]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /products error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT product
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock, imageUrl } = req.body;
    const result = await pool.query(
      `UPDATE products 
       SET name=$1, description=$2, price=$3, category=$4, stock=$5, image_url=$6
       WHERE id=$7 RETURNING *`,
      [name, description, price, category, stock, imageUrl, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /products/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM products WHERE id=$1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted", id });
  } catch (err) {
    console.error("DELETE /products/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

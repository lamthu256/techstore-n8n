import { Request, Response } from "express";
import { pool } from "../db";
import api from "./axios";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      WITH active_flash AS (
        SELECT discount_percent
        FROM flash_sales
        WHERE start_at <= NOW()
          AND end_at   >= NOW()
        ORDER BY start_at DESC
        LIMIT 1
      )
      SELECT
        p.*,
        COALESCE(
          (SELECT discount_percent FROM active_flash),
          0
        ) AS flash_discount_percent,
        CASE
          WHEN (SELECT discount_percent FROM active_flash) IS NOT NULL
          THEN ROUND(p.price * (1 - (SELECT discount_percent FROM active_flash) / 100.0))::int
          ELSE p.price
        END AS final_price
      FROM products p
      ORDER BY p.created_at DESC;
    `);

    return res.json(rows);
  } catch (error) {
    console.error("getProducts error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Product not found" });

    // Lấy thêm reviews nếu cần
    // const reviews = await pool.query('SELECT * FROM product_reviews WHERE product_id = $1', [id]);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
};

// 1. Tạo sản phẩm mới (Admin)
export const createProduct = async (req: Request, res: Response) => {
  let { name, description, price, image, category, stock } = req.body;

  try {
    try {
      const n8nResponse = await api.post("/add-product", {
        name,
        description,
        price,
        image,
        category,
      });
      const validated = n8nResponse.data;
      description = validated.description || description;
      image = validated.image || image;
    } catch (err: any) {
      console.error("n8n webhook error:", err.message);
    }

    const result = await pool.query(
      `INSERT INTO products (name, description, price, image, category, stock)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, price, image, category, stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating product" });
  }
};

// 2. Cập nhật sản phẩm (Admin)
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, image, category, stock } = req.body;

  try {
    const result = await pool.query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, image = $4, category = $5, stock = $6
       WHERE id = $7
       RETURNING *`,
      [name, description, price, image, category, stock, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Product not found" });

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error updating product" });
  }
};

// 3. Xóa sản phẩm (Admin)
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" });
  }
};

import { Request, Response } from "express";
import { pool } from "../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import api from "./axios";

// REGISTER
export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    // Check email tồn tại
    const userCheck = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (userCheck.rows.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role",
      [name, email, hashedPassword, role || "user"]
    );

    // Tạo token
    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "1d" }
    );

    const userData = newUser.rows[0];

    // Gọi n8n webhook
    api
      .post("/user-registered", {
        email: userData.email,
        name: userData.name,
      })
      .catch((err) => console.error("n8n webhook error:", err));

    res.json({ token, user: newUser.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (userResult.rows.length === 0)
      return res.status(400).json({ message: "User not found" });

    const user = userResult.rows[0];

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "1d" }
    );

    const { password: _, ...userInfo } = user;
    res.json({ token, user: userInfo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Lấy thông tin user từ token
export const getUser = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Authorization header missing" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret_key"
    );
    const userId = decoded.id;

    const userResult = await pool.query("SELECT * FROM users WHERE id=$1", [
      userId,
    ]);
    if (userResult.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const { password: _, ...userInfo } = userResult.rows[0];
    res.json({ user: userInfo });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid token" });
  }
};

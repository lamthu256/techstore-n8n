import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import cartRoutes from "./routes/cart";
import orderRoutes from "./routes/orders";
import reviewRoutes from "./routes/reviews";
import customerRoutes from "./routes/customer";
import discountRoutes from "./routes/discount";
import trackRoutes from "./routes/track";
import analyticsRoutes from "./routes/analytics";
import reportRoutes from "./routes/report";
import refShareRoutes from "./routes/refShareRoutes";
import flashSaleRoutes from "./routes/flashSaleRoutes";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/reviews", reviewRoutes);
app.use("/customers", customerRoutes);
app.use("/discounts", discountRoutes);
app.use("/track", trackRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/report", reportRoutes);
app.use("/ref-share", refShareRoutes);
app.use("/flash-sales", flashSaleRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

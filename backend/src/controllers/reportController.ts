// backend/src/controllers/reportController.ts
import { Request, Response } from "express";
import { pool } from "../db";

// Báo cáo lượt xem sản phẩm
export const getViewReport = async (req: Request, res: Response) => {
  try {
    const days = Number(req.query.days || 7);

    // 1. Tổng quan lượt xem
    const { rows: overviewRows } = await pool.query(
      `
      SELECT
        COUNT(*)                AS total_views,
        COUNT(DISTINCT user_id) AS unique_users
      FROM view_logs
      WHERE viewed_at >= NOW() - ($1::int || ' day')::interval;
      `,
      [days]
    );

    const overview = overviewRows[0] || {
      total_views: 0,
      unique_users: 0,
    };

    // 2. Lượt xem theo ngày
    const { rows: viewsByDay } = await pool.query(
      `
      SELECT
        to_char(date_trunc('day', viewed_at), 'YYYY-MM-DD') AS date,
        COUNT(*)                                            AS views,
        COUNT(DISTINCT user_id)                             AS unique_users
      FROM view_logs
      WHERE viewed_at >= NOW() - ($1::int || ' day')::interval
      GROUP BY date_trunc('day', viewed_at)
      ORDER BY date_trunc('day', viewed_at);
      `,
      [days]
    );

    // 3. Top sản phẩm được xem nhiều nhất
    const { rows: mostViewedProducts } = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        COUNT(*)                   AS views,
        COUNT(DISTINCT vl.user_id) AS unique_users
      FROM view_logs vl
      JOIN products p ON p.id = vl.product_id
      WHERE vl.viewed_at >= NOW() - ($1::int || ' day')::interval
      GROUP BY p.id, p.name
      ORDER BY views DESC
      LIMIT 10;
      `,
      [days]
    );

    return res.json({
      days,
      overview,
      viewsByDay,
      mostViewedProducts,
    });
  } catch (error) {
    console.error("getViewReport error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// 2. Báo cáo doanh thu + đơn hàng
export const getWeeklySalesReport = async (req: Request, res: Response) => {
  try {
    const days = Number(req.query.days || 7);

    // 1. Tổng quan doanh thu & đơn hàng
    const { rows: overviewRows } = await pool.query(
      `
      SELECT
        COUNT(*) AS total_orders,
        COALESCE(SUM(total), 0)::numeric AS total_revenue,

        COALESCE(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END), 0)
          AS delivered_orders,
        COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0)
          AS cancelled_orders,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0)
          AS pending_orders,
        COALESCE(SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END), 0)
          AS shipped_orders
      FROM orders
      WHERE created_at >= NOW() - ($1::int || ' day')::interval;
      `,
      [days]
    );

    const overview = overviewRows[0] || {
      total_orders: 0,
      total_revenue: 0,
      delivered_orders: 0,
      cancelled_orders: 0,
      pending_orders: 0,
      shipped_orders: 0,
    };

    // 2. Thống kê đơn hàng theo status (để vẽ chart cột)
    const { rows: statusSummary } = await pool.query(
      `
      SELECT
        status,
        COUNT(*)                         AS order_count,
        COALESCE(SUM(total), 0)::numeric AS revenue
      FROM orders
      WHERE created_at >= NOW() - ($1::int || ' day')::interval
      GROUP BY status
      ORDER BY status;
      `,
      [days]
    );

    // 3. Doanh thu theo ngày (chỉ tính đơn delivered để báo cáo đẹp)
    const { rows: revenueByDay } = await pool.query(
      `
      SELECT
        to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date,
        COUNT(*)                                            AS orders,
        COALESCE(SUM(total), 0)::numeric                    AS revenue
      FROM orders
      WHERE created_at >= NOW() - ($1::int || ' day')::interval
        AND status = 'delivered'
      GROUP BY date_trunc('day', created_at)
      ORDER BY date_trunc('day', created_at);
      `,
      [days]
    );

    // 4. Top sản phẩm bán chạy (số lượng & doanh thu, chỉ đơn delivered)
    const { rows: topProducts } = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        COALESCE(SUM(oi.quantity), 0)                     AS total_quantity,
        COALESCE(SUM(oi.quantity * oi.price), 0)::numeric AS total_revenue
      FROM order_items oi
      JOIN orders   o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      WHERE o.created_at >= NOW() - ($1::int || ' day')::interval
        AND o.status = 'delivered'
      GROUP BY p.id, p.name
      ORDER BY total_quantity DESC
      LIMIT 10;
      `,
      [days]
    );

    // 5. Thống kê tồn kho: mỗi sản phẩm còn bao nhiêu, đã bán bao nhiêu trong khoảng thời gian
    const { rows: inventory } = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.stock                                        AS current_stock,
        COALESCE(SUM(oi.quantity), 0)                 AS sold_last_period
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o        ON o.id = oi.order_id
        AND o.created_at >= NOW() - ($1::int || ' day')::interval
        AND o.status = 'delivered'
      GROUP BY p.id, p.name, p.stock
      ORDER BY p.stock ASC, p.name;
      `,
      [days]
    );

    // 6. Top sản phẩm được đánh giá cao
    const { rows: topRatedProducts } = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        ROUND(AVG(r.rating)::numeric, 2) AS avg_rating,
        COUNT(r.id)                      AS review_count
      FROM product_reviews r
      JOIN products p ON p.id = r.product_id
      GROUP BY p.id, p.name
      HAVING COUNT(r.id) >= 2 -- tuỳ bạn, >=2 review là được
      ORDER BY avg_rating DESC, review_count DESC
      LIMIT 10;
      `
    );

    // 7. Tỉ lệ giao thành công (%)
    const delivered = Number(overview.delivered_orders || 0);
    const totalOrders = Number(overview.total_orders || 0);
    const deliveredRate =
      totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0;

    return res.json({
      days,
      overview: {
        ...overview,
        delivered_rate: deliveredRate,
      },
      statusSummary, // thống kê theo status
      revenueByDay, // doanh thu theo ngày
      topProducts, // top sp bán chạy
      inventory, // tồn kho + đã bán trong khoảng thời gian
      topRatedProducts, // top sp được đánh giá cao
    });
  } catch (error) {
    console.error("getWeeklySalesReport error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

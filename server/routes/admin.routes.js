import express from "express";
import prisma from "../prisma/client.js";
import { authenticate } from "../auth.js";
import { requireRole } from "../roles.js";

const router = express.Router();

// GET /admin/metrics (ADMIN only)
router.get("/metrics", authenticate, requireRole("ADMIN"), async (req, res) => {
  try {
    const totalClaims = await prisma.claim.count();

    const grouped = await prisma.claim.groupBy({
      by: ["status"],
      _count: { status: true },
      _sum: { amount: true },
    });

    const byStatus = grouped.map((g) => ({
      status: g.status,
      count: g._count.status,
      totalAmount: g._sum.amount || 0,
    }));

    res.json({ totalClaims, byStatus });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch metrics" });
  }
});

export default router;

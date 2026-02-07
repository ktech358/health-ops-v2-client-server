import express from "express";
import prisma from "../prisma/client.js";
import { authenticate } from "../auth.js";
import { requireRole } from "../roles.js";

const router = express.Router();

// GET /audit-logs (ADMIN only)
router.get("/", authenticate, requireRole("ADMIN"), async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        claim: true,
        user: { select: { email: true, role: true } },
      },
    });

    res.json(logs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});

export default router;

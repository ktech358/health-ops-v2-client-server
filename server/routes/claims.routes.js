import express from "express";
import prisma from "../prisma/client.js";
import { authenticate } from "../auth.js";
import { requireRole } from "../roles.js";
import { updateClaimStatus } from "../controllers/claim.controller.js";

const router = express.Router();

/**
 * GET /claims
 * ADMIN + OPS → all claims (include member)
 * MEMBER → only their claims
 */
router.get("/", authenticate, async (req, res) => {
  try {
    if (req.user.role === "MEMBER") {
      const claims = await prisma.claim.findMany({
        where: { memberId: req.user.id },
      });
      return res.json(claims);
    }

    const claims = await prisma.claim.findMany({
      include: { member: true },
    });

    res.json(claims);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch claims" });
  }
});

/**
 * POST /claims
 * MEMBER only
 */
router.post("/", authenticate, requireRole("MEMBER"), async (req, res) => {
  try {
    const { diagnosis, amount } = req.body;

    if (!diagnosis || amount === undefined) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const claim = await prisma.claim.create({
      data: {
        diagnosis,
        amount: Number(amount),
        memberId: req.user.id,
      },
    });

    res.status(201).json(claim);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create claim" });
  }
});

/**
 * PATCH /claims/:id/status
 * OPS + ADMIN only
 * (this controller writes AuditLog)
 */
router.patch(
  "/:id/status",
  authenticate,
  requireRole("ADMIN", "OPS"),
  updateClaimStatus
);

export default router;

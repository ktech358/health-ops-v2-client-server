import express from "express";
import { authenticate } from "../auth.js";
import { requireRole } from "../roles.js";
import { claims } from "../claims.js";
import prisma from "../prisma/client.js";
import { updateClaimStatus } from "../controllers/claim.controller.js";


const router = express.Router();

/**
 * ADMIN + OPS → see all claims
 * MEMBER → see only their claims
 */
router.get("/", authenticate, async (req, res) => {
  try {
    let claims;

    if (req.user.role === "MEMBER") {
      claims = await prisma.claim.findMany({
        where: { memberId: req.user.id },
      });
    } else {
      claims = await prisma.claim.findMany({
        include: { member: true },
      });
    }

    res.json(claims);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch claims" });
  }
});

/**
 * ADMIN + OPS → update claim status
 * MEMBER → forbidden
 */
router.patch(
  "/:id/status",
  authenticate,
  requireRole("ADMIN", "OPS"),
  async (req, res) => {
    try {
      const { status } = req.body;

      const claim = await prisma.claim.findUnique({
        where: { id: Number(req.params.id) },
      });

      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }

      const updated = await prisma.claim.update({
        where: { id: claim.id },
        data: {
          status,
          updatedById: req.user.id,
        },
      });

      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update claim" });
    }
  }
);

router.patch(
  "/:id/status",
  authenticate,
  requireRole("ADMIN", "OPS"),
  updateClaimStatus
);


router.post("/", authenticate, requireRole("MEMBER"), async (req, res) => {
  try {
    const { diagnosis, amount } = req.body;

    if (!diagnosis || !amount) {
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



export default router;

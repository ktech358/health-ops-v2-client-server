import prisma from "../prisma/client.js";

const ALLOWED = {
  SUBMITTED: ["IN_REVIEW"],
  IN_REVIEW: ["APPROVED", "DENIED"],
  APPROVED: [],
  DENIED: [],
};

export const updateClaimStatus = async (req, res) => {
  try {
    if (req.user.role === "MEMBER") {
      return res.status(403).json({ message: "Members cannot update claim status" });
    }

    const id = Number(req.params.id);
    const { status } = req.body;

    if (!status) return res.status(400).json({ message: "Missing status" });

    const claim = await prisma.claim.findUnique({ where: { id } });
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    const current = claim.status;
    const next = status;

    if (!ALLOWED[current]?.includes(next)) {
      return res.status(400).json({ message: `Invalid transition from ${current} → ${next}` });
    }

    const updated = await prisma.claim.update({
      where: { id },
      data: {
        status: next,
        updatedById: req.user.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        claimId: id,
        oldStatus: current,
        newStatus: next,
        changedBy: req.user.id,
      },
    });

    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to update status" });
  }
};

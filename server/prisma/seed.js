import prisma from "./client.js";
import bcrypt from "bcryptjs";
import { Role, ClaimStatus } from "@prisma/client";

async function main() {
  // 1) Clean tables (order matters)
  await prisma.claim.deleteMany();
  await prisma.user.deleteMany();

  // 2) Create users (hashed passwords)
  const adminPass = await bcrypt.hash("admin123", 10);
  const opsPass = await bcrypt.hash("ops123", 10);
  const memberPass = await bcrypt.hash("viewer123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@healthops.com",
      password: adminPass,
      role: Role.ADMIN,
    },
  });

  const ops = await prisma.user.create({
    data: {
      email: "ops@healthops.com",
      password: opsPass,
      role: Role.OPS,
    },
  });

  const member = await prisma.user.create({
    data: {
      email: "viewer@healthops.com",
      password: memberPass,
      role: Role.MEMBER,
    },
  });

  // 3) Create claims for the MEMBER
  await prisma.claim.createMany({
    data: [
      {
        diagnosis: "ER Visit - Chest Pain",
        amount: 4200,
        status: ClaimStatus.SUBMITTED,
        memberId: member.id,
      },
      {
        diagnosis: "Knee Surgery",
        amount: 8200,
        status: ClaimStatus.IN_REVIEW,
        memberId: member.id,
      },
      {
        diagnosis: "Lab Work Follow-up",
        amount: 350,
        status: ClaimStatus.APPROVED,
        memberId: member.id,
      },
    ],
  });

  console.log("✅ Seeded users + claims:");
  console.log("ADMIN:", admin.email);
  console.log("OPS:", ops.email);
  console.log("MEMBER:", member.email);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

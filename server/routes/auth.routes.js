import express from "express";
import bcrypt from "bcryptjs";
import prisma from "../prisma/client.js";
import { generateToken } from "../auth.js";

const router = express.Router();

/**
 * POST /auth/register
 * Body: { email, password, role? }
 * Default role = MEMBER
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    // prevent duplicates
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // allow only these roles, default MEMBER
    const safeRole = role && ["ADMIN", "OPS", "MEMBER"].includes(role)
      ? role
      : "MEMBER";

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: safeRole,
      },
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Register failed" });
  }
});

/**
 * POST /auth/login
 * Body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

export default router;

import prisma from "./prisma/client.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import claimsRoutes from "./routes/claims.routes.js";

dotenv.config();

const app = express();
// app.use(cors());
app.use(cors({
  origin: ["http://localhost:5173", process.env.FRONTEND_URL],
  credentials: true,
}));

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/claims", claimsRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

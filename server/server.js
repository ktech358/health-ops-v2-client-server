import prisma from "./prisma/client.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import claimsRoutes from "./routes/claims.routes.js";

dotenv.config();

const app = express();
// app.use(cors());

/* const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean); */

const allowedOrigins = [
  "http://localhost:5173",
  "https://health-ops-portal.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);


/* app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests with no origin (like Postman)
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error("CORS blocked: " + origin), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
 */

app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests with no origin (Postman, server-to-server)
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(null, false); // block unknown origins silently
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// IMPORTANT: respond to preflight
/* app.options("*", cors());
app.options("/*", cors()); */

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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";

import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      // keep your existing AuthContext behavior (localStorage-based)
      // remember toggle is optional: minimal approach is to always store
      if (!remember) {
        // minimal "remember off": store for session only
        sessionStorage.setItem("auth", JSON.stringify(res.data));
        localStorage.removeItem("auth");
      } else {
        localStorage.setItem("auth", JSON.stringify(res.data));
        sessionStorage.removeItem("auth");
      }

      login(res.data);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(1200px circle at 10% 10%, rgba(25,118,210,0.25), transparent 40%), radial-gradient(900px circle at 90% 20%, rgba(156,39,176,0.20), transparent 40%), radial-gradient(900px circle at 50% 90%, rgba(0,200,83,0.12), transparent 45%), #0b1220",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                background: "rgba(25,118,210,0.20)",
                border: "1px solid rgba(25,118,210,0.35)",
              }}
            >
              <LockOutlined />
            </Box>

            <Box>
              <Typography variant="h5" sx={{ color: "white", fontWeight: 700 }}>
                Health Ops Portal
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                Sign in to manage claims
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.12)" }} />

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.7)" } }}
              InputProps={{
                sx: {
                  color: "white",
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.04)",
                },
              }}
            />

            <TextField
              label="Password"
              type={showPw ? "text" : "password"}
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.7)" } }}
              InputProps={{
                sx: {
                  color: "white",
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.04)",
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPw((v) => !v)}
                      edge="end"
                      sx={{ color: "rgba(255,255,255,0.7)" }}
                    >
                      {showPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    sx={{ color: "rgba(255,255,255,0.7)" }}
                  />
                }
                label={
                  <Typography sx={{ color: "rgba(255,255,255,0.75)" }}>
                    Remember me
                  </Typography>
                }
              />
            </Box>

            {error && (
              <Typography sx={{ color: "#ff6b6b", mt: 1 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 2.5,
                py: 1.2,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={18} color="inherit" />
                  Signing in…
                </Box>
              ) : (
                "Sign in"
              )}
            </Button>

            <Typography sx={{ mt: 2, color: "rgba(255,255,255,0.55)" }}>
              Demo creds: admin@healthops.com / admin123
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Chip,
  Paper,
  Select,
  MenuItem,
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadClaims() {
      try {
        setLoading(true);
        await refreshClaims();
      } finally {
        setLoading(false);
      }
    }
    loadClaims();
  }, []);

  /*   const columns = useMemo(() => {
    const base = [
      { field: "id", headerName: "ID", width: 80 },
      { field: "diagnosis", headerName: "Diagnosis", flex: 1, minWidth: 220 },
      {
        field: "amount",
        headerName: "Amount",
        width: 120,
        valueFormatter: (params) => `$${Number(params.value).toLocaleString()}`,
      },
      {
        field: "status",
        headerName: "Status",
        width: 140,
      },
      {
        field: "createdAt",
        headerName: "Created",
        width: 170,
        valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleString() : "",
      },
    ];

    // Only show member email to OPS/ADMIN
    if (user.role !== "MEMBER") {
      base.splice(4, 0, {
        field: "memberEmail",
        headerName: "Member",
        width: 240,
        valueGetter: (params) => params.row?.member?.email || "",
      });
    }

    return base;
  }, [user.role]); */

  const NEXT = {
    SUBMITTED: ["IN_REVIEW"],
    IN_REVIEW: ["APPROVED", "DENIED"],
    APPROVED: [],
    DENIED: [],
  };

  const refreshClaims = async () => {
    const res = await api.get("/claims");
    setClaims(res.data);
  };

  const updateStatus = async (claimId, newStatus) => {
    await api.patch(`/claims/${claimId}/status`, { status: newStatus });
    await refreshClaims();
  };

  const columns = useMemo(() => {
    const base = [
      { field: "id", headerName: "ID", width: 80 },
      { field: "diagnosis", headerName: "Diagnosis", flex: 1, minWidth: 220 },
      {
        field: "amount",
        headerName: "Amount",
        width: 130,
        valueFormatter: (params) => {
          const v = params.value;
          const n =
            typeof v === "number"
              ? v
              : typeof v === "string"
                ? parseFloat(v)
                : Number(v);

          if (Number.isNaN(n)) return "$0";
          return `$${n.toLocaleString()}`;
        },
      },
      { field: "status", headerName: "Status", width: 140 },
      {
        field: "createdAt",
        headerName: "Created",
        width: 170,
        valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleString() : "",
      },
    ];

    if (user.role !== "MEMBER") {
      base.splice(4, 0, {
        field: "memberEmail",
        headerName: "Member",
        width: 260,
        sortable: false,
        renderCell: (params) => params?.row?.member?.email || "",
      });
    }

    // OPS/ADMIN only: status update dropdown
    if (user.role !== "MEMBER") {
      base.push({
        field: "updateStatus",
        headerName: "Update Status",
        width: 200,
        sortable: false,
        renderCell: (params) => {
          const row = params?.row;
          const options = NEXT[row?.status] || [];

          if (!options.length) return "—";

          return (
            <Select
              size="small"
              value=""
              displayEmpty
              onChange={(e) => updateStatus(row.id, e.target.value)}
              sx={{ width: 160 }}
            >
              <MenuItem value="" disabled>
                Choose…
              </MenuItem>
              {options.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          );
        },
      });
    }

    return base;
  }, [user.role]);

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Health Ops Portal
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
          {user.role === "ADMIN" && (
            <Button color="inherit" onClick={() => navigate("/audit-logs")}>
              Audit Logs
            </Button>
          )}
          {user.role === "ADMIN" && (
            <Button color="inherit" onClick={() => navigate("/admin")}>
              Analytics
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Typography variant="h6">Logged in as: {user.email}</Typography>
          <Chip label={user.role} />
        </Box>

        <Paper sx={{ height: 520, borderRadius: 3, overflow: "hidden" }}>
          <DataGrid
            rows={claims}
            columns={columns}
            getRowId={(row) => row.id}
            loading={loading}
            pageSizeOptions={[5, 10, 20]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
              sorting: { sortModel: [{ field: "id", sort: "desc" }] },
            }}
            disableRowSelectionOnClick
          />
        </Paper>
      </Container>
    </>
  );
}

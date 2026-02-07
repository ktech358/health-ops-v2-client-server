import { useEffect, useState } from "react";
import api from "../api/axios";
import { DataGrid } from "@mui/x-data-grid";
import { Container, Typography, Paper } from "@mui/material";

export default function AuditLogs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.get("/audit-logs");
        setRows(res.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    {
      field: "createdAt",
      headerName: "When",
      width: 180,
      valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleString() : ""),
    },
    {
      field: "claimId",
      headerName: "Claim ID",
      width: 110,
    },
    { field: "oldStatus", headerName: "Old", width: 120 },
    { field: "newStatus", headerName: "New", width: 120 },
    {
      field: "changedByEmail",
      headerName: "Changed By",
      width: 260,
      sortable: false,
      renderCell: (p) => p?.row?.user?.email || "",
    },
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Audit Logs (Admin only)
      </Typography>

      <Paper sx={{ height: 560, borderRadius: 3, overflow: "hidden" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          pageSizeOptions={[10, 20, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 20, page: 0 } },
            sorting: { sortModel: [{ field: "id", sort: "desc" }] },
          }}
          disableRowSelectionOnClick
        />
      </Paper>
    </Container>
  );
}

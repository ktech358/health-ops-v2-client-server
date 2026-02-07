import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Divider,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.get("/admin/metrics");
        setData(res.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const rows = useMemo(() => {
    return (data?.byStatus || []).map((x, idx) => ({
      id: idx + 1,
      status: x.status,
      count: x.count,
      totalAmount: x.totalAmount,
    }));
  }, [data]);

  const columns = [
    { field: "status", headerName: "Status", width: 180 },
    { field: "count", headerName: "Count", width: 120 },
    {
      field: "totalAmount",
      headerName: "Total Amount",
      width: 180,
      valueFormatter: (p) => {
        const n = Number(p.value);
        return Number.isNaN(n) ? "$0" : `$${n.toLocaleString()}`;
      },
    },
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Admin Analytics
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Typography sx={{ opacity: 0.7 }}>Total Claims</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {loading ? "…" : data?.totalClaims ?? 0}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Typography sx={{ opacity: 0.7 }}>Status Breakdown</Typography>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ height: 360 }}>
              <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                disableRowSelectionOnClick
                hideFooterSelectedRowCount
                pageSizeOptions={[5, 10]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 5, page: 0 } },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

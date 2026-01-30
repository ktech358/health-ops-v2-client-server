import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await api.get("/claims");
        setClaims(res.data);
      } catch (err) {
        console.error("Failed to fetch claims", err);
      }
    };

    fetchClaims();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>

      <p>
        Logged in as: <strong>{user.email}</strong> ({user.role})
      </p>

      <button onClick={logout}>Logout</button>

      <hr />

      <h2>Claims</h2>

      {claims.length === 0 && <p>No claims found</p>}

      <ul>
        {claims.map((claim) => (
          <li key={claim.id}>
            <strong>{claim.diagnosis}</strong> — ${claim.amount} —{" "}
            {claim.status}

            {user.role !== "MEMBER" && claim.member && (
              <span> (Member: {claim.member.email})</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// src/app/admin/invite/page.tsx
"use client";

import { useState } from "react";
import { sendInvite, getErrorMessage } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function InvitePage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("lecturer");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await sendInvite(email, role);
      setMessage(res.data.message);
      setEmail("");
    } catch (err: unknown) {
      setMessage(getErrorMessage(err));
    }
  };

  return (
    <ProtectedRoute allowed={["admin"]}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Send User Invite</h1>
        {message && <p>{message}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-72">
          <input
            className="border p-2 rounded"
            type="email"
            placeholder="User Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <select
            className="border p-2 rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="lecturer">Lecturer</option>
            <option value="coordinator">Coordinator</option>
          </select>
          <button className="bg-purple-600 text-white p-2 rounded">
            Send Invite
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}

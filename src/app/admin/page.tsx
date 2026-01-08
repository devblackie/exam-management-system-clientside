// src/app/admin/page.tsx
"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <ProtectedRoute allowed={["admin"]}>
    
       <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p>Welcome, {user?.name}!</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/invite"
            className="bg-green-base hover:bg-green-dark text-white p-4 rounded-lg shadow"
          >
            Send Invites
          </Link>
          <Link
            href="/admin/users"
            className="bg-green-base hover:bg-green-dark text-white p-4 rounded-lg shadow"
          >
            Manage Users
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}





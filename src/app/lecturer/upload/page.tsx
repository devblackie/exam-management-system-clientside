"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import UploadResultForm from "@/components/utils/UploadResultForm";

export default function UploadPage() {
  return (
    <ProtectedRoute allowed={["lecturer"]}>
      <UploadResultForm />
    </ProtectedRoute>
  );
}

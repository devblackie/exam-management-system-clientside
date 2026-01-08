"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { sendInvite, getErrorMessage } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import CommonButton from "@/components/ui/CommonButton";

export default function InviteFormPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"lecturer" | "coordinator">("lecturer");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  // Auto-generate name when email changes
  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (value.includes("@")) {
      const defaultName = value
        .split("@")[0]
        .split(".")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
      setName(defaultName);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendInvite(email, role, name);
      addToast(`Invite sent to ${name} (${email}) as ${role}`, "success");
      setEmail("");
      setName("");
    } catch (err) {
      addToast(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowed={["admin"]}>
      <div className="flex flex-col items-center justify-center bg-yellow-gold min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Send User Invite</h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 w-72 shadow-lg bg-green-darkest p-6 rounded-lg"
        >
          <input
            className="border p-2 rounded"
            type="email"
            placeholder="User Email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            required
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="border p-2 rounded"
            required
          />
          <select
            className="border p-2 rounded"
            value={role}
            onChange={(e) =>
              setRole(e.target.value as "lecturer" | "coordinator")
            }
          >
            <option value="lecturer">Lecturer</option>
            <option value="coordinator">Coordinator</option>
          </select>

          <CommonButton
            type="submit"
            disabled={loading}
            className="mt-5 font-bold  w-full max-w-[250px]"
            textColor="text-green-darkest"
          >
            {loading ? "Inviting..." : "Send Invite"}
          </CommonButton>
        </form>
      </div>
    </ProtectedRoute>
  );
}

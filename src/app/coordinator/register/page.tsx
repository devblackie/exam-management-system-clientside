"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/config/axiosInstance";
import { getErrorMessage } from "@/lib/api";

export default function CoordinatorSecretRegisterPage() {
  const [secret, setSecret] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await api.post<{ message: string }>("/coordinator/secret-register", {
        secret,
        name,
        email,
        password,
      });
      setMessage(res.data.message);

      setTimeout(() => router.push("/login"), 1500);
    } catch (err: unknown) {
      setMessage(getErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-darkest text-white">
      <h1 className="text-2xl font-bold mb-4">Coordinator Secret Register</h1>
      {message && <p className="mb-2 text-blue-400">{message}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-72">
        <input
          type="text"
          placeholder="Secret Key"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          required
          className="border p-2 rounded text-black"
        />
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border p-2 rounded text-black"
        />
        <input
          type="email"
          placeholder="Coordinator Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 rounded text-black"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 rounded text-black"
        />
        <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded">
          Register Coordinator
        </button>
      </form>
    </div>
  );
}

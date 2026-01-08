// src/app/secret-register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/config/axiosInstance";
import { getErrorMessage } from "@/lib/api";
import CommonButton from "@/components/ui/CommonButton";
import { Eye, EyeOff } from "lucide-react";

export default function SecretRegisterPage() {
  const [secret, setSecret] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const res = await api.post<{ message: string }>("/auth/secret-register", {
        secret,
        name,
        email: email.toLowerCase(),
        password,
      });
      setMessage(res.data.message);
      setSecret("");
      setName("");
      setEmail("");
      setPassword("");

      // redirect after success
      setTimeout(() => {
        router.push("/login");
      }, 500);
    } catch (err: unknown) {
      setMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-darkest to-green-dark text-white">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        <h1 className="text-2xl font-bold mb-6 text-center ">Admin Register</h1>
        {message && <p className="mb-2 text-blue-600">{message}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 ">
          <div>
            <label className="block text-lime-bright font-bold mb-2">Key</label>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="provided by System Administrator"
              className=" w-full rounded-md border border-lime-bright border-t-transparent bg-transparent px-3  py-3  text-lime-bright  outline-0 transition-all  focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-green-base/40"
              required
            />
          </div>
          <div>
            <label className="block text-lime-bright font-bold mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Admin name"
              className=" w-full rounded-md border border-lime-bright border-t-transparent bg-transparent px-3  py-3  text-lime-bright  outline-0 transition-all  focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-green-base/40"
              required
            />
          </div>
          <div>
            <label className="block text-lime-bright font-bold mb-2">
              Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email "
              className=" w-full rounded-md border border-lime-bright border-t-transparent bg-transparent px-3  py-3  text-lime-bright  outline-0 transition-all  focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-green-base/40"
              required
            />
          </div>
          <div className=" relative">
            <label className="block text-lime-bright font-bold mb-2">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a strong password"
              className=" w-full rounded-md border border-lime-bright border-t-transparent bg-transparent px-3  py-3  text-lime-bright  outline-0 transition-all  focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-green-base/40"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-lime-bright   focus:outline-none rounded-full p-1"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <CommonButton
            type="submit"
            disabled={loading}
            className="mt-5 font-bold  w-full "
            textColor="text-green-darkest"
          >
            {loading ? "Creating Account..." : "Register Admin"}
          </CommonButton>
        </form>
      </div>
    </div>
  );
}

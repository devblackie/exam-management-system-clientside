// src/app/register/[token]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { registerWithInvite, getErrorMessage } from "@/lib/api";
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import CommonButton from "@/components/ui/CommonButton";

export default function InviteRegisterPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await registerWithInvite(token, password);
      setMessage(res.data.message);
      setTimeout(() => router.push("/login"), 500); // redirect after 5s
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="flex flex-col bg-yellow-gold items-center justify-center min-h-screen  px-4">
      <div className="w-full max-w-md bg-green-darkest shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Complete Your Registration
        </h1>

        {error && <p className="mb-2 text-red-600 text-sm">{error}</p>}
        {message && <p className="mb-2 text-green-600 text-sm">{message}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative flex items-center">
            <LockClosedIcon className="h-5 w-5 text-yellow-gold m-2" />
            <input
              className="p-2 px-3 border-yellow-gold/40 text-yellow-gold border-b-[2px] focus:border-lime-bright w-full outline-0 bg-transparent transition duration-300"
              type={showPassword ? "text" : "password"}
              placeholder="Choose a password"
              value={password}
              minLength={6}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-green-base dark:text-yellow-gold/50 hover:text-green-darkest dark:hover:text-lime-bright focus:outline-none rounded-full p-1"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <CommonButton
            type="submit"
            disabled={loading}
            className="mt-5 font-bold  w-full max-w-[250px]"
            textColor="text-green-darkest"
          >
            {loading ? "Registering..." : "Register"}
          </CommonButton>
        </form>
      </div>
    </div>
  );
}

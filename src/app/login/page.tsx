// src/app/login/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  LockClosedIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/solid";
import { branding } from "@/config/branding";
import CommonButton from "@/components/ui/CommonButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const { loginUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginUser(email, password);
      // ✅ redirect handled inside AuthContext
    } catch  {
      setError("Login failed. Check credentials.");
    } 
    finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="flex flex-col items-center justify-center bg-green-darkest min-h-screen">
      <div className="absolute top-20 [perspective:1000px] w-[200px] h-[40px] ">
        <div className="w-full h-full animate-spinLateral [transform-style:preserve-3d]">
          {/* Front side */}
          <Image
            src={branding.institutionLogo}
            alt={branding.logoAltText}
            width={200}
            height={200}
              priority            
              style={{ height: 'auto', width: 'auto' }}
            className="absolute inset-0 [backface-visibility:hidden]"
          />
          {/* Back side (mirrored) */}
          <Image
            src={branding.institutionLogo}
            alt={`${branding.logoAltText} back`}
            width={200}
            height={200}
              priority            
              style={{ height: 'auto', width: 'auto' }}
            className="absolute inset-0 rotate-y-180 [backface-visibility:hidden]"
          />
        </div>
      </div>
      <h4 className="mb-7 font-bold text-foreground dark:text-white-pure sm:text-5xl ">
        {branding.appName}
      </h4>
      {/* <h1 className="text-2xl font-bold mb-4">Login</h1> */}
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-64 mt-7">
        <div className="flex items-center  rounded-md">
          <EnvelopeIcon className="w-5 h-5 m-2 text-yellow-gold" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 px-3 border-yellow-gold/40 text-yellow-gold border-b-[2px] focus:border-lime-bright w-full outline-0 bg-transparent transition duration-300"
            required
          />
        </div>
        <div className="flex items-center relative rounded-md">
          <LockClosedIcon className="w-5 h-5 m-2 text-yellow-gold" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 px-3 border-yellow-gold/40 text-yellow-gold border-b-[2px] focus:border-lime-bright w-full outline-0 bg-transparent transition duration-300"
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
          {loading ? "Logging in..." : "Login"}
        </CommonButton>
      </form>
    </div>
  );
}

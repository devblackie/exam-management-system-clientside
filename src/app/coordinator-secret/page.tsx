// clientside/src/app/coordinator-secret/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPublicInstitutions } from "@/api/institutionsApi";
import api from "@/config/axiosInstance";
import { getErrorMessage } from "@/lib/api";
import CommonButton from "@/components/ui/CommonButton";
import { Eye, EyeOff } from "lucide-react";

interface Institution {
  _id: string;
  name: string;
  code: string;
}

export default function CoordinatorSecretRegisterPage() {
  const [secret, setSecret] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  // FETCH INSTITUTIONS USING YOUR PERFECT API
  useEffect(() => {
    const fetchInstitutions = async () => {
      setFetching(true);
      try {
        const data = await getPublicInstitutions();
        console.log("Institutions loaded:", data);
        setInstitutions(data);

        if (data.length === 1) {
          setInstitutionId(data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load institutions:", err);
        setMessage("Could not load institutions. Please refresh.");
      } finally {
        setFetching(false);
      }
    };

    fetchInstitutions();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!institutionId) {
      setMessage("Please select an institution");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await api.post("/coordinator/secret-register", {
        secret,
        name,
        email: email.toLowerCase(),
        password,
        institutionId,
      });

      setMessage(
        "Coordinator registered successfully! Redirecting to Login..."
      );
      setSecret("");
      setName("");
      setEmail("");
      setPassword("");
      setInstitutionId("");
      setTimeout(() => router.push("/login"), 500);
    } catch (err: unknown) {
      setMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="flex flex-col items-center justify-center -py-10 min-h-screen bg-gradient-to-br from-green-darkest to-green-dark text-white">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Coordinator Registration
        </h1>

        {message && (
          <p
            className={`mb-4 text-center font-medium ${
              message.includes("success") ? "text-green-300" : "text-red-300"
            }`}
          >
            {message}
          </p>
        )}

        {fetching ? (
          <div className="text-center py-20">
            <div className="inline-block w-20 h-20 border-8 border-white border-t-transparent rounded-full animate-spin mb-8"></div>
            <p className="text-xl font-bold">Loading institutions...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 ">
            <div>
              <label className="block text-lime-bright font-bold mb-2">
                Key
              </label>
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="provided by Admin"
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
                placeholder="Your full name"
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
                placeholder="Your email address"
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

            <div>
              <label className="block text-lime-bright font-bold mb-2">
                Department
              </label>
              <select
                value={institutionId}
                onChange={(e) => setInstitutionId(e.target.value)}
                className=" w-full rounded-md border border-lime-bright border-t-transparent bg-transparent px-3  py-3  text-lime-bright  outline-0 transition-all  focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-green-base/40"
                required
              >
                <option value="">Select Your Department</option>
                {institutions.map((inst) => (
                  <option
                    key={inst._id}
                    value={inst._id}
                    className="bg-lime-bright text-green-darkest "
                  >
                    {inst.name} ({inst.code})
                  </option>
                ))}
              </select>
            </div>

            <CommonButton
              type="submit"
              disabled={loading || !institutionId}
              className="mt-5 font-bold  w-full "
              textColor="text-green-darkest"
            >
              {loading ? "Creating Account..." : "Register as Coordinator"}
            </CommonButton>
          </form>
        )}

        <div className="text-center mt-12 text-white/80">
          <p className="text-lg">
            Need access? Contact{" "}
            <span className="font-bold text-yellow-400">
              System Administrator
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

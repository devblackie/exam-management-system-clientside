// // src/app/login/page.tsx
// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import { useAuth } from "@/context/AuthContext";
// import {
//   LockClosedIcon,
//   EnvelopeIcon,
//   EyeIcon,
//   EyeSlashIcon,
// } from "@heroicons/react/24/solid";
// import { branding } from "@/config/branding";
// import CommonButton from "@/components/ui/CommonButton";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [error, setError] = useState("");
//   const { loginUser } = useAuth();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     try {
//       await loginUser(email, password);
//       // ✅ redirect handled inside AuthContext
//     } catch  {
//       setError("Login failed. Check credentials.");
//     } 
//     finally {
//       setLoading(false);
//     }
//   };

//   const togglePasswordVisibility = () => setShowPassword(!showPassword);

//   return (
//     <div className="flex flex-col items-center justify-center bg-green-darkest min-h-screen">
//       <div className="absolute top-20 [perspective:1000px] w-[200px] h-[40px] ">
//         <div className="w-full h-full animate-spinLateral [transform-style:preserve-3d]">
//           {/* Front side */}
//           <Image
//             src={branding.institutionLogo}
//             alt={branding.logoAltText}
//             width={200}
//             height={200}
//               priority            
//               style={{ height: 'auto', width: 'auto' }}
//             className="absolute inset-0 [backface-visibility:hidden]"
//           />
//           {/* Back side (mirrored) */}
//           <Image
//             src={branding.institutionLogo}
//             alt={`${branding.logoAltText} back`}
//             width={200}
//             height={200}
//               priority            
//               style={{ height: 'auto', width: 'auto' }}
//             className="absolute inset-0 rotate-y-180 [backface-visibility:hidden]"
//           />
//         </div>
//       </div>
//       <h4 className="mb-7 font-bold text-foreground dark:text-white-pure sm:text-5xl ">
//         {branding.appName}
//       </h4>
//       {/* <h1 className="text-2xl font-bold mb-4">Login</h1> */}
//       {error && <p className="text-red-500">{error}</p>}
//       <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-64 mt-7">
//         <div className="flex items-center  rounded-md">
//           <EnvelopeIcon className="w-5 h-5 m-2 text-yellow-gold" />
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="p-2 px-3 border-yellow-gold/40 text-yellow-gold border-b-[2px] focus:border-lime-bright w-full outline-0 bg-transparent transition duration-300"
//             required
//           />
//         </div>
//         <div className="flex items-center relative rounded-md">
//           <LockClosedIcon className="w-5 h-5 m-2 text-yellow-gold" />
//           <input
//             type={showPassword ? "text" : "password"}
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="p-2 px-3 border-yellow-gold/40 text-yellow-gold border-b-[2px] focus:border-lime-bright w-full outline-0 bg-transparent transition duration-300"
//             required
//           />
//           <button
//             type="button"
//             onClick={togglePasswordVisibility}
//             className="absolute right-3 top-1/2 -translate-y-1/2 text-green-base dark:text-yellow-gold/50 hover:text-green-darkest dark:hover:text-lime-bright focus:outline-none rounded-full p-1"
//           >
//             {showPassword ? (
//               <EyeSlashIcon className="h-5 w-5" />
//             ) : (
//               <EyeIcon className="h-5 w-5" />
//             )}
//           </button>
//         </div>

//         <CommonButton
//           type="submit"
//           disabled={loading}
//           className="mt-5 font-bold  w-full max-w-[250px]"
//           textColor="text-green-darkest"
//         >
//           {loading ? "Logging in..." : "Login"}
//         </CommonButton>
//       </form>
//     </div>
//   );
// }

"use client";

import {  useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react"; // Switched to Lucide
import { branding } from "@/config/branding";
import CommonButton from "@/components/ui/CommonButton";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { loginUser } = useAuth();



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      await loginUser(email, password);
    } catch  {
      setError("Invalid credentials. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-green-darkest min-h-screen p-4">
      {/* Animated Logo Section */}
      <div className="relative w-32 h-32 mb-8">
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-full h-full"
        >
          <Image src={branding.institutionLogo} alt="Logo" fill className="object-contain" />
        </motion.div>
      </div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10 shadow-2xl">
        <h2 className="text-3xl font-bold text-white-pure text-center mb-2">{branding.appName}</h2>
        <p className="text-yellow-gold/60 text-center mb-8 text-sm">Sign in to manage your curriculum</p>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-yellow-gold uppercase ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-gold/50 group-focus-within:text-yellow-gold transition-colors" />
              <input
                type="email"
                disabled={isSubmitting}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white outline-none focus:border-yellow-gold/50 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-yellow-gold uppercase ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-gold/50 group-focus-within:text-yellow-gold transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                disabled={isSubmitting}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white outline-none focus:border-yellow-gold/50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-yellow-gold transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <CommonButton
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 mt-4 bg-yellow-gold hover:bg-yellow-500 text-green-darkest font-black rounded-xl shadow-xl shadow-yellow-gold/10"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} /> Authenticating...
              </span>
            ) : "ACCESS DASHBOARD"}
          </CommonButton>
        </form>
      </div>
    </div>
  );
}
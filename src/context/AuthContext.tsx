

// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import { login, logout, me, User as ApiUser } from "@/lib/api";
// import { useRouter } from "next/navigation";

// interface AuthContextType {
//   user: ApiUser | null;
//   loading: boolean;
//   loginUser: (email: string, password: string) => Promise<void>;
//   logoutUser: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<ApiUser | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   // ✅ Check current session on mount
//   useEffect(() => {
//     async function fetchMe() {
//       try {
//         const res = await me(); // calls /auth/me with cookie
//         setUser(res.data);
//       } catch {
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchMe();
//   }, []);

//   // Login function
//   async function loginUser(email: string, password: string) {
//     setLoading(true);
//     try {
//       // Login endpoint sets HttpOnly cookie
//       await login(email, password);

//       // Fetch current user immediately
//       const res = await me();
//       setUser(res.data);

//       // Redirect based on role
//       const role = res.data.role?.toLowerCase();
//       if (role === "admin") router.replace("/admin/invite");
//       else if (role === "lecturer") router.replace("/lecturer/upload");
//       else if (role === "coordinator") router.replace("/coordinator");
//       else router.replace("/");
//     } catch (err) {
//       setUser(null);
//       throw err; // will be caught in UI
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Logout function
//   async function logoutUser() {
//     setLoading(true);
//     try {
//       await logout(); // clears cookie server-side
//       setUser(null);
//       router.replace("/login");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
//   return ctx;
// }

// clientside/src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { me, login, logout, User as ApiUser } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: ApiUser | null;
  loading: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function initAuth() {

      if (window.location.pathname === "/login") {
      setLoading(false);
      return;
    }
    
      try {
        const res = await me();
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  async function loginUser(email: string, password: string) {
    try {
      await login(email, password);
      const res = await me();
      setUser(res.data);

      // Middleware handles the "guards", but we still redirect
      // the user into the app upon successful login.
      const role = res.data.role?.toLowerCase();
      if (role === "admin") router.push("/admin/invite");
      else if (role === "lecturer") router.push("/lecturer/upload");
      else if (role === "coordinator") router.push("/coordinator/students");
      else router.push("/");
    } catch (err: unknown) {
      setUser(null);
      // Re-throw the error so the component can read the status code/message
      throw err;
    }
  }

  async function logoutUser() {
    try {
      await logout();
      setUser(null);
      router.refresh(); // Refresh to trigger middleware redirect to /login
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
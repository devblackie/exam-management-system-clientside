import type { Metadata } from "next";
import "./globals.css";

import { branding } from "../config/branding";
import { AuthProvider } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: branding.devName,
  description: branding.tagLine,
  icons: {
    icon: "/Logo.png",
  },

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
    <body className="min-h-screen bg-yellow-gold dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <AuthProvider>
          <div className="flex ">
            {/* Sidebar on the left */}
            <Sidebar />

            <div className="flex flex-1 flex-col">
              {/* Navbar on top */}
              <Navbar />

              {/* Page content */}
              {/* <main className="p-6">{children}</main> */}
               <ToastProvider>{children}</ToastProvider>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

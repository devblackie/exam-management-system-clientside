// // clientside/src/app/layout.tsx
// import type { Metadata } from "next";

// import "./global.css";

// import { QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// import { queryClient } from "@/lib/queryClient";
// import { branding } from "../config/branding";
// import { AuthProvider } from "@/context/AuthContext";
// import Sidebar from "@/components/layout/Sidebar";
// import Navbar from "@/components/layout/Navbar";
// import { ToastProvider } from "@/context/ToastContext";

// export const metadata: Metadata = {
//   title: branding.devName,
//   description: branding.tagLine,
//   icons: {
//     icon: "/Logo.png",
//   },

// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//     <body className="min-h-screen bg-[#F8F9FA] text-gray-900 transition-colors duration-300">
//     <QueryClientProvider client={queryClient}>
//         <AuthProvider>
//           <div className="flex ">
//             {/* Sidebar on the left */}
//             <Sidebar />

//             <div className="flex flex-1 flex-col">
//               {/* Navbar on top */}
//               <Navbar />

//               {/* Page content */}
//               {/* <main className="p-6">{children}</main> */}
//                <ToastProvider>{children}</ToastProvider>
//             </div>
//           </div>
//         </AuthProvider>
//         {process.env.NODE_ENV === "development" && (
//             <ReactQueryDevtools initialIsOpen={false} />
//           )}
//         </QueryClientProvider>
//       </body>
//     </html>
//   );
// }


// clientside/src/app/layout.tsx — server component (no "use client")
import type { Metadata } from "next";
import "./global.css";
import { branding } from "@/config/branding";
import Providers from "./providers";          // NEW — see below

export const metadata: Metadata = {
  title:       branding.devName,
  description: branding.tagLine,
  icons: { icon: "/Logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#F8F9FA] text-gray-900 transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
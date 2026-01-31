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
// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className="min-h-screen bg-yellow-gold dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased">
//         <AuthProvider>
//           <ToastProvider>
//             <div className="flex">
//               {/* FIXED WIDTH SIDEBAR SPACE */}
//               <Sidebar />

//               <div className="flex flex-1 flex-col min-w-0">
//                 <Navbar />
//                 <main className="flex-1 p-4 md:p-8 mt-16 md:ml-64 transition-all duration-300">
//                   {children}
//                 </main>
//               </div>
//             </div>
//           </ToastProvider>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }
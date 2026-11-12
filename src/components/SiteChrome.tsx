"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function isAparaturDashboard(pathname: string) {
  return pathname.startsWith("/admin/dashboard") || pathname.startsWith("/wali-nagari");
}

export default function SiteChrome() {
  const pathname = usePathname();

  return isAparaturDashboard(pathname) ? null : <Navbar />;
}

export function SiteFooter() {
  const pathname = usePathname();

  return isAparaturDashboard(pathname) ? null : <Footer />;
}

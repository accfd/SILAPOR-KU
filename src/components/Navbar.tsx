"use client";

import Link from "next/link";
import { useState } from "react";
import { ShieldAlert, FileText, Search, UserCheck, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:bg-emerald-700 transition">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                SILAPOR<span className="text-emerald-600">-KU</span>
              </span>
              <span className="text-xs text-slate-500 font-medium block">
                Nagari Kambang Utara
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition"
            >
              Beranda
            </Link>
            <Link
              href="/lapor"
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              Buat Laporan
            </Link>
            <Link
              href="/cek-tiket"
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition flex items-center gap-1.5"
            >
              <Search className="w-4 h-4 text-emerald-600" />
              Lacak Tiket
            </Link>
            <div className="h-5 w-px bg-slate-200 mx-2" />
            <Link
              href="/admin/login"
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              Portal Staf
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
          >
            Beranda
          </Link>
          <Link
            href="/lapor"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
          >
            Buat Laporan
          </Link>
          <Link
            href="/cek-tiket"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
          >
            Lacak Tiket
          </Link>
          <div className="pt-2">
            <Link
              href="/admin/login"
              onClick={() => setIsOpen(false)}
              className="w-full text-center block px-4 py-2.5 text-base font-medium text-white bg-slate-900 rounded-lg"
            >
              Portal Staf
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

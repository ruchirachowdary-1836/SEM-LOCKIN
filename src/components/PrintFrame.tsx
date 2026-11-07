"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "./ui";

export function PrintFrame({ title, back, children }: { title: string; back: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-soft px-4 py-8 print:bg-white print:p-0">
      <div className="no-print mx-auto mb-6 flex max-w-4xl items-center justify-between">
        <Link href={back} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <Button variant="primary" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </Button>
      </div>
      <article className="print-area mx-auto max-w-4xl rounded-2xl bg-white p-8 text-[#30342f] shadow-sm sm:p-12">
        <header className="mb-8 border-b border-[#e7e5dc] pb-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#898d83]">Semester Lock-In · RC</p>
          <h1 className="mt-2 font-serif text-3xl">{title}</h1>
        </header>
        {children}
      </article>
    </div>
  );
}

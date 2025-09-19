"use client";
import useCartSidebar from "@/hooks/use-cart-sidebar";
import React from "react";
import { Toaster } from "sonner";
import CartSidebar from "./cart-sidebar";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const isCartSidebarOpen = useCartSidebar();

  return (
    <>
      {isCartSidebarOpen ? (
        <div className="flex min-h-screen">
          <div className="flex-1 overflow-hidden">{children}</div>
          <CartSidebar />
        </div>
      ) : (
        <div>{children}</div>
      )}

      {/* ✅ Sonner Toaster */}
      <Toaster richColors position="top-right" />
    </>
  );
}

"use client";

import useCartSidebar from "@/hooks/use-cart-sidebar";
import { ClientSetting } from "@/types";
import React from "react";
import { Toaster } from "sonner";
import AppInitializer from "./app-initializer";
import CartSidebar from "./cart-sidebar";
import { ThemeProvider } from "./theme-provider";

export default function ClientProviders({
  children,
  setting,
}: {
  children: React.ReactNode;
  setting: ClientSetting;
}) {
  const visible = useCartSidebar();

  return (
    <AppInitializer setting={setting}>
      <ThemeProvider
        attribute="class"
        defaultTheme={
          setting?.common?.defaultTheme
            ? setting.common.defaultTheme.toLowerCase()
            : "light"
        }
      >
        {visible ? (
          <div className="flex min-h-screen">
            <div className="flex-1 overflow-hidden">{children}</div>
            <CartSidebar />
          </div>
        ) : (
          <div>{children}</div>
        )}
        <Toaster />
      </ThemeProvider>
    </AppInitializer>
  );
}

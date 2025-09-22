"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";
import { ColorProvider } from "./color-provider";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ColorProvider>{children}</ColorProvider>
    </NextThemesProvider>
  );
}

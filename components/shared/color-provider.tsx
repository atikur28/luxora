"use client";

import useColorStore from "@/hooks/use-color-store";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import * as React from "react";
export function ColorProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const { theme } = useTheme();
  const { color, updateCssVariables } = useColorStore(theme);
  React.useEffect(() => {
    updateCssVariables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, color]);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

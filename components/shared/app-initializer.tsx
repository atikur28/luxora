import useSettingStore from "@/hooks/use-setting-store";
import { ClientSetting } from "@/types";
import React, { useEffect, useState } from "react";

export default function AppInitializer({
  setting,
  children,
}: {
  setting: ClientSetting;
  children: React.ReactNode;
}) {
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    // Update Zustand store after render
    useSettingStore.setState({ setting });
    setRendered(true);
  }, [setting]);

  // Render nothing until store is updated
  if (!rendered) return null;

  return <>{children}</>;
}

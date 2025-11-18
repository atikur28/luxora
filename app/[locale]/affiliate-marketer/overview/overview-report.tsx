"use client";

import { useTranslations } from "next-intl";

export default function OverviewReport() {
  const t = useTranslations("Affiliater");

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="h1-bold">{t("Dashboard")}</h1>
      </div>
    </div>
  );
}

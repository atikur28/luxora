"use client";
import { usePathname } from "next/navigation";
import React from "react";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Link from "next/link";

const links = [
  {
    title: "Overview",
    href: "/affiliate-marketer/overview",
  },
];
export function AffiliateNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const t = useTranslations("Affiliater");
  return (
    <nav
      className={cn(
        "flex items-center flex-wrap overflow-hidden gap-2 md:gap-4",
        className
      )}
      {...props}
    >
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "",
            pathname.includes(item.href) ? "" : "text-muted-foreground"
          )}
        >
          {t(item.title)}
        </Link>
      ))}
    </nav>
  );
}

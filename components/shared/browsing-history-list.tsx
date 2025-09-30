"use client";
import useBrowsingHistory from "@/hooks/use-browsing-history";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import React, { useEffect } from "react";
import { Separator } from "../ui/separator";
import ProductSlider from "./product/product-slider";

export default function BrowsingHistoryList({
  className,
}: {
  className?: string;
}) {
  const { products } = useBrowsingHistory();
  const t = useTranslations("Home");

  return (
    products.length !== 0 && (
      <div className="bg-background">
        <Separator className={cn("mb-4", className)} />
        <ProductList
          title={t("Related to items that you've viewed")}
          type="related"
        />
        <Separator className="mb-4" />
        <ProductList
          title={t("Your browsing history")}
          hideDetails
          type="history"
        />
      </div>
    )
  );
}

function ProductList({
  title,
  type = "history",
  hideDetails = false,
  excludeId = "",
}: {
  title: string;
  type: "history" | "related";
  hideDetails?: boolean;
  excludeId?: string;
}) {
  const { products } = useBrowsingHistory();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = React.useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch(
        `/api/products/browsing-history?type=${type}&excludeId=${excludeId}&categories=${products
          .map((product) => product.category)
          .join(",")}&ids=${products.map((product) => product.id).join(",")}`
      );
      const data = await res.json();
      setData(data);
    };
    fetchProducts();
  }, [excludeId, products, type]);

  return (
    data.length > 0 && (
      <ProductSlider title={title} products={data} hideDetails={hideDetails} />
    )
  );
}

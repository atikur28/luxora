
"use client";

import TrackAffiliateClick from "@/components/shared/product/track-affiliate-click";

interface ProductPageClientProps {
  productId: string;
}

export default function ProductPageClient({ productId }: ProductPageClientProps) {
  return <TrackAffiliateClick productId={productId} />;
}

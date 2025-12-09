"use client";

import { useState } from "react";
import axios from "axios";
import { useSession, signIn } from "next-auth/react";
import AffiliateLinkModal from "../AffiliateLinkModal"; // make sure you have this modal
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { IProduct } from "@/lib/db/models/product.model";
import { formatNumber, generateId, round2 } from "@/lib/utils";
import AddToCart from "./add-to-cart";
import ImageHover from "./image-hover";
import ProductPrice from "./product-price";
import Rating from "./rating";

const ProductCard = ({
  product,
  hideBorder = false,
  hideDetails = false,
  hideAddToCart = false,
  showAffiliateButton = false,
}: {
  product: IProduct;
  hideDetails?: boolean;
  hideBorder?: boolean;
  hideAddToCart?: boolean;
  showAffiliateButton?: boolean; // new: explicitly control affiliate button visibility
}) => {
  const [open, setOpen] = useState(false);
  const [affiliateLink, setAffiliateLink] = useState("");
  const { data: session } = useSession();

  const isAffiliate = Boolean(
    session?.user?.affiliateRequest === true ||
      (session?.user?.role &&
        ["affiliate", "affiliater"].includes(session.user.role.toLowerCase()))
  );

  const generateLink = async () => {
    try {
      if (!session?.user?.id) {
        // Prompt sign-in when there's no authenticated user
        signIn();
        return;
      }

      const res = await axios.post("/api/affiliate-request/affiliate/generate-link", {
        productId: product._id,
        userId: session.user.id,
      });
      setAffiliateLink(res.data.link);
      setOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const ProductImage = () => (
    <Link href={`/product/${product.slug}`}>
      <div className="relative h-52">
        {product.images.length > 1 ? (
          <ImageHover src={product.images[0]} hoverSrc={product.images[1]} alt={product.name} />
        ) : (
          <Image src={product.images[0]} alt={product.name} fill sizes="80vw" className="object-contain" />
        )}
      </div>
    </Link>
  );

  const ProductDetails = () => (
    <div className="flex-1 space-y-2">
      <p className="font-bold">{product.brand}</p>
      <Link
        href={`/product/${product.slug}`}
        className="overflow-hidden text-ellipsis"
        style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
      >
        {product.name}
      </Link>
      <div className="flex gap-2 justify-center">
        <Rating rating={product.avgRating} />
        <span>({formatNumber(product.numReviews)})</span>
      </div>
      <ProductPrice
        isDeal={product.tags.includes("todays-deal")}
        price={product.price}
        listPrice={product.listPrice}
        forListing
      />
    </div>
  );

  const AddButton = () => (
    <div className="w-full text-center space-y-2">
      <AddToCart
        minimal
        item={{
          clientId: generateId(),
          product: product._id,
          size: product.sizes[0],
          color: product.colors[0],
          countInStock: product.countInStock,
          name: product.name,
          slug: product.slug,
          category: product.category,
          price: round2(product.price),
          quantity: 1,
          image: product.images[0],
        }}
      />

      {isAffiliate && showAffiliateButton && (
        <button onClick={generateLink} className="border-2 border-yellow-400 text-white bg-red-600 hover:bg-red-700 w-full py-1 rounded font-semibold">
          Generate Affiliate Link
        </button>
      )}
    </div>
  );

  return hideBorder ? (
    <div className="flex flex-col">
      <ProductImage />
      {!hideDetails && (
        <>
          <div className="p-3 flex-1 text-center">
            <ProductDetails />
          </div>
          {!hideAddToCart && <AddButton />}
        </>
      )}
      {open && <AffiliateLinkModal link={affiliateLink} onClose={() => setOpen(false)} />}
    </div>
  ) : (
    <Card className="flex flex-col">
      <CardHeader className="p-3">
        <ProductImage />
      </CardHeader>
      {!hideDetails && (
        <>
          <CardContent className="p-3 flex-1 text-center">
            <ProductDetails />
          </CardContent>
          <CardFooter className="p-3">{!hideAddToCart && <AddButton />}</CardFooter>
        </>
      )}
      {open && <AffiliateLinkModal link={affiliateLink} onClose={() => setOpen(false)} />}
    </Card>
  );
};

export default ProductCard;

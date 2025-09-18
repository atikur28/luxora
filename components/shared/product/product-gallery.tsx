"use client";

import Image from "next/image";
import { useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

export default function ProductGallery({ images }: { images: string[] }) {
  const [selectedImage, setSelectedImage] = useState(0);

  // Ensure we always have a safe image
  const currentImage = images[selectedImage] || null;

  return (
    <div className="flex gap-2">
      <div className="flex flex-col gap-2 mt-8">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            onMouseOver={() => setSelectedImage(index)}
            className={`bg-white rounded-lg overflow-hidden ${
              selectedImage === index
                ? "ring-2 ring-blue-500"
                : "ring-1 ring-gray-300"
            }`}
          >
            {image && (
              <Image src={image} alt="product image" width={48} height={48} />
            )}
          </button>
        ))}
      </div>

      <div className="w-full">
        <Zoom>
          <div className="relative h-[500px]">
            {currentImage ? (
              <Image
                src={currentImage}
                alt="product image"
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No Image Available
              </div>
            )}
          </div>
        </Zoom>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiUpload } from "react-icons/fi";
import Button from "./Button";

interface ImageUploadBlockProps {
  images: (string | null)[]; // Array of image URLs or null for placeholders
  // handleUpload now receives the selected File and the index
  handleUpload: (file: File, index: number) => Promise<void>;
}

const ImageUploadBlock: React.FC<ImageUploadBlockProps> = ({
  images,
  handleUpload,
}) => {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const handleClick = async (index: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        setLoadingIndex(index);
        try {
          await handleUpload(file, index);
        } finally {
          setLoadingIndex(null);
        }
      }
      // Clean up the temporary input element
      input.remove();
    };

    // Append to DOM to avoid some browsers blocking synthetic clicks
    document.body.appendChild(input);
    input.click();
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {images.map((image, index) => (
        <div
          key={index}
          className="relative w-full h-40 bg-gray-200 rounded overflow-hidden group"
        >
          {image ? (
            <Image
              src={image}
              alt={`Uploaded image ${index + 1}`}
              layout="fill"
              objectFit="cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300" />
          )}

          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleClick(index)}
              loading={loadingIndex === index}
              leftIcon={<FiUpload />}
            >
              Upload
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageUploadBlock;

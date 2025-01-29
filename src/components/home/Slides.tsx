'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import image1 from './assets/1.jpg';
import image2 from './assets/2.jpg';
import image3 from './assets/3.jpg';
import image4 from './assets/4.jpg';
import image5 from './assets/5.jpg';

const images = [image1, image2, image3, image4, image5];

export default function Slides() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto switch images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Carousel container */}
      <div className="overflow-hidden rounded-lg relative">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map(img => (
            <div key={img.src} className="w-full shrink-0">
              <Image src={img} alt="slide" className="w-full h-auto" />
            </div>
          ))}
        </div>

        {/* Clickable progress indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 px-4 py-1 rounded-full">
          {images.map((img, index) => (
            <button
              type="button"
              key={img.src}
              title={`Go to slide ${index + 1}`}
              className={`h-2 w-2 rounded-full transition ${
                index === currentIndex ? 'bg-white scale-125' : 'bg-gray-400'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Image credit */}
      <p className="mt-2 text-xs text-gray-500 text-center">photo credit: matthew zhang</p>
    </>
  );
}

'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

import { useEffect, useState } from 'react';
import image1 from './assets/1.jpg';
import image2 from './assets/2.jpg';
import image3 from './assets/3.jpg';
import image4 from './assets/4.jpg';
import image5 from './assets/5.jpg';

const images = [image1, image2, image3, image4, image5];

interface SlidesProps {
  className?: string;
}

const Slides = ({ className }: SlidesProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const stopAutoSlide = () => {
    if (timer) {
      clearInterval(timer);
    }
  };

  const startAutoSlide = () => {
    stopAutoSlide();
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    }, 3000);
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setTimer(interval);
  };

  const handleNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    startAutoSlide();
  };

  const handlePrev = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + images.length) % images.length);
    startAutoSlide();
  };

  // Auto switch images every 3 seconds
  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Carousel container */}
      <div className="overflow-hidden rounded-lg relative">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((img, index) => (
            <div key={img.src} className="w-full shrink-0">
              <Image src={img} alt={`Slide - ${index}`} className="w-full h-auto" />
            </div>
          ))}
        </div>

        {/* Left button */}
        <button
          onClick={handlePrev}
          type="button"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition focus:outline-none"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Right button */}
        <button
          onClick={handleNext}
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition focus:outline-none"
        >
          <ChevronRight size={20} />
        </button>

        {/* Clickable progress indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 px-4 py-1 rounded-full group">
          {images.map((img, index) => (
            <button
              key={img.src}
              type="button"
              title={`Go to slide ${index + 1}`}
              className={`h-2 w-2 rounded-full transition-all duration-200 cursor-pointer
                ${index === currentIndex ? 'bg-white scale-125' : 'bg-gray-400'}
                group-hover:scale-90 group-hover:bg-gray-500
                hover:scale-150 hover:bg-white`}
              onClick={() => {
                setCurrentIndex(index);
                startAutoSlide();
              }}
            />
          ))}
        </div>
      </div>

      {/* Image credit */}
      <p className="mt-2 text-xs text-gray-500 text-center">photo credit: matthew zhang</p>
    </div>
  );
};

export default Slides;

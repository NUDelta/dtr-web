'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

function Custom404() {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Set up a countdown timer
    const timer = setInterval(() => {
      setCountdown(previous => previous - 1);
    }, 1000);

    // Redirect after 10 seconds
    const redirectTimer = setTimeout(() => {
      globalThis.location.href = '/';
    }, 10_000);

    // Clean up both timers on component unmount
    return () => {
      clearTimeout(redirectTimer);
      clearInterval(timer);
    };
  }, []);

  return (
    <main className="mx-8 mt-[30vh] flex flex-col items-center justify-center text-center">
      <h1 className="mb-4 text-3xl font-bold text-red-400]">
        404 - Page Not Found
      </h1>
      <p className="mb-6 text-base leading-7">
        Sorry, the page you are looking for does not exist.
        <br />
        You will be redirected to the home page in
        {' '}
        <span className="text-[var(--skyblue)] font-bold">{countdown}</span>
        {' '}
        seconds.
      </p>
      <Link
        href="/"
        className="rounded bg-[var(--color-dark-yellow)] px-4 py-2 text-black no-underline transition-all duration-500 hover:scale-110 hover:bg-[var(--color-dark-yellow)] hover:text-black"
      >
        Back to Home
      </Link>
    </main>
  );
}

export default Custom404;

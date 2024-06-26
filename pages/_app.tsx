import type { AppProps } from "next/app";
import Head from "next/head";
import NextNProgress from "nextjs-progressbar";

import "../styles/globals.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import { Lato } from "next/font/google";
const lato = Lato({
  weight: ["100", "300", "400", "700", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Design, Technology, and Research</title>
        <meta
          name="google-site-verification"
          content="14ltX0knmJHA_JnO3Z428TX8YioIFSWFy1yABn_Qh10"
        />
        <link rel="icon" href="/favicon.ico?v=2" />
      </Head>

      <NextNProgress
        color="#F5ED9C"
        height={6}
        options={{ showSpinner: false }}
      />

      <main className="${lato.className} bg-white pb-8">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default MyApp;

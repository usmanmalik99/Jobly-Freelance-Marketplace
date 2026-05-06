import React from "react";
import HeadTag from "../components/HeadTag";
import AppNavbar from "../components/Navbar/AppNavbar";
import Image from "next/image";
import Category from "../components/Category";
import ClintCat from "../components/ClintCat";
import Skills from "../components/Skills";
import Footer from "../components/Footer";
import JobSuccessCard from "../components/JobSuccessCard";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

import { FaStar, FaUber, FaAtlassian } from "react-icons/fa";
import { IoLogoUsd } from "react-icons/io";
import { ImCheckmark, ImGoogle } from "react-icons/im";
import { BsFillTrophyFill, BsWordpress } from "react-icons/bs";
import { SiAdobe, SiUdacity } from "react-icons/si";


const TrustedByTicker = () => {
  const items = [
    { src: "/images/paypal.png", alt: "PayPal", w: 90, h: 30 },
    { src: "/images/adobe.png", alt: "Adobe", w: 90, h: 30 },
    { src: "/images/oracle.png", alt: "Oracle", w: 90, h: 30 },
    { src: "/images/google.png", alt: "Google", w: 90, h: 30 },
    { src: "/images/microsoft.png", alt: "Microsoft", w: 110, h: 30 },
    { src: "/images/airnob.png", alt: "Airbnb", w: 90, h: 30 },
    { src: "/images/netflix.png", alt: "Netflix", w: 90, h: 30 },
    { src: "/images/bitcoin.png", alt: "Bitcoin", w: 90, h: 30 },
    { src: "/images/ethereum.png", alt: "Ethereum", w: 90, h: 30 },
    { src: "/images/usdt.png", alt: "USDT", w: 90, h: 30 },
    { src: "/images/litecoin.png", alt: "Litecoin", w: 90, h: 30 },
  ];

  const loopItems = [...items, ...items];

  return (
    <div className="flex items-center gap-3">
      <h3 className="text-zinc-500 font-semibold lg:text-2xl text-xl whitespace-nowrap">
        Trusted by
      </h3>

      <div className="relative flex-1 overflow-hidden">
        {/* fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="ticker-track flex items-center gap-8 pr-8">
          {loopItems.map((it, idx) => (
            <div
              key={`${it.alt}-${idx}`}
              className="flex items-center justify-center"
              style={{ width: it.w, height: it.h }}
              aria-label={it.alt}
            >
              
              <div className="relative" style={{ width: it.w, height: it.h }}>
                <Image
                  src={it.src}
                  alt={it.alt}
                  fill
                  draggable={false}
                  sizes={`${it.w}px`}
                  className="
                    object-contain
                    opacity-90 hover:opacity-100 transition
                    bg-transparent
                    mix-blend-multiply
                  "
                />
              </div>
            </div>
          ))}
        </div>

        <style jsx>{`
          .ticker-track {
            width: max-content;
            animation: ticker 22s linear infinite;
            will-change: transform;
          }
          .ticker-track:hover {
            animation-play-state: paused;
          }
          @keyframes ticker {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .ticker-track {
              animation: none;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <HeadTag title="Jobly - The World's Work Marketplace" />

      {/* ================= Header ================= */}
      <header className="header-bg">
        <AppNavbar />

        <div className="container mx-auto py-3 md:px-5 sm:px-7 px-3">
          <section className="mt-7 flex items-center justify-between">
            {/* Left copy */}
            <div className="flex flex-col space-y-5">
              <motion.h1
                className="xl:text-7xl lg:text-6xl text-4xl font-bold text-[#0C4A6E]"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.9 }}
              >
                How Work <br /> Should Work
              </motion.h1>

              <motion.p
                className="text-zinc-500 xl:text-3xl lg:text-xl text-lg font-semibold"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.5 }}
              >
                Forget the old rules. You can have the best people.
                <br className="lg:block md:hidden block" />
                Right now. Right here.
              </motion.p>
            </div>

            {/* Right visuals */}
            <div className="relative">
              <Link href="/jobs/todays-jobs" legacyBehavior>
                <a className="absolute lg:flex hidden flex-col items-center z-[9] bg-[#F3FFFC] shadow-2xl py-2 px-3 rounded-xl cursor-pointer left-[-3rem] top-0 transition hover:scale-105">
                  <span className="text-[11px] font-semibold text-zinc-700 mb-1">
                    Today's Job
                  </span>
                  <Image
                    src="/images/bag.png"
                    height={30}
                    width={40}
                    alt="bag-image"
                  />
                </a>
              </Link>

              <div className="mr-10 mt-5 md:block hidden">
                <Image
                  src="/images/headerimg.png"
                  height={350}
                  width={450}
                  alt="header-img"
                  priority
                />
              </div>

              <JobSuccessCard />
            </div>
          </section>
        </div>
      </header>

      {/* ================= Main ==================== */}
      <main>
        {/* Trusted Company Ticker */}
        <section className="container mx-auto mt-3 py-3 md:px-5 sm:px-7 px-3">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <TrustedByTicker />
          </motion.div>
        </section>

        {/* Talent Category */}
        <section className="container mx-auto mt-3 md:mt-7 py-3 md:px-5 sm:px-7 px-3">
          <h2 className="text-[#0C4A6E] lg:text-4xl text-3xl font-bold mb-3">
            Browse talent by category
          </h2>

          <span className="text-zinc-600 font-semibold lg:text-lg text-md">
            Looking for work?
            <Link href="/jobs/all-jobs" legacyBehavior>
              <a className="ml-2 text-cyan-700 cursor-pointer hover:underline">
                Browse Job
              </a>
            </Link>
          </span>

          <div className="grid xl:grid-cols-4 md:grid-cols-2 grid-cols-1 2xl:gap-x-20 gap-x-10 xl:gap-y-7 sm:gap-y-4 gap-y-3 lg:mt-10 mt-7 md:px-0 sm:px-7">
            <Category />
          </div>
        </section>

        {/* Find Talent */}
        <section className="container mx-auto lg:mt-5 mt-3 py-3 md:px-5 sm:px-7 px-0 space-y-3">
          <div className="bg-[url('/images/girlswork.png')] bg-top w-full sm:rounded-xl rounded-none xl:px-14 px-5 py-8">
            <motion.h2
              className="text-white font-semibold lg:text-3xl text-xl"
              initial={{ y: "100%", opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              For Clients
            </motion.h2>

            <motion.h3
              className="text-white 2xl:font-bold font-semibold lg:text-6xl text-4xl lg:mt-28 mt-20 leading-tight my-3"
              initial={{ y: "100%", opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              Find Talent <br />
              Your Way
            </motion.h3>

            <motion.p
              className="text-gray-300 font-semibold lg:text-xl text-md"
              initial={{ y: "100%", opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              Work with the largest network of independent <br />
              professionals and get things done—from quick <br />
              turnarounds to big transformations.
            </motion.p>

            <motion.div
              className="grid md:grid-cols-3 grid-cols-1 2xl:gap-x-10 md:gap-y-0 gap-y-3 xl:gap-x-7 gap-x-5 mt-10"
              initial={{ y: "100", opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <ClintCat />
            </motion.div>
          </div>
        </section>

        {/* Business section */}
        <section className="container mx-auto lg:mt-5 mt-1 py-3 md:px-5 sm:px-7">
          <div className="grid lg:grid-cols-3 grid-cols-1">
            <div className="md:bg-[#E4FDF7] bg-none col-span-2 lg:rounded-l-xl lg:rounded-tr-none rounded-t-xl sm:px-7 px-5 pt-10 pb-14 relative">
              <motion.h2
                className="text-zinc-700 font-semibold 2xl:text-6xl lg:text-5xl text-4xl"
                initial={{ y: "100", opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                Why businesses <br />
                turn to Jobly
              </motion.h2>

              <motion.div
                className="flex md:ml-3 ml-0 space-x-5 items-start mt-7"
                initial={{ y: "100", opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                <span className="flex rounded-full py-1 px-1 bg-zinc-700 text-white xl:text-xl text-md mt-1">
                  <FaStar />
                </span>
                <div className="flex flex-col space-y-2">
                  <h3 className="text-zinc-700 font-semibold xl:text-3xl text-2xl">
                    Proof of quality
                  </h3>
                  <span className="text-zinc-500 font-semibold xl:text-md">
                    Check any pro’s work samples, client reviews, <br className="md:block hidden" />
                    and identity verification.
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="flex md:ml-3 ml-0 space-x-5 items-start mt-7"
                initial={{ y: "100", opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                <span className="flex rounded-full py-1 px-1 bg-zinc-700 text-white xl:text-xl text-md mt-1">
                  <IoLogoUsd />
                </span>
                <div className="flex flex-col space-y-2">
                  <h3 className="text-zinc-700 font-semibold xl:text-3xl text-2xl">
                    No cost until you hire
                  </h3>
                  <span className="text-zinc-500 font-semibold text-md">
                    Interview potential fits for your job, negotiate <br className="md:block hidden" />
                    rates, and only pay for work you approve.
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="flex md:ml-3 ml-0 space-x-5 items-start mt-7"
                initial={{ y: "100", opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                <span className="flex rounded-full py-1 px-1 bg-zinc-700 text-white xl:text-xl text-md mt-1">
                  <ImCheckmark />
                </span>
                <div className="flex flex-col space-y-2">
                  <h3 className="text-zinc-700 font-semibold xl:text-3xl text-2xl">
                    Safe and secure
                  </h3>
                  <span className="text-zinc-500 font-semibold text-md">
                    Focus on your work knowing we help protect <br className="md:block hidden" />
                    your data and privacy. We’re here with 24/7 <br className="md:block hidden" />
                    support if you need it.
                  </span>
                </div>
              </motion.div>

              <div className="absolute lg:right-[-1rem] right-0 bottom-3 md:block hidden">
                <Image src="/images/man-preg.png" width={250} height={400} alt="man-image" />
              </div>
            </div>

            <div className="bg-gradient-to-b from-[#99F6E4] to-[#A5F3FC] lg:rounded-r-xl lg:rounded-bl-none md:rounded-b-xl md:rounded-none sm:rounded-xl rounded-none px-7 py-10">
              <motion.h2
                className="text-zinc-700 font-semibold 2xl:text-5xl xl:text-4xl text-3xl"
                initial={{ y: "100", opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                we’re <br />
                the world’s work <br />
                marketplace
              </motion.h2>

              <motion.div
                className="flex items-start space-x-7 mt-10"
                initial={{ y: "100", opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                <span className="2xl:text-4xl xl:text-3xl text-2xl text-zinc-700 mt-1">
                  <FaStar />
                </span>

                <div className="flex flex-col md:space-y-3 space-y-2">
                  <h3 className="font-semibold 2xl:text-4xl xl:text-3xl text-2xl text-zinc-700">
                    4.9/5
                  </h3>
                  <span className="2xl:text-xl lg:text-md text-zinc-500">
                    Clients rate professionals on Jobly
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start space-x-7 xl:mt-10 md:mt-7 mt-5"
                initial={{ y: "100", opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                <span className="2xl:text-4xl xl:text-3xl text-2xl text-zinc-700 mt-1">
                  <BsFillTrophyFill />
                </span>

                <div className="flex flex-col md:space-y-3 space-y-2">
                  <h3 className="font-semibold 2xl:text-4xl xl:text-3xl text-2xl text-zinc-700">
                    Award winner
                  </h3>
                  <span className="2xl:text-xl lg:text-md text-zinc-500">
                    G2’s 2021 Best Software Awards
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="container mx-auto lg:my-7 my-3 py-3 md:px-5 sm:px-7 px-3 space-y-3">
          <Skills />
        </section>
      </main>

      <Footer />
    </div>
  );
}

import Image from "next/image";

export default function TrustedCom() {
  const items = [
    { src: "/images/paypal.png", alt: "PayPal", w: 90, h: 30 },
    { src: "/images/adobe.png", alt: "Adobe", w: 90, h: 30 },
    { src: "/images/oracle.png", alt: "Oracle", w: 90, h: 30 },
    { src: "/images/google.png", alt: "Google", w: 90, h: 30 },
    { src: "/images/microsoft.png", alt: "Microsoft", w: 110, h: 30 },
    { src: "/images/airnob.png", alt: "Airbnb", w: 90, h: 30 },
    { src: "/images/netflix.png", alt: "Netflix", w: 90, h: 30 },
    { src: "/images/Bitcoin.png", alt: "Bitcoin", w: 90, h: 30 },
    { src: "/images/etherum.png", alt: "Ethereum", w: 90, h: 30 },
    { src: "/images/USDT.png", alt: "USDT", w: 90, h: 30 },
    { src: "/images/litecoin.png", alt: "Litecoin", w: 90, h: 30 },
  ];

  const loopItems = [...items, ...items];

  return (
    <section className="container mx-auto mt-3 py-3 md:px-5 sm:px-7 px-3">
      <div className="flex items-center gap-3">
        <h3 className="text-zinc-500 font-semibold lg:text-2xl text-xl whitespace-nowrap">
          Trusted by
        </h3>

        <div className="relative flex-1 overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-10" />

          <div className="ticker-track flex items-center gap-8 pr-8">
            {loopItems.map((it, idx) => (
              <div key={`${it.alt}-${idx}`} className="flex items-center">
                <Image
                  src={it.src}
                  width={it.w}
                  height={it.h}
                  alt={it.alt}
                  draggable={false}
                  priority={idx < 6}
                  className="object-contain opacity-90 hover:opacity-100 transition"
                />
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
    </section>
  );
}

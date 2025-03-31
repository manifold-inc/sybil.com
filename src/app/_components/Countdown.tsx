"use client";

import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";

import "@leenguyen/react-flip-clock-countdown/dist/index.css";

import { useEffect, useState } from "react";

export default function Countdown() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="origin-center scale-[0.8] sm:scale-100 md:scale-125 lg:scale-150">
      {isClient ? (
        <div className="animate-fade-in">
          <FlipClockCountdown
            to={new Date(1743537600 * 1000)}
            digitBlockStyle={{
              fontWeight: "bold",
              color: "#C5DBFF",
              backgroundColor: "#2A2C33",
            }}
            labelStyle={{
              textTransform: "uppercase",
              color: "#C5DBFF",
            }}
            separatorStyle={{
              color: "#58E8B4",
            }}
            dividerStyle={{
              color: "#17181F",
              height: "2px",
            }}
          />
        </div>
      ) : (
        <div className="h-28 w-12" />
      )}
    </div>
  );
}

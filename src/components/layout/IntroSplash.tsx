"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const TITLE = "CONTENT HUB";
const ACCENT_FROM = 7; // letters from this position on use the accent color (_HUB)
const SHOW_MS = 2200; // how long the intro stays before sliding away
const STORAGE_KEY = "content-hub-intro-seen";
// set to false to play the intro on every full page load
const ONCE_PER_SESSION = true;

function alreadySeen() {
  if (!ONCE_PER_SESSION) return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false; // storage unavailable: just show it
  }
}

export default function IntroSplash() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(() => !alreadySeen());

  useEffect(() => {
    if (!visible) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage unavailable, nothing to remember */
    }
    const timer = setTimeout(() => setVisible(false), SHOW_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  // people who ask their system for less motion don't get the intro
  if (reduceMotion) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          aria-hidden="true"
          onClick={() => setVisible(false)} // click anywhere to skip
          className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-background"
          exit={{ y: "-100%", transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } }}
        >
          <div className="flex flex-col items-center gap-4 px-4">
            <motion.div
              className="flex text-5xl font-black tracking-tight sm:text-7xl md:text-8xl lg:text-9xl"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            >
              {TITLE.split("").map((char, i) => (
                <span key={i} className="inline-block overflow-hidden pb-3">
                  <motion.span
                    className={`inline-block ${i >= ACCENT_FROM ? "text-primary" : ""}`}
                    variants={{
                      hidden: { y: "110%" },
                      show: { y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                    }}
                  >
                    {char}
                  </motion.span>
                </span>
              ))}
            </motion.div>

            <motion.p
              className="text-xs uppercase tracking-[0.3em] text-muted sm:text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              News · Movies · Posts
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
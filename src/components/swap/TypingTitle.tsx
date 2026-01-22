"use client";

import { useEffect, useState } from "react";

type TypingTitleProps = {
  text: string;
  className?: string;
  speedMs?: number;
};

export default function TypingTitle({ text, className, speedMs = 50 }: TypingTitleProps) {
  const [visibleText, setVisibleText] = useState("");
  const isTyping = visibleText.length < text.length;

  useEffect(() => {
    let index = 0;
    let intervalId: number | null = null;
    const tick = () => {
      index += 1;
      setVisibleText(text.slice(0, index));
      if (index >= text.length) {
        if (intervalId) window.clearInterval(intervalId);
      }
    };
    const timeoutId = window.setTimeout(() => {
      tick();
      intervalId = window.setInterval(tick, speedMs);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [text, speedMs]);

  return (
    <h1 className={`relative inline-block ${className ?? ""}`.trim()}>
      <span className="invisible">{text}</span>
      <span className="absolute inset-0">
        {visibleText}
        {isTyping ? <span className="ml-1 inline-block w-[0.6ch] animate-pulse">|</span> : null}
      </span>
    </h1>
  );
}

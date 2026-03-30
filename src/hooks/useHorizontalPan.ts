import * as React from "react";




export function useHorizontalPan() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const isPanningRef = React.useRef(false);
  const panStartXRef = React.useRef(0);
  const panStartScrollRef = React.useRef(0);

  const velocityRef = React.useRef(0);
  const lastXRef = React.useRef(0);
  const lastTimeRef = React.useRef(0);

  React.useEffect(() => {

    const onMove = (e: MouseEvent) => {

      if (e.buttons === 0) {
        isPanningRef.current = false;
        return;
      }

      if (!isPanningRef.current || !containerRef.current) return;

      const now = performance.now();
      const delta = e.clientX - panStartXRef.current;

      containerRef.current.scrollLeft =
        panStartScrollRef.current - delta;

      const dx = e.clientX - lastXRef.current;
      const dt = now - lastTimeRef.current;

      velocityRef.current = dx / (dt || 1);

      lastXRef.current = e.clientX;
      lastTimeRef.current = now;
    };

    const onUp = () => {
      isPanningRef.current = false;
      if (containerRef.current) {
        containerRef.current.style.cursor = "grab";
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-event]")) return;

    isPanningRef.current = true;
    panStartXRef.current = e.clientX;
    panStartScrollRef.current = containerRef.current!.scrollLeft;

    containerRef.current!.style.cursor = "grabbing";
  };

  const onMouseLeave = () => {
    isPanningRef.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
    }
  };

  return {
    containerRef,
    panHandlers: {
      onMouseDown,
      onMouseLeave
    }
  };
}

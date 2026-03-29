import * as React from "react";

type DragMode = "move" | "left" | "right";

type UseEventDragProps = {
  events: any[];
  setEvents: React.Dispatch<React.SetStateAction<any[]>>;
  slotWidth: number;
  startOfYear: Date;
  listUrl: string;
};

export function useEventDrag({
  events,
  setEvents,
  slotWidth,
  startOfYear,
  listUrl
}: UseEventDragProps) {

  const eventsRef = React.useRef(events);

  React.useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  const dragRef = React.useRef({
    startX: 0,
    startStart: 0,
    startEnd: 0,
    lastStart: 0,
    lastEnd: 0,
    index: -1,
    mode: "move" as DragMode
  });

  const overlaps = (
    aStart: number,
    aEnd: number,
    bStart: number,
    bEnd: number
  ) => aStart <= bEnd && aEnd >= bStart;

  const startDrag = (
    mode: DragMode,
    e: React.MouseEvent,
    index?: number
  ) => {

    e.preventDefault();
    e.stopPropagation();

    if (index === undefined) return;

    const sp = eventsRef.current[index];

    dragRef.current = {
      startX: e.clientX,
      startStart: sp.startIndex,
      startEnd: sp.endIndex,
      lastStart: sp.startIndex,
      lastEnd: sp.endIndex,
      index,
      mode
    };

    const onMove = (ev: MouseEvent) => {

      const deltaPx = ev.clientX - dragRef.current.startX;
      const deltaDays = Math.floor(deltaPx / slotWidth);

      let newStart = dragRef.current.startStart;
      let newEnd = dragRef.current.startEnd;

      if (mode === "move") {
        newStart += deltaDays;
        newEnd += deltaDays;
      }

      if (mode === "right") {
        newEnd = Math.max(newStart, dragRef.current.startEnd + deltaDays);
      }

      if (mode === "left") {
        newStart = Math.min(newEnd, dragRef.current.startStart + deltaDays);
      }

      const current = eventsRef.current[index];

      const hasCollision = eventsRef.current.some((ev, idx) => {

        if (idx === index) return false;

        // CHECK SAME BOOK COPY
        if (ev.copy !== current.copy) return false;

        return overlaps(newStart, newEnd, ev.startIndex, ev.endIndex);

      });

      if (hasCollision) return;

      dragRef.current.lastStart = newStart;
      dragRef.current.lastEnd = newEnd;

      setEvents(prev =>
        prev.map((ev, idx) => {

          if (idx !== index) return ev;

          const startDate = new Date(startOfYear);
          startDate.setDate(startOfYear.getDate() + dragRef.current.lastStart);
          startDate.setHours(12, 0, 0, 0);

          const endDate = new Date(startOfYear);
          endDate.setDate(startOfYear.getDate() + dragRef.current.lastEnd);
          endDate.setHours(12, 0, 0, 0);

          return {
            ...ev,
            startIndex: newStart,
            endIndex: newEnd,
            Startdatum: startDate,
            Slutdatum: endDate
          };

        })
      );

    };

    const stop = () => {

      const item = eventsRef.current[index];

      const startDate = new Date(startOfYear);
      startDate.setDate(startOfYear.getDate() + dragRef.current.lastStart);
      startDate.setHours(12, 0, 0, 0);

      const endDate = new Date(startOfYear);
      endDate.setDate(startOfYear.getDate() + dragRef.current.lastEnd);
      endDate.setHours(12, 0, 0, 0);

      if (item?.id) {

        fetch(`${listUrl}/${item.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            loan_date: startDate.toISOString(),
            due_date: endDate.toISOString()
          })
        })
          .then(res => res.json())
          .then(data => console.log("Loan updated:", data))
          .catch(err => console.error("Update error:", err));

      }

      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", stop);

    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", stop);

  };

  return { startDrag };

}
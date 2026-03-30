import * as React from "react";
import EventBar from "./EventBar";
import styles from "./PersonRow.module.scss";

type Props = {
  person: string;
  days: Date[];
  todayIndex: number;
  slotWidth: number;
  events: any[];
  vartStyleMap: Record<string, { bg: string; text: string }>;
  startOfYear: Date;
  openMenu: (data: any) => void;
  deleteEvent: (item: any) => void;
  startDrag: (
    mode: "move" | "left" | "right",
    e: React.MouseEvent,
    index: number
  ) => void;
  editMode: boolean;
  currentUserName: string;
};

export default function PersonRow(props: Props) {

  return (
    <div
      className={styles.row}
      style={{
        width: props.days.length * props.slotWidth,
        gridTemplateColumns: `repeat(${props.days.length}, ${props.slotWidth}px)`
      }}
    >

      {/* GRID CELLS */}
      {props.days.map((d, i) => (
        <div
          key={i}
          className={`
            ${styles.cell}
            ${d.getDay() === 1 ? styles.monday : ""}
            ${(d.getDay() === 0 || d.getDay() === 6) ? styles.weekend : ""}
          `}
        >
          {i === props.todayIndex && (
            <div className={styles.todayLine} />
          )}
        </div>
      ))}

      {/* EVENTS */}
      {props.events
        .map((e: any, realIndex: number) => ({ e, realIndex }))

        // MATCH BOOK COPY
        .filter(x => x.e.copy === props.person)

        .map(({ e, realIndex }) => {

          const startIndex =
            e.startIndex ??
            Math.floor(
              (new Date(e.Startdatum).getTime() -
                props.startOfYear.getTime()) / 86400000
            );

          const endIndex =
            e.endIndex ??
            Math.floor(
              (new Date(e.Slutdatum).getTime() -
                props.startOfYear.getTime()) / 86400000
            );

          const fullDays = endIndex - startIndex + 1;

          const gradient = `linear-gradient(
          135deg,
          rgba(59, 130, 246, 0.95) 0%,
          rgba(37, 99, 235, 0.92) 45%,
          rgba(147, 197, 253, 0.9) 100%
        )`;

          return (
            <EventBar
              key={realIndex}
              startIndex={startIndex}
              endIndex={endIndex}
              slotWidth={props.slotWidth}
              gradient={gradient}
              textColor="#fff"

              title={e.Title}
              person={e.copy}

              deleteEvent={props.deleteEvent}
              eventItem={e}

              fullDays={fullDays}
              lastDayHours={0}
              percentOfDay={100}
              hoursText={null}

              openMenu={props.openMenu}

              onMove={(ev) => {
                if (!props.editMode) return;
                props.startDrag("move", ev, realIndex);
              }}

              onLeft={(ev) => {
                if (!props.editMode) return;
                props.startDrag("left", ev, realIndex);
              }}

              onRight={(ev) => {
                if (!props.editMode) return;
                props.startDrag("right", ev, realIndex);
              }}
            />
          );

        })}

    </div>
  );
}
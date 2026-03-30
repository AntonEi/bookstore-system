import * as React from "react";
import styles from "./EventBar.module.scss";

type Props = {
  startIndex: number;
  endIndex: number;
  slotWidth: number;
  gradient: string;
  textColor: string;
  title?: string;
  person?: string;
  status?: string;
  heldag?: boolean;
  fullDays: number;
  lastDayHours: number;
  percentOfDay: number;
  hoursText?: string | null;

  deleteEvent: (item: any) => void;
  eventItem: any;
  openMenu: (data: any) => void;

  onMove: (e: React.MouseEvent) => void;
  onLeft: (e: React.MouseEvent) => void;
  onRight: (e: React.MouseEvent) => void;
};

export default function EventBar(props: Props) {

  const [hover, setHover] = React.useState(false);

  const width =
    props.fullDays * props.slotWidth +
    (props.lastDayHours > 0
      ? props.slotWidth * (props.percentOfDay / 100)
      : 0);

  const isCompact = props.slotWidth <= 40;

  const label = props.title ?? "";

  return (
    <div
      data-event
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      onContextMenu={(e) => {
        e.preventDefault();
        props.openMenu({
          x: e.clientX,
          y: e.clientY,
          item: props.eventItem
        });
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest("[data-resize]")) return;
        props.onMove(e);
      }}
      className={`
        ${styles.bar}
        ${isCompact ? styles.compact : styles.default}
      `}
      style={{
        left: `${props.startIndex * props.slotWidth + 2}px`,
        width: `${Math.max(width - 4, 20)}px`,
        background: props.gradient,
        color: props.textColor
      }}
    >

      {hover && (
        <div className={styles.tooltip}>
          {props.person && (
            <div className={styles.tooltipStrong}>
              {props.person}
            </div>
          )}

          {props.title && (
            <div className={styles.tooltipRow}>
              {props.title}
            </div>
          )}
        </div>
      )}

      {/* LEFT HANDLE */}
      <div
        data-resize
        onMouseDown={props.onLeft}
        className={`${styles.handle} ${styles.handleLeft}`}
      >
        <div className={styles.handleBar} />
      </div>

      {label}

      {/* RIGHT HANDLE */}
      <div
        data-resize
        onMouseDown={props.onRight}
        className={`${styles.handle} ${styles.handleRight}`}
      >
        <div className={styles.handleBar} />
      </div>

    </div>
  );
}
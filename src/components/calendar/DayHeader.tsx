import * as React from "react";
import styles from "./DayHeader.module.scss";

type Props = {
  days: Date[];
  todayIndex: number;
  slotWidth: number;
  weekdayShort: string[];
};

export default function DayHeader(props: Props) {
  return (
    <div
      className={styles.wrapper}
      style={{
        width: props.days.length * props.slotWidth,
        gridTemplateColumns: `repeat(${props.days.length}, ${props.slotWidth}px)`
      }}
    >
      {props.days.map((d, i) => (
        <div
          key={i}
          className={`${styles.cell} ${
            i === props.todayIndex ? styles.today : ""
          }`}
        >
          <div className={styles.date}>
            {d.getDate()}
          </div>

          <div className={styles.weekday}>
            {props.weekdayShort[d.getDay()]}
          </div>
        </div>
      ))}
    </div>
  );
}
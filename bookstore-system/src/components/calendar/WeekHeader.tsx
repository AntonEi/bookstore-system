import * as React from "react";
import styles from "./WeekHeader.module.scss";

function getISOWeek(date: Date) {
  const tmp = new Date(date);
  tmp.setHours(0, 0, 0, 0);

  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  const week1 = new Date(tmp.getFullYear(), 0, 4);

  return (
    1 +
    Math.round(
      ((tmp.getTime() - week1.getTime()) / 86400000 - 3 +
        ((week1.getDay() + 6) % 7)) / 7
    )
  );
}

type Props = {
  days: Date[];
  slotWidth: number;
};

export default function WeekHeader({ days, slotWidth }: Props) {
  return (
    <div
      className={styles.wrapper}
      style={{
        width: days.length * slotWidth,
        gridTemplateColumns: `repeat(${days.length}, ${slotWidth}px)`
      }}
    >
      {days.map((day, index) => (
        <div
          key={index}
          className={`${styles.cell} ${
            day.getDay() === 1 ? styles.monday : ""
          }`}
        >
          {day.getDay() === 4 && (
            <span className={styles.weekLabel}>
              V{getISOWeek(day)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
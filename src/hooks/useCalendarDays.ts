import * as React from "react";

export function useCalendarDays() {

  const today = React.useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const baseYear = today.getFullYear();

  const startOfRange = React.useMemo(() => {
    const d = new Date(baseYear - 2, 0, 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [baseYear]);

  const endOfRange = React.useMemo(() => {
    const d = new Date(baseYear + 3, 11, 31);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [baseYear]);

  const totalDays = React.useMemo(() => {
    return (
      Math.floor(
        (endOfRange.getTime() - startOfRange.getTime()) / 86400000
      ) + 1
    );
  }, [startOfRange, endOfRange]);

  const days = React.useMemo(() => {
    return Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(startOfRange);
      d.setDate(startOfRange.getDate() + i);
      d.setHours(0, 0, 0, 0);
      return d;
    });
  }, [startOfRange, totalDays]);

  const todayIndex = React.useMemo(() => {
    const todayString = today.toDateString();
    return days.findIndex(d => d.toDateString() === todayString);
  }, [days, today]);

  return {
    today,
    startOfYear: startOfRange,
    days,
    todayIndex
  };
}

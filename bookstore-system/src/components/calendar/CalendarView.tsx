import * as React from "react";
import styles from "./CalendarView.module.scss";
import Button from "../Buttons/Button";

import DayHeader from "./DayHeader";
import WeekHeader from "./WeekHeader";
import PersonRow from "./PersonRow";

type Props = {
    search: string;
    setSearch: (v: string) => void;
    containerRef: any;
    panHandlers: any;
    todayIndex: number;
    slotWidth: number;
    days: Date[];
    weekdayShort: string[];
    filteredPeople: string[];
    filteredEvents: any[];
    vartStyleMap: any;
    startOfYear: Date;
    startDrag: any;
    deleteEvent: (item: any) => void;
    openMenu: (data: any) => void;
    setSlotWidth: (v: number) => void;
    currentUserName: string;
};

export default function CalendarView(props: Props) {
    const [editMode, setEditMode] = React.useState(false);
    const [selectedMonth, setSelectedMonth] = React.useState(
        new Date().getMonth()
    );
    const [currentYear, setCurrentYear] = React.useState(
        new Date().getFullYear()
    );

    const monthOptions = React.useMemo(() => {
        const map = new Map<string, { month: number; year: number; index: number }>();

        props.days.forEach((d, i) => {
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (!map.has(key)) {
                map.set(key, {
                    month: d.getMonth(),
                    year: d.getFullYear(),
                    index: i
                });
            }
        });

        return Array.from(map.values());
    }, [props.days]);

    const scrollToToday = () => {
        if (!props.containerRef.current) return;

        const el = props.containerRef.current;
        const centerOffset = el.clientWidth / 2 - props.slotWidth;

        el.scrollLeft =
            props.todayIndex * props.slotWidth - centerOffset;
    };

    const scrollWeek = (direction: number) => {
        if (!props.containerRef.current) return;
        props.containerRef.current.scrollLeft +=
            direction * 7 * props.slotWidth;
    };

    return (
        <div>

            {/* TOOLBAR */}
            <div className={styles.toolbar}>
                <input
                    className={styles.search}
                    value={props.search}
                    onChange={(e) => props.setSearch(e.target.value)}
                    placeholder="Sök efter böcker..."
                />

                <Button
                    variant={editMode ? "secondary" : "outline"}
                    onClick={() => setEditMode(!editMode)}
                >
                    Edit mode: {editMode ? "ON" : "OFF"}
                </Button>

                <Button variant="outline" onClick={scrollToToday}>
                    Idag
                </Button>

                <Button variant="outline" onClick={() => scrollWeek(-1)}>
                    ← Vecka
                </Button>

                <Button variant="outline" onClick={() => scrollWeek(1)}>
                    Vecka →
                </Button>

                <select
                    className={styles.monthSelect}
                    value={`${currentYear}-${selectedMonth}`}
                    onChange={(e) => {
                        const [year, month] = e.target.value.split("-").map(Number);
                        const target = monthOptions.find(
                            (m) => m.year === year && m.month === month
                        );

                        if (target && props.containerRef.current) {
                            props.containerRef.current.scrollLeft =
                                target.index * props.slotWidth -
                                props.containerRef.current.clientWidth / 2;
                        }
                    }}
                >
                    {monthOptions.map((m) => (
                        <option
                            key={`${m.year}-${m.month}`}
                            value={`${m.year}-${m.month}`}
                        >
                            {[
                                "Januari",
                                "Februari",
                                "Mars",
                                "April",
                                "Maj",
                                "Juni",
                                "Juli",
                                "Augusti",
                                "September",
                                "Oktober",
                                "November",
                                "December"
                            ][m.month]}{" "}
                            {m.year}
                        </option>
                    ))}
                </select>

                <select
                    className={styles.viewSelect}
                    value={props.slotWidth}
                    onChange={(e) =>
                        props.setSlotWidth(Number(e.target.value))
                    }
                >
                    <option value={80}>Veckovy</option>
                    <option value={32}>Månadsvy</option>
                </select>
            </div>

            {/* CALENDAR */}
            <div className={styles.calendar}>
                <div className={styles.left}>
                    <div className={styles.personHeader}>Böcker</div>

                    {props.filteredPeople.map((p) => (
                        <div key={p} className={styles.personRow}>
                            {p}
                        </div>
                    ))}
                </div>

                <div
                    ref={props.containerRef}
                    {...props.panHandlers}
                    className={styles.right}
                >
                    <WeekHeader days={props.days} slotWidth={props.slotWidth} />

                    <DayHeader
                        days={props.days}
                        todayIndex={props.todayIndex}
                        slotWidth={props.slotWidth}
                        weekdayShort={props.weekdayShort}
                    />

                    {props.filteredPeople.map((p) => (
                        <PersonRow
                            key={p}
                            person={p}
                            days={props.days}
                            todayIndex={props.todayIndex}
                            slotWidth={props.slotWidth}
                            events={props.filteredEvents}
                            vartStyleMap={props.vartStyleMap}
                            startOfYear={props.startOfYear}
                            startDrag={props.startDrag}
                            deleteEvent={props.deleteEvent}
                            openMenu={props.openMenu}
                            editMode={editMode}
                            currentUserName={props.currentUserName}
                        />
                    ))}
                </div>
            </div>

        </div>
    );
}
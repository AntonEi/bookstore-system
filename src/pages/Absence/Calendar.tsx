import * as React from "react";
import { useEffect } from "react";
import styles from "./Calendar.module.scss";
import Button from "../../components/Buttons/Button";

import CalendarView from "../../components/calendar/CalendarView";

import { useCalendarDays } from "../../hooks/useCalendarDays";
import { useEventDrag } from "../../hooks/useEventDrag";
import { useHorizontalPan } from "../../hooks/useHorizontalPan";

type Props = {
    onNavigate: (view: string) => void;
};

type CalendarMenuState = {
    x: number;
    y: number;
    item: any;
} | null;

const Calendar: React.FC<Props> = ({ onNavigate }) => {
    const [search, setSearch] = React.useState("");
    const [copies, setCopies] = React.useState<string[]>([]);
    const [events, setEvents] = React.useState<any[]>([]);
    const [slotWidth, setSlotWidth] = React.useState(80);
    const [menu, setMenu] = React.useState<CalendarMenuState>(null);

    const { startOfYear, days, todayIndex } = useCalendarDays();
    const { containerRef, panHandlers } = useHorizontalPan();

    const fetchCopies = React.useCallback(async () => {
        try {
            const res = await fetch("http://localhost:5000/copies");
            const data = await res.json();

            const rows = data.map((copy: any) =>
                `${copy.title} (copy ${copy.copy_id})`
            );

            setCopies(rows);
        } catch (err) {
            console.error("Error fetching copies:", err);
        }
    }, []);

    const fetchLoans = React.useCallback(async () => {
        try {
            const res = await fetch("http://localhost:5000/loans");
            const data = await res.json();

            const uniqueLoans = Array.from(
                new Map(data.map((loan: any) => [loan.loan_id, loan])).values()
            );

            const mappedEvents = uniqueLoans.map((loan: any) => {
                const start = new Date(loan.loan_date);
                start.setHours(12, 0, 0, 0);

                const effectiveEndDate = loan.return_date || loan.due_date;
                const end = new Date(effectiveEndDate);
                end.setHours(12, 0, 0, 0);

                const startIndex = Math.floor(
                    (start.getTime() - startOfYear.getTime()) / 86400000
                );

                const endIndex = Math.floor(
                    (end.getTime() - startOfYear.getTime()) / 86400000
                );

                return {
                    id: loan.loan_id,
                    copy: `${loan.book} (copy ${loan.copy_id})`,
                    Title: loan.customer,
                    Startdatum: start,
                    Slutdatum: end,
                    startIndex,
                    endIndex,
                    Status: "Borrowed",
                    Heldag: true
                };
            });

            setEvents(mappedEvents);
        } catch (err) {
            console.error("Error fetching loans:", err);
        }
    }, [startOfYear]);

    const refreshCalendarData = React.useCallback(async () => {
        await Promise.all([fetchCopies(), fetchLoans()]);
    }, [fetchCopies, fetchLoans]);

    const notifyLibraryUpdate = React.useCallback(() => {
        window.dispatchEvent(new Event("library-data-updated"));
    }, []);

    const openMenu = React.useCallback((data: any) => {
        setMenu(data);
    }, []);

    const closeMenu = React.useCallback(() => {
        setMenu(null);
    }, []);

    const deleteEvent = React.useCallback(async (item: any) => {
        if (!item?.id) return;

        const confirmed = window.confirm("Vill du verkligen ta bort det här lånet?");
        if (!confirmed) return;

        try {
            const response = await fetch(`http://localhost:5000/loans/${item.id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Failed to delete loan");
            }

            closeMenu();
            await refreshCalendarData();
            notifyLibraryUpdate();
        } catch (err) {
            console.error("Failed to delete loan:", err);
            alert("Det gick inte att ta bort lånet.");
        }
    }, [closeMenu, refreshCalendarData, notifyLibraryUpdate]);

    const { startDrag } = useEventDrag({
        events,
        setEvents,
        slotWidth,
        startOfYear,
        listUrl: "http://localhost:5000/loans"
    });

    useEffect(() => {
        refreshCalendarData();
    }, [refreshCalendarData]);

    useEffect(() => {
        const handleLibraryDataUpdated = () => {
            refreshCalendarData();
        };

        window.addEventListener("library-data-updated", handleLibraryDataUpdated);

        return () => {
            window.removeEventListener("library-data-updated", handleLibraryDataUpdated);
        };
    }, [refreshCalendarData]);

    useEffect(() => {
        const handleGlobalClick = () => {
            closeMenu();
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeMenu();
            }
        };

        window.addEventListener("click", handleGlobalClick);
        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("click", handleGlobalClick);
            window.removeEventListener("keydown", handleEscape);
        };
    }, [closeMenu]);

    useEffect(() => {
        if (!containerRef.current) return;

        const scrollPosition = todayIndex * slotWidth;
        containerRef.current.scrollLeft = scrollPosition - 600;
    }, [todayIndex, slotWidth, containerRef]);

    const filteredCopies = copies.filter(
        (c) => c && c.toLowerCase().includes(search.toLowerCase())
    );

    const filteredEvents = events;

    const bookStyleMap = {
        Borrowed: { bg: "#2563eb", text: "#fff" }
    };

    return (
        <div
            className={styles.wrapper}
            onContextMenu={(e) => {
                if ((e.target as HTMLElement).closest("[data-event]")) return;
                e.preventDefault();
                closeMenu();
            }}
        >
            <div className={styles.header}>
                <h1>Bibliotekskalendern</h1>

                <Button
                    variant="outline"
                    onClick={() => onNavigate("books")}
                >
                    Se böcker
                </Button>
            </div>

            <CalendarView
                search={search}
                setSearch={setSearch}
                containerRef={containerRef}
                panHandlers={panHandlers}
                todayIndex={todayIndex}
                slotWidth={slotWidth}
                days={days}
                weekdayShort={["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"]}
                filteredPeople={filteredCopies}
                filteredEvents={filteredEvents}
                vartStyleMap={bookStyleMap}
                startOfYear={startOfYear}
                startDrag={startDrag}
                deleteEvent={deleteEvent}
                openMenu={openMenu}
                setSlotWidth={setSlotWidth}
                currentUserName="System"
            />

            {menu && (
                <div
                    style={{
                        position: "fixed",
                        top: menu.y,
                        left: menu.x,
                        background: "#fff",
                        border: "1px solid #d1d5db",
                        borderRadius: 10,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                        padding: 8,
                        zIndex: 9999,
                        minWidth: 180
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        type="button"
                        onClick={() => deleteEvent(menu.item)}
                        style={{
                            width: "100%",
                            textAlign: "left",
                            background: "transparent",
                            border: "none",
                            padding: "10px 12px",
                            borderRadius: 8,
                            cursor: "pointer",
                            color: "#dc2626",
                            fontSize: 14
                        }}
                    >
                        Ta bort lån
                    </button>
                </div>
            )}
        </div>
    );
};

export default Calendar;
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

const Calendar: React.FC<Props> = ({ onNavigate }) => {

    const [search, setSearch] = React.useState("");

    // LEFT SIDE = BOOK COPIES
    const [copies, setCopies] = React.useState<string[]>([]);

    // EVENTS = LOANS
    const [events, setEvents] = React.useState<any[]>([]);

    const { startOfYear, days, todayIndex } = useCalendarDays();
    const { containerRef, panHandlers } = useHorizontalPan();

    const [slotWidth, setSlotWidth] = React.useState(80);



    const { startDrag } = useEventDrag({
        events,
        setEvents,
        slotWidth,
        startOfYear,
        listUrl: "http://localhost:5000/loans"
    });

    /*
    FETCH LOANS FROM BACKEND
    */

    useEffect(() => {

        fetch("http://localhost:5000/copies")
            .then(res => res.json())
            .then(data => {

                const rows = data.map((copy: any) =>
                    `${copy.title} (copy ${copy.copy_id})`
                );

                setCopies(rows);

            })
            .catch(err => console.error("Error fetching copies:", err));

    }, []);

    useEffect(() => {

        fetch("http://localhost:5000/loans")
            .then(res => res.json())
            .then(data => {

                const mappedEvents = data.map((loan: any) => {

                    const start = new Date(loan.loan_date);
                    start.setHours(12, 0, 0, 0);

                    const end = new Date(loan.due_date);
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

                // CREATE ROWS FOR BOOK COPIES

            })
            .catch(err => console.error("Error fetching loans:", err));

    }, [startOfYear]);

    useEffect(() => {

        if (!containerRef.current) return;

        const scrollPosition = todayIndex * slotWidth;

        containerRef.current.scrollLeft = scrollPosition - 600;

    }, [todayIndex, slotWidth]);

    /*
    FILTER BOOK COPIES
    */
    const filteredCopies = copies.filter(
        (c) => c && c.toLowerCase().includes(search.toLowerCase())
    );


    /*
    EVENTS (NO FILTER YET)
    */
    const filteredEvents = events;


    const bookStyleMap = {
        Borrowed: { bg: "#2563eb", text: "#fff" }
    };


    return (
        <div className={styles.wrapper}>

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

                weekdayShort={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}

                filteredPeople={filteredCopies}
                filteredEvents={filteredEvents}

                vartStyleMap={bookStyleMap}

                startOfYear={startOfYear}

                startDrag={startDrag}

                deleteEvent={() => { }}
                openMenu={() => { }}

                setSlotWidth={setSlotWidth}

                currentUserName="System"
            />

        </div>
    );
};

export default Calendar;
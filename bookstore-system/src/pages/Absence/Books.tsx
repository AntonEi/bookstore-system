import * as React from "react";
import { useEffect, useState } from "react";
import styles from "./Books.module.scss";
import Button from "../../components/Buttons/Button";

type Props = {
    onNavigate: (view: string) => void;
};

type BookCopy = {
    copy_id: number;
    title: string;
    customer: string | null;
};

type Author = {
    author_id: number;
    name: string;
};

type Customer = {
    customer_id: number;
    name: string;
};

const Absence: React.FC<Props> = ({ onNavigate }) => {

    const [books, setBooks] = useState<BookCopy[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    const [showLoanPopup, setShowLoanPopup] = useState(false);
    const [showBookPopup, setShowBookPopup] = useState(false);

    const [showCustomerPopup, setShowCustomerPopup] = useState(false);
    const [showAuthorPopup, setShowAuthorPopup] = useState(false);

    const [showCreateMenu, setShowCreateMenu] = useState(false);

    const [selectedCopy, setSelectedCopy] = useState<number | null>(null);

    const availableCopies = books.filter(book => !book.customer);

    const fetchBooks = () => {
        fetch("http://localhost:5000/books")
            .then(res => res.json())
            .then(data => setBooks(data))
            .catch(err => console.error("Error loading books:", err));
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    useEffect(() => {
        fetch("http://localhost:5000/authors")
            .then(res => res.json())
            .then(data => setAuthors(data))
            .catch(err => console.error("Error loading authors:", err));
    }, []);

    useEffect(() => {
        fetch("http://localhost:5000/customers")
            .then(res => res.json())
            .then(data => setCustomers(data))
            .catch(err => console.error("Error loading customers:", err));
    }, []);

    const getStatusClass = (customer: string | null) => {
        return customer ? styles.statusBorrowed : styles.statusAvailable;
    };

    const getStatusText = (customer: string | null) => {
        return customer ? "Utlånad" : "Ledig";
    };

    /*
    CLICK BOOK → OPEN LOAN POPUP
    */
    const openLoanFromBook = (copy_id: number, customer: string | null) => {

        if (customer) return; // låt inte redan utlånade öppna popup

        setSelectedCopy(copy_id);
        setShowLoanPopup(true);

    };

    /*
    CREATE LOAN
    */

    const createLoan = async () => {

        const copy_id =
            (document.getElementById("copySelect") as HTMLSelectElement).value;

        const customer_id =
            (document.getElementById("customerSelect") as HTMLSelectElement).value;

        const loan_date =
            (document.getElementById("loanDate") as HTMLInputElement).value;

        const due_date =
            (document.getElementById("dueDate") as HTMLInputElement).value;

        try {

            await fetch("http://localhost:5000/loans", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    copy_id,
                    customer_id,
                    loan_date,
                    due_date
                })
            });

            setShowLoanPopup(false);
            setSelectedCopy(null);
            fetchBooks();

        } catch (err) {
            console.error("Failed to create loan:", err);
        }

    };

    /*
    CREATE Author
    */

    const createAuthor = async () => {

        const name =
            (document.getElementById("authorName") as HTMLInputElement).value;

        const country =
            (document.getElementById("authorCountry") as HTMLInputElement).value;

        const birth_year =
            (document.getElementById("authorBirthYear") as HTMLInputElement).value;

        await fetch("http://localhost:5000/authors", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, country, birth_year })
        });

        setShowAuthorPopup(false);

        fetch("http://localhost:5000/authors")
            .then(res => res.json())
            .then(data => setAuthors(data));
    };
    /*
    CREATE Customer
    */

    const createCustomer = async () => {

        const name =
            (document.getElementById("customerName") as HTMLInputElement).value;

        const email =
            (document.getElementById("customerEmail") as HTMLInputElement).value;

        await fetch("http://localhost:5000/customers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email })
        });

        setShowCustomerPopup(false);

        fetch("http://localhost:5000/customers")
            .then(res => res.json())
            .then(data => setCustomers(data));
    };

    /*
    CREATE BOOK
    */

    const createBook = async () => {

        const title =
            (document.getElementById("titleInput") as HTMLInputElement).value;

        const author_id =
            (document.getElementById("authorSelect") as HTMLSelectElement).value;

        const isbn =
            (document.getElementById("isbnInput") as HTMLInputElement).value;

        const publication_year =
            (document.getElementById("yearInput") as HTMLInputElement).value;

        const category =
            (document.getElementById("categoryInput") as HTMLInputElement).value;

        try {

            await fetch("http://localhost:5000/books", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title,
                    author_id,
                    isbn,
                    publication_year,
                    category
                })
            });

            setShowBookPopup(false);
            fetchBooks();

        } catch (err) {
            console.error("Failed to create book:", err);
        }

    };

    return (
        <div className={styles.page}>

            {/* HEADER */}
            <div className={styles.header}>

                <Button
                    variant="outline"
                    onClick={() => onNavigate("calendar")}
                >
                    ← Tillbaka
                </Button>

                <h1>Bibliotek</h1>

                <div className={styles.headerButtons}>

                    <Button onClick={() => setShowLoanPopup(true)}>
                        Låna ut bok
                    </Button>

                    <div className={styles.createMenuWrapper}>

                        <Button
                            variant="outline"
                            onClick={() => setShowCreateMenu(!showCreateMenu)}
                        >
                            Ny ▾
                        </Button>

                        {showCreateMenu && (
                            <div className={styles.createMenu}>

                                <div
                                    className={styles.createMenuItem}
                                    onClick={() => {
                                        setShowBookPopup(true);
                                        setShowCreateMenu(false);
                                    }}
                                >
                                    Ny bok
                                </div>

                                <div
                                    className={styles.createMenuItem}
                                    onClick={() => {
                                        setShowCustomerPopup(true);
                                        setShowCreateMenu(false);
                                    }}
                                >
                                    Ny användare
                                </div>

                                <div
                                    className={styles.createMenuItem}
                                    onClick={() => {
                                        setShowAuthorPopup(true);
                                        setShowCreateMenu(false);
                                    }}
                                >
                                    Ny författare
                                </div>

                            </div>
                        )}

                    </div>

                </div>

            </div>

            {/* LIST */}
            <div className={styles.list}>
                {books.map(book => (
                    <div
                        key={book.copy_id}
                        className={styles.card}
                        onClick={() => openLoanFromBook(book.copy_id, book.customer)}
                    >

                        <div className={styles.cardLeft}>
                            <div className={styles.name}>
                                {book.title}
                            </div>

                            <div className={styles.sub}>
                                Copy #{book.copy_id}
                            </div>
                        </div>

                        <div className={`${styles.badge} ${getStatusClass(book.customer)}`}>
                            {getStatusText(book.customer)}
                        </div>

                    </div>
                ))}
            </div>

            {/* LOAN POPUP */}
            {showLoanPopup && (
                <div
                    className={styles.popupOverlay}
                    onClick={() => setShowLoanPopup(false)}
                >

                    <div
                        className={styles.popup}
                        onClick={(e) => e.stopPropagation()}
                    >

                        <h2>Låna ut bok</h2>

                        <div className={styles.formGrid}>

                            <div className={styles.formField}>
                                <label>Book copy</label>

                                <select
                                    id="copySelect"
                                    value={selectedCopy ?? ""}
                                    onChange={(e) => setSelectedCopy(Number(e.target.value))}
                                >

                                    <option value="">Select book</option>

                                    {availableCopies.map(copy => (
                                        <option
                                            key={copy.copy_id}
                                            value={copy.copy_id}
                                        >
                                            {copy.title} (Copy {copy.copy_id})
                                        </option>
                                    ))}

                                </select>

                            </div>

                            <div className={styles.formField}>
                                <label>Customer</label>
                                <select id="customerSelect">
                                    <option value="">Select customer</option>

                                    {customers.map(customer => (
                                        <option
                                            key={customer.customer_id}
                                            value={customer.customer_id}
                                        >
                                            {customer.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formField}>
                                <label>Loan date</label>
                                <input id="loanDate" type="date" />
                            </div>

                            <div className={styles.formField}>
                                <label>Due date</label>
                                <input id="dueDate" type="date" />
                            </div>

                        </div>

                        <div className={styles.popupButtons}>
                            <Button onClick={() => setShowLoanPopup(false)}>
                                Cancel
                            </Button>

                            <Button onClick={createLoan}>
                                Save
                            </Button>
                        </div>

                    </div>

                </div>
            )}

            {showCustomerPopup && (
                <div
                    className={styles.popupOverlay}
                    onClick={() => setShowCustomerPopup(false)}
                >

                    <div
                        className={styles.popup}
                        onClick={(e) => e.stopPropagation()}
                    >

                        <h2>Ny användare</h2>

                        <div className={styles.formGrid}>

                            <div className={styles.formField}>
                                <label>Namn</label>
                                <input id="customerName" />
                            </div>

                            <div className={styles.formField}>
                                <label>Email</label>
                                <input id="customerEmail" />
                            </div>

                        </div>

                        <div className={styles.popupButtons}>

                            <Button onClick={() => setShowCustomerPopup(false)}>
                                Cancel
                            </Button>

                            <Button onClick={createCustomer}>
                                Save
                            </Button>

                        </div>

                    </div>
                </div>
            )}

            {showAuthorPopup && (
                <div
                    className={styles.popupOverlay}
                    onClick={() => setShowAuthorPopup(false)}
                >

                    <div
                        className={styles.popup}
                        onClick={(e) => e.stopPropagation()}
                    >

                        <h2>Ny författare</h2>

                        <div className={styles.formGrid}>

                            <div className={styles.formField}>
                                <label>Namn</label>
                                <input id="authorName" />
                            </div>

                            <div className={styles.formField}>
                                <label>Land</label>
                                <input id="authorCountry" />
                            </div>

                            <div className={styles.formField}>
                                <label>Födelseår</label>
                                <input id="authorBirthYear" type="number" />
                            </div>

                        </div>

                        <div className={styles.popupButtons}>

                            <Button onClick={() => setShowAuthorPopup(false)}>
                                Cancel
                            </Button>

                            <Button onClick={createAuthor}>
                                Save
                            </Button>

                        </div>

                    </div>
                </div>
            )}

            {/* ADD BOOK POPUP */}
            {showBookPopup && (
                <div
                    className={styles.popupOverlay}
                    onClick={() => setShowBookPopup(false)}
                >
                    <div
                        className={styles.popup}
                        onClick={(e) => e.stopPropagation()}
                    >

                        <h2>Ny bok</h2>

                        <div className={styles.formGrid}>

                            <div className={styles.formField}>
                                <label>Title</label>
                                <input id="titleInput" />
                            </div>

                            <div className={styles.formField}>
                                <label>Author</label>
                                <select id="authorSelect">

                                    <option value="">Select author</option>

                                    {authors.map(author => (
                                        <option
                                            key={author.author_id}
                                            value={author.author_id}
                                        >
                                            {author.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formField}>
                                <label>ISBN</label>
                                <input id="isbnInput" />
                            </div>

                            <div className={styles.formField}>
                                <label>Publication year</label>
                                <input id="yearInput" type="number" />
                            </div>

                            <div className={styles.formField}>
                                <label>Category</label>
                                <input id="categoryInput" />
                            </div>

                        </div>

                        <div className={styles.popupButtons}>

                            <Button
                                onClick={() => setShowBookPopup(false)}
                            >
                                Cancel
                            </Button>

                            <Button onClick={createBook}>
                                Save
                            </Button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};

export default Absence;
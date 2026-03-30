import * as React from "react";
import { useEffect, useState } from "react";
import styles from "./Books.module.scss";
import Button from "../../components/Buttons/Button";

type Props = {
    onNavigate: (view: string) => void;
};

type BookCopy = {
    loan_id?: number | null;
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

type BookFilter = "all" | "available" | "borrowed";

const Books: React.FC<Props> = ({ onNavigate }) => {
    const [books, setBooks] = useState<BookCopy[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    const [showLoanPopup, setShowLoanPopup] = useState(false);
    const [showBookPopup, setShowBookPopup] = useState(false);
    const [showCustomerPopup, setShowCustomerPopup] = useState(false);
    const [showAuthorPopup, setShowAuthorPopup] = useState(false);
    const [showReturnPopup, setShowReturnPopup] = useState(false);
    const [showCreateMenu, setShowCreateMenu] = useState(false);

    const [selectedCopies, setSelectedCopies] = useState<number[]>([]);
    const [selectedAuthorId, setSelectedAuthorId] = useState("");
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [copySearch, setCopySearch] = useState("");
    const [bookFilter, setBookFilter] = useState<BookFilter>("all");
    const [selectedReturnBook, setSelectedReturnBook] = useState<BookCopy | null>(null);

    const [loanError, setLoanError] = useState("");
    const [customerError, setCustomerError] = useState("");
    const [authorError, setAuthorError] = useState("");
    const [bookError, setBookError] = useState("");
    const [returnError, setReturnError] = useState("");

    const availableCopies = books.filter(book => !book.customer);
    const hasCopySearch = copySearch.trim().length > 0;

    const selectedCopyDetails = selectedCopies
        .map(copyId => availableCopies.find(copy => copy.copy_id === copyId))
        .filter((copy): copy is BookCopy => Boolean(copy));

    const filteredAvailableCopies = availableCopies.filter(copy => {
        const normalizedSearch = copySearch.trim().toLowerCase();

        if (!normalizedSearch) {
            return false;
        }

        return (
            copy.title.toLowerCase().includes(normalizedSearch) ||
            String(copy.copy_id).includes(normalizedSearch)
        );
    });

    const filteredBooks = books.filter(book => {
        if (bookFilter === "available") {
            return !book.customer;
        }

        if (bookFilter === "borrowed") {
            return Boolean(book.customer);
        }

        return true;
    });

    const fetchBooks = () => {
        fetch("http://localhost:5000/books")
            .then(res => res.json())
            .then(data => setBooks(data))
            .catch(err => console.error("Error loading books:", err));
    };

    const fetchAuthors = async () => {
        const res = await fetch("http://localhost:5000/authors");
        const data = await res.json();
        setAuthors(data);
        return data as Author[];
    };

    const fetchCustomers = async () => {
        const res = await fetch("http://localhost:5000/customers");
        const data = await res.json();
        setCustomers(data);
        return data as Customer[];
    };

    const notifyCalendarUpdate = () => {
        window.dispatchEvent(new Event("library-data-updated"));
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    useEffect(() => {
        fetchAuthors().catch(err => console.error("Error loading authors:", err));
    }, []);

    useEffect(() => {
        fetchCustomers().catch(err => console.error("Error loading customers:", err));
    }, []);

    const getStatusClass = (customer: string | null) => {
        return customer ? styles.statusBorrowed : styles.statusAvailable;
    };

    const getStatusText = (customer: string | null) => {
        return customer ? "Utlånad" : "Ledig";
    };

    const hasEmptyFields = (fields: string[]) => {
        return fields.some(field => field.trim() === "");
    };

    const closeLoanPopup = () => {
        setShowLoanPopup(false);
        setSelectedCopies([]);
        setSelectedCustomerId("");
        setCopySearch("");
        setLoanError("");
    };

    const closeCustomerPopup = () => {
        setShowCustomerPopup(false);
        setCustomerError("");
    };

    const closeAuthorPopup = () => {
        setShowAuthorPopup(false);
        setAuthorError("");
    };

    const closeBookPopup = () => {
        setShowBookPopup(false);
        setSelectedAuthorId("");
        setBookError("");
    };

    const closeReturnPopup = () => {
        setShowReturnPopup(false);
        setSelectedReturnBook(null);
        setReturnError("");
    };

    const openLoanFromBook = (copy_id: number, customer: string | null) => {
        if (customer) return;

        setSelectedCopies([copy_id]);
        setSelectedCustomerId("");
        const selectedBook = books.find(book => book.copy_id === copy_id);
        setCopySearch(selectedBook ? selectedBook.title : "");
        setLoanError("");
        setShowLoanPopup(true);
    };

    const openBookAction = (book: BookCopy) => {
        if (book.customer) {
            setSelectedReturnBook(book);
            setReturnError("");
            setShowReturnPopup(true);
            return;
        }

        openLoanFromBook(book.copy_id, book.customer);
    };

    const toggleCopySelection = (copy_id: number) => {
        setSelectedCopies(current =>
            current.includes(copy_id)
                ? current.filter(id => id !== copy_id)
                : [...current, copy_id]
        );
    };

    const createLoan = async () => {
        const customer_id = selectedCustomerId;
        const loan_date =
            (document.getElementById("loanDate") as HTMLInputElement).value;
        const due_date =
            (document.getElementById("dueDate") as HTMLInputElement).value;

        if (
            !selectedCopies.length ||
            hasEmptyFields([customer_id, loan_date, due_date])
        ) {
            setLoanError("Välj minst en bok och fyll i alla fält innan du sparar.");
            return;
        }

        try {
            setLoanError("");

            await Promise.all(
                selectedCopies.map(async copy_id => {
                    const response = await fetch("http://localhost:5000/loans", {
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

                    if (!response.ok) {
                        throw new Error(`Failed to create loan for copy ${copy_id}`);
                    }
                })
            );

            closeLoanPopup();
            fetchBooks();
            notifyCalendarUpdate();
        } catch (err) {
            console.error("Failed to create loan:", err);
            setLoanError("Det gick inte att spara utlåningen. Försök igen.");
        }
    };

    const returnBookEarly = async () => {
        if (!selectedReturnBook?.copy_id) {
            setReturnError("Det gick inte att hitta utlåningen för den här boken.");
            return;
        }

        try {
            setReturnError("");

            const today = new Date().toISOString().split("T")[0];

            const response = await fetch(
                `http://localhost:5000/copies/${selectedReturnBook.copy_id}/return`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        return_date: today
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.error || "Failed to return loan");
            }

            closeReturnPopup();
            fetchBooks();
            notifyCalendarUpdate();
        } catch (err: any) {
            console.error("Failed to return book:", err);
            setReturnError(err.message || "Det gick inte att lämna tillbaka boken. Försök igen.");
        }
    };

    const createAuthor = async () => {
        const name =
            (document.getElementById("authorName") as HTMLInputElement).value;
        const country =
            (document.getElementById("authorCountry") as HTMLInputElement).value;
        const birth_year =
            (document.getElementById("authorBirthYear") as HTMLInputElement).value;

        if (hasEmptyFields([name, country, birth_year])) {
            setAuthorError("Fyll i alla fält innan du sparar.");
            return;
        }

        setAuthorError("");

        const response = await fetch("http://localhost:5000/authors", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, country, birth_year })
        });

        const createdAuthor = await response.json();

        closeAuthorPopup();

        const updatedAuthors = await fetchAuthors();
        const matchingAuthorByName = [...updatedAuthors]
            .reverse()
            .find(author => author.name === name);

        const matchingAuthor =
            updatedAuthors.find(author => author.author_id === createdAuthor.author_id) ||
            matchingAuthorByName;

        if (matchingAuthor) {
            setSelectedAuthorId(String(matchingAuthor.author_id));
        }
    };

    const createCustomer = async () => {
        const name =
            (document.getElementById("customerName") as HTMLInputElement).value;
        const email =
            (document.getElementById("customerEmail") as HTMLInputElement).value;

        if (hasEmptyFields([name, email])) {
            setCustomerError("Fyll i alla fält innan du sparar.");
            return;
        }

        setCustomerError("");

        const response = await fetch("http://localhost:5000/customers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email })
        });

        const createdCustomer = await response.json();

        closeCustomerPopup();

        const updatedCustomers = await fetchCustomers();
        const matchingCustomerByName = [...updatedCustomers]
            .reverse()
            .find(customer => customer.name === name);

        const matchingCustomer =
            updatedCustomers.find(
                customer => customer.customer_id === createdCustomer.customer_id
            ) || matchingCustomerByName;

        if (matchingCustomer) {
            setSelectedCustomerId(String(matchingCustomer.customer_id));
        }
    };

    const createBook = async () => {
        const title =
            (document.getElementById("titleInput") as HTMLInputElement).value;
        const author_id = selectedAuthorId;
        const isbn =
            (document.getElementById("isbnInput") as HTMLInputElement).value;
        const publication_year =
            (document.getElementById("yearInput") as HTMLInputElement).value;
        const category =
            (document.getElementById("categoryInput") as HTMLInputElement).value;

        if (hasEmptyFields([title, author_id, isbn, publication_year, category])) {
            setBookError("Fyll i alla fält innan du sparar.");
            return;
        }

        try {
            setBookError("");

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

            closeBookPopup();
            fetchBooks();
            notifyCalendarUpdate();
        } catch (err) {
            console.error("Failed to create book:", err);
            setBookError("Det gick inte att skapa boken. Försök igen.");
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <Button
                    variant="outline"
                    onClick={() => onNavigate("calendar")}
                >
                    ← Tillbaka
                </Button>

                <h1>Bibliotek</h1>

                <div className={styles.headerButtons}>
                    <select
                        className={styles.filterSelect}
                        value={bookFilter}
                        onChange={(e) => setBookFilter(e.target.value as BookFilter)}
                    >
                        <option value="all">Alla böcker</option>
                        <option value="available">Lediga böcker</option>
                        <option value="borrowed">Utlånade böcker</option>
                    </select>

                    <Button
                        onClick={() => {
                            setLoanError("");
                            setSelectedCopies([]);
                            setSelectedCustomerId("");
                            setCopySearch("");
                            setShowLoanPopup(true);
                        }}
                    >
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
                                        setBookError("");
                                        setShowBookPopup(true);
                                        setSelectedAuthorId("");
                                        setShowCreateMenu(false);
                                    }}
                                >
                                    Ny bok
                                </div>

                                <div
                                    className={styles.createMenuItem}
                                    onClick={() => {
                                        setCustomerError("");
                                        setShowCustomerPopup(true);
                                        setShowCreateMenu(false);
                                    }}
                                >
                                    Ny användare
                                </div>

                                <div
                                    className={styles.createMenuItem}
                                    onClick={() => {
                                        setAuthorError("");
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

            <div className={styles.list}>
                {filteredBooks.map(book => (
                    <div
                        key={book.copy_id}
                        className={styles.card}
                        onClick={() => openBookAction(book)}
                    >
                        <div className={styles.cardLeft}>
                            <div className={styles.name}>{book.title}</div>

                            <div className={styles.sub}>
                                Exemplar #{book.copy_id}
                            </div>
                        </div>

                        <div className={`${styles.badge} ${getStatusClass(book.customer)}`}>
                            {getStatusText(book.customer)}
                        </div>
                    </div>
                ))}
            </div>

            {showLoanPopup && (
                <div
                    className={styles.popupOverlay}
                    onClick={closeLoanPopup}
                >
                    <div
                        className={styles.popup}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>Låna ut bok</h2>

                        <div className={styles.formGrid}>
                            <div className={`${styles.formField} ${styles.formFieldFull}`}>
                                <label>Bokexemplar</label>

                                <input
                                    type="text"
                                    value={copySearch}
                                    onChange={(e) => setCopySearch(e.target.value)}
                                    placeholder="Skriv boktitel eller exemplarnummer"
                                />

                                <div className={styles.copyPicker}>
                                    {!availableCopies.length && (
                                        <div className={styles.emptyState}>
                                            Inga lediga exemplar finns just nu.
                                        </div>
                                    )}

                                    {availableCopies.length > 0 && !hasCopySearch && (
                                        <div className={styles.emptyState}>
                                            Börja skriva för att söka efter bokexemplar.
                                        </div>
                                    )}

                                    {availableCopies.length > 0 && hasCopySearch && !filteredAvailableCopies.length && (
                                        <div className={styles.emptyState}>
                                            Inga bokexemplar matchar din sökning.
                                        </div>
                                    )}

                                    {hasCopySearch && filteredAvailableCopies.map(copy => {
                                        const isSelected = selectedCopies.includes(copy.copy_id);

                                        return (
                                            <button
                                                key={copy.copy_id}
                                                type="button"
                                                className={`${styles.copyDropdownOption} ${isSelected ? styles.copyDropdownOptionSelected : ""}`}
                                                onClick={() => toggleCopySelection(copy.copy_id)}
                                            >
                                                <span>{copy.title}</span>
                                                <span>Exemplar {copy.copy_id}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className={styles.selectionSummary}>
                                    {selectedCopies.length} bok/böcker valda
                                </div>

                                {selectedCopyDetails.length > 0 && (
                                    <div className={styles.selectedCopiesList}>
                                        {selectedCopyDetails.map(copy => (
                                            <div
                                                key={copy.copy_id}
                                                className={styles.selectedCopyChip}
                                            >
                                                <span>
                                                    {copy.title} (Exemplar {copy.copy_id})
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() => toggleCopySelection(copy.copy_id)}
                                                    aria-label={`Ta bort ${copy.title}`}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={styles.formField}>
                                <label>Kund</label>

                                <div className={styles.authorSelectRow}>
                                    <select
                                        id="customerSelect"
                                        value={selectedCustomerId}
                                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                                    >
                                        <option value="">Välj kund</option>

                                        {customers.map(customer => (
                                            <option
                                                key={customer.customer_id}
                                                value={customer.customer_id}
                                            >
                                                {customer.name}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        type="button"
                                        className={styles.addAuthorButton}
                                        onClick={() => {
                                            setCustomerError("");
                                            setShowCustomerPopup(true);
                                        }}
                                        aria-label="Lägg till användare"
                                        title="Lägg till användare"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className={styles.formField}>
                                <label>Utlåningsdatum</label>
                                <input id="loanDate" type="date" />
                            </div>

                            <div className={styles.formField}>
                                <label>Förfallodatum</label>
                                <input id="dueDate" type="date" />
                            </div>
                        </div>

                        {loanError && (
                            <div className={styles.validationNotice}>
                                {loanError}
                            </div>
                        )}

                        <div className={styles.popupButtons}>
                            <Button onClick={closeLoanPopup}>
                                Avbryt
                            </Button>

                            <Button onClick={createLoan}>
                                Spara
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {showReturnPopup && selectedReturnBook && (
                <div
                    className={styles.popupOverlay}
                    onClick={closeReturnPopup}
                >
                    <div
                        className={styles.popup}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>Lämna tillbaka bok</h2>

                        <div className={styles.returnSummary}>
                            <strong>{selectedReturnBook.title}</strong>
                            <span>Exemplar #{selectedReturnBook.copy_id}</span>
                            <span>Utlånad till {selectedReturnBook.customer}</span>
                        </div>

                        <p className={styles.returnMessage}>
                            Vill du lämna tillbaka den här boken tidigare?
                        </p>

                        {returnError && (
                            <div className={styles.validationNotice}>
                                {returnError}
                            </div>
                        )}

                        <div className={styles.popupButtons}>
                            <Button onClick={closeReturnPopup}>
                                Avbryt
                            </Button>

                            <Button onClick={returnBookEarly}>
                                Lämna tillbaka
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {showCustomerPopup && (
                <div
                    className={`${styles.popupOverlay} ${styles.popupOverlayFront}`}
                    onClick={closeCustomerPopup}
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
                                <label>E-post</label>
                                <input id="customerEmail" />
                            </div>
                        </div>

                        {customerError && (
                            <div className={styles.validationNotice}>
                                {customerError}
                            </div>
                        )}

                        <div className={styles.popupButtons}>
                            <Button onClick={closeCustomerPopup}>
                                Avbryt
                            </Button>

                            <Button onClick={createCustomer}>
                                Spara
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {showAuthorPopup && (
                <div
                    className={`${styles.popupOverlay} ${styles.popupOverlayFront}`}
                    onClick={closeAuthorPopup}
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

                        {authorError && (
                            <div className={styles.validationNotice}>
                                {authorError}
                            </div>
                        )}

                        <div className={styles.popupButtons}>
                            <Button onClick={closeAuthorPopup}>
                                Avbryt
                            </Button>

                            <Button onClick={createAuthor}>
                                Spara
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {showBookPopup && (
                <div
                    className={styles.popupOverlay}
                    onClick={closeBookPopup}
                >
                    <div
                        className={styles.popup}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>Ny bok</h2>

                        <div className={styles.formGrid}>
                            <div className={styles.formField}>
                                <label>Titel</label>
                                <input id="titleInput" />
                            </div>

                            <div className={styles.formField}>
                                <label>Författare</label>
                                <div className={styles.authorSelectRow}>
                                    <select
                                        id="authorSelect"
                                        value={selectedAuthorId}
                                        onChange={(e) => setSelectedAuthorId(e.target.value)}
                                    >
                                        <option value="">Välj författare</option>

                                        {authors.map(author => (
                                            <option
                                                key={author.author_id}
                                                value={author.author_id}
                                            >
                                                {author.name}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        type="button"
                                        className={styles.addAuthorButton}
                                        onClick={() => {
                                            setAuthorError("");
                                            setShowAuthorPopup(true);
                                        }}
                                        aria-label="Lägg till författare"
                                        title="Lägg till författare"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className={styles.formField}>
                                <label>ISBN</label>
                                <input id="isbnInput" />
                            </div>

                            <div className={styles.formField}>
                                <label>Utgivningsår</label>
                                <input id="yearInput" type="number" />
                            </div>

                            <div className={styles.formField}>
                                <label>Kategori</label>
                                <input id="categoryInput" />
                            </div>
                        </div>

                        {bookError && (
                            <div className={styles.validationNotice}>
                                {bookError}
                            </div>
                        )}

                        <div className={styles.popupButtons}>
                            <Button onClick={closeBookPopup}>
                                Avbryt
                            </Button>

                            <Button onClick={createBook}>
                                Spara
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Books;
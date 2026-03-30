const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

/*
Databasanslutning
*/

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "library_system",
    password: "Res456321",
    port: 5432
});


/*
-------------------------
LÅN
-------------------------
*/

/*
Hämta alla lån (kalender)
*/
app.get("/loans", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                loans.loan_id,
                book_copies.copy_id,
                books.title AS book,
                customers.name AS customer,
                loans.loan_date::text AS loan_date,
                loans.due_date::text AS due_date,
                loans.return_date::text AS return_date
            FROM loans
            JOIN customers
                ON loans.customer_id = customers.customer_id
            JOIN book_copies
                ON loans.copy_id = book_copies.copy_id
            JOIN books
                ON book_copies.book_id = books.book_id
            ORDER BY books.title, book_copies.copy_id, loans.loan_date
        `);

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch loans" });
    }

});


/*
Skapa nytt lån
*/
app.post("/loans", async (req, res) => {

    const { copy_id, customer_id, loan_date, due_date } = req.body;

    try {

        await pool.query(
            `CALL create_loan($1,$2,$3,$4)`,
            [copy_id, customer_id, loan_date, due_date]
        );

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create loan" });
    }

});


/*
Uppdatera datum för lån
*/
app.put("/loans/:id", async (req, res) => {

    const { id } = req.params;
    const { loan_date, due_date } = req.body;

    try {

        await pool.query(
            `CALL update_loan($1,$2,$3)`,
            [id, loan_date, due_date]
        );

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database update failed" });
    }

});

/*
Ta bort lån
*/
app.delete("/loans/:id", async (req, res) => {

    const { id } = req.params;

    try {

        const loanResult = await pool.query(
            `
            DELETE FROM loans
            WHERE loan_id = $1
            RETURNING loan_id, copy_id
            `,
            [id]
        );

        if (!loanResult.rowCount) {
            return res.status(404).json({ error: "Loan not found" });
        }

        await pool.query(
            `
            UPDATE book_copies
            SET status = 'available'
            WHERE copy_id = $1
            `,
            [loanResult.rows[0].copy_id]
        );

        res.json({
            success: true,
            loan_id: loanResult.rows[0].loan_id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete loan" });
    }

});


/*
-------------------------
BÖCKER
-------------------------
*/

/*
Hämta alla bokkopior
*/
app.get("/books", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                loans.loan_id,
                book_copies.copy_id,
                books.title,
                customers.name AS customer
            FROM book_copies
            JOIN books
                ON books.book_id = book_copies.book_id
            LEFT JOIN loans
                ON loans.copy_id = book_copies.copy_id
                AND loans.return_date IS NULL
                AND CURRENT_DATE BETWEEN loans.loan_date AND loans.due_date
            LEFT JOIN customers
                ON customers.customer_id = loans.customer_id
            ORDER BY books.title, book_copies.copy_id
        `);

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch books" });
    }

});


/*
Skapa ny bok
*/
app.post("/books", async (req, res) => {

    const {
        title,
        author_id,
        isbn,
        publication_year,
        category
    } = req.body;

    try {

        await pool.query(
            `CALL create_book($1,$2,$3,$4,$5)`,
            [title, author_id, isbn, publication_year, category]
        );

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create book" });
    }

});


/*
Hämta bokkopior (kalender)
*/
app.get("/copies", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                book_copies.copy_id,
                books.title
            FROM book_copies
            JOIN books
                ON books.book_id = book_copies.book_id
            ORDER BY books.title, book_copies.copy_id
        `);

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch copies" });
    }

});

/*
Lämna tillbaka bokexemplar via copy_id
*/
app.put("/copies/:id/return", async (req, res) => {
    const { id } = req.params;
    const { return_date } = req.body;

    if (!return_date) {
        return res.status(400).json({ error: "return_date saknas" });
    }

    try {
        const result = await pool.query(
            `
            UPDATE loans
            SET return_date = $2
            WHERE loan_id = (
                SELECT loan_id
                FROM loans
                WHERE copy_id = $1
                  AND return_date IS NULL
                ORDER BY loan_date DESC, loan_id DESC
                LIMIT 1
            )
            RETURNING loan_id
            `,
            [id, return_date]
        );

        if (!result.rowCount) {
            return res.status(404).json({ error: "No active loan found for this copy" });
        }

        await pool.query(
            `
            UPDATE book_copies
            SET status = 'available'
            WHERE copy_id = $1
            `,
            [id]
        );

        res.json({
            success: true,
            loan_id: result.rows[0].loan_id
        });
    } catch (err) {
        console.error("Return copy error:", err.message);
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


/*
-------------------------
KUNDER
-------------------------
*/

/*
Hämta kunder
*/
app.get("/customers", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                customer_id,
                name
            FROM customers
            ORDER BY name
        `);

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch customers" });
    }

});


/*
Skapa kund
*/
app.post("/customers", async (req, res) => {

    const { name, email } = req.body;

    try {

        const result = await pool.query(
            `INSERT INTO customers(name, email)
             VALUES ($1,$2)
             RETURNING customer_id, name`,
            [name, email]
        );

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create customer" });
    }

});


/*
-------------------------
FÖRFATTARE
-------------------------
*/

/*
Hämta författare
*/
app.get("/authors", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                author_id,
                name
            FROM authors
            ORDER BY name
        `);

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch authors" });
    }

});


/*
Skapa författare
*/
app.post("/authors", async (req, res) => {

    const { name, country, birth_year } = req.body;

    try {

        const result = await pool.query(
            `INSERT INTO authors(name, country, birth_year)
             VALUES ($1,$2,$3)
             RETURNING author_id, name`,
            [name, country, birth_year]
        );

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create author" });
    }

});


/*
Starta servern
*/
app.listen(5000, () => {
    console.log("Server running on port 5000");
});



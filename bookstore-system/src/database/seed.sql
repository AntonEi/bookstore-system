-- Authors
INSERT INTO authors (name, country, birth_year)
VALUES
('J.K. Rowling', 'United Kingdom', 1965),
('J.R.R. Tolkien', 'United Kingdom', 1892),
('George Orwell', 'United Kingdom', 1903);

-- Books
INSERT INTO books (title, author_id, isbn, publication_year, category)
VALUES
('Harry Potter and the Philosopher''s Stone', 1, '9780747532743', 1997, 'Fantasy'),
('The Lord of the Rings', 2, '9780261102385', 1954, 'Fantasy'),
('1984', 3, '9780451524935', 1949, 'Dystopian');

-- Book copies
INSERT INTO book_copies (book_id, status, location)
VALUES
(1, 'available', 'A1'),
(1, 'available', 'A1'),
(2, 'available', 'B3'),
(3, 'available', 'C2');

-- Customers
INSERT INTO customers (name, email)
VALUES
('Anna Andersson', 'anna@example.com'),
('Erik Svensson', 'erik@example.com'),
('Sara Nilsson', 'sara@example.com');

-- Loans
INSERT INTO loans (copy_id, customer_id, loan_date, due_date)
VALUES
(1, 1, '2026-05-01', '2026-05-10'),
(3, 2, '2026-05-03', '2026-05-12');


SELECT
    customers.name AS customer,
    books.title AS book,
    loans.loan_date,
    loans.due_date
FROM loans
JOIN customers ON loans.customer_id = customers.customer_id
JOIN book_copies ON loans.copy_id = book_copies.copy_id
JOIN books ON book_copies.book_id = books.book_id;

SELECT
    books.title,
    COUNT(loans.loan_id) AS times_loaned
FROM loans
JOIN book_copies ON loans.copy_id = book_copies.copy_id
JOIN books ON book_copies.book_id = books.book_id
GROUP BY books.title
ORDER BY times_loaned DESC;
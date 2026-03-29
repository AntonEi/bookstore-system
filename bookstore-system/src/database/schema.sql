-- TABLES
CREATE TABLE authors (
    author_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100),
    birth_year INT
);

CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author_id INT NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    publication_year INT,
    category VARCHAR(100),

    FOREIGN KEY (author_id)
        REFERENCES authors(author_id)
);

CREATE TABLE book_copies (
    copy_id SERIAL PRIMARY KEY,
    book_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'available',
    location VARCHAR(50),

    FOREIGN KEY (book_id)
        REFERENCES books(book_id)
);

CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    member_since DATE DEFAULT CURRENT_DATE
);

CREATE TABLE loans (
    loan_id SERIAL PRIMARY KEY,
    copy_id INT NOT NULL,
    customer_id INT NOT NULL,
    loan_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,

    FOREIGN KEY (copy_id)
        REFERENCES book_copies(copy_id),

    FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id),

    CHECK (due_date > loan_date)
);

-- INDEX

CREATE INDEX idx_loans_copy_id
ON loans(copy_id);

CREATE INDEX idx_loans_customer_id
ON loans(customer_id);

CREATE INDEX idx_books_author_id
ON books(author_id);

-- STORED PROCEDURE

CREATE OR REPLACE PROCEDURE create_loan(
    p_copy_id INT,
    p_customer_id INT,
    p_loan_date DATE,
    p_due_date DATE
)
LANGUAGE plpgsql
AS $$
BEGIN

INSERT INTO loans(copy_id, customer_id, loan_date, due_date)
VALUES (p_copy_id, p_customer_id, p_loan_date, p_due_date);

END;
$$;

CREATE OR REPLACE PROCEDURE update_loan(
    p_loan_id INT,
    p_loan_date DATE,
    p_due_date DATE
)
LANGUAGE plpgsql
AS $$
BEGIN

UPDATE loans
SET loan_date = p_loan_date,
    due_date = p_due_date
WHERE loan_id = p_loan_id;

END;
$$;

CREATE OR REPLACE PROCEDURE create_book(
    p_title TEXT,
    p_author_id INT,
    p_isbn TEXT,
    p_publication_year INT,
    p_category TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    new_book_id INT;
BEGIN

INSERT INTO books(title, author_id, isbn, publication_year, category)
VALUES (p_title, p_author_id, p_isbn, p_publication_year, p_category)
RETURNING book_id INTO new_book_id;

INSERT INTO book_copies(book_id)
VALUES (new_book_id);

END;
$$;

CREATE OR REPLACE PROCEDURE create_customer(
    p_name TEXT,
    p_email TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN

INSERT INTO customers(name, email)
VALUES (p_name, p_email);

END;
$$;

CREATE OR REPLACE PROCEDURE create_author(
    p_name TEXT,
    p_country TEXT,
    p_birth_year INT
)
LANGUAGE plpgsql
AS $$
BEGIN

INSERT INTO authors(name, country, birth_year)
VALUES (p_name, p_country, p_birth_year);

END;
$$;

-- AUTOMATION / TRIGGER

CREATE OR REPLACE FUNCTION set_copy_borrowed()
RETURNS TRIGGER AS $$
BEGIN

UPDATE book_copies
SET status = 'borrowed'
WHERE copy_id = NEW.copy_id;

RETURN NEW;

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_loan_created
AFTER INSERT ON loans
FOR EACH ROW
EXECUTE FUNCTION set_copy_borrowed();


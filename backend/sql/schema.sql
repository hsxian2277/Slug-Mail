--
-- All SQL statements must be on a single line and end in a semicolon.
--

-- Dummy table --
DROP TABLE IF EXISTS dummy;
CREATE TABLE dummy(created TIMESTAMP WITH TIME ZONE);

DROP TABLE IF EXISTS mail;
DROP TABLE IF EXISTS mailbox;
DROP TABLE IF EXISTS account;
CREATE TABLE account(email VARCHAR(30) UNIQUE PRIMARY KEY, pw VARCHAR(100), username VARCHAR(30));

CREATE TABLE mailbox(boxid SERIAL PRIMARY KEY, email VARCHAR(30), boxname VARCHAR(30), CONSTRAINT fk_email FOREIGN KEY(email) REFERENCES account(email) ON UPDATE CASCADE);

CREATE TABLE mail(mailid UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), boxid SERIAL, email jsonb, unread BOOLEAN NOT NULL, starred BOOLEAN NOT NULL, CONSTRAINT fk_boxid FOREIGN KEY(boxid) REFERENCES mailbox(boxid));


-- Your database schema goes here --

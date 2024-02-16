# EXPENSE TRACKER

## Description

A web application for tracking daily spending to help users manage their finances more efficiently.

The main functions are:

* User registration and authentication.

* Enter incomings and expenses with additional information about them.

* View transactions history with filters.

* Expense analytics with the ability to filter data to obtain insights about financial behavior.

## Technologies

**Fraimwork**: Nest.js

**API Query Language**: GraphQL

**Database**: PostgreSQL

**ORM**: TypeORM

## Database Schema Documentation

![DB schema](<DB-schema.png>)

### 1. Users Table

**Description:** Stores information about users who are registered in the Expense Tracker application.

  | Field          | Type         | Description                                     |
  |----------------|--------------|-------------------------------------------------|
  | id             | UUID         | Primary key, unique identifier for each user.   |
  | email          | VARCHAR(255) | User's email address, used for logging in.      |
  | password_hash  | VARCHAR(255) | Hashed password for user's account security.    |
  | name           | VARCHAR(50)  | User's full name (optional).                    |
  | created_at     | TIMESTAMP    | The date and time when the account was created. |
  | updated_at     | TIMESTAMP    | The date and time of the last account update.   |

### 2. Transactions Table

**Description:** Records financial transactions made by users.

  | Field         | Type             | Description                                                |
  |---------------|------------------|------------------------------------------------------------|
  | id            | UUID             | Primary key, unique identifier for each transaction.       |
  | user_id       | UUID             | Foreign key linking to the Users table.                    |
  | amount        | DECIMAL          | The monetary value of the transaction.                     |
  | type          | transaction_type | The type of transaction, defined as an ENUM                |
  | category_id   | UUID             | The category of the transaction (e.g., "Food", "Rent").    |
  | description   | TEXT             | A description of the transaction.                          |
  | date          | TIMESTAMP        | The date and time when the transaction occurred.           |
  | created_at    | TIMESTAMP        | The date and time when the transaction was recorded.       |
  | updated_at    | TIMESTAMP        | The date and time when the transaction record was updated. |

#### ENUM Types

**transaction_type ENUM:**

* **Description:** Represents the types of transactions.
* **Values:**
  * `income`: Represents an incoming transaction.
  * `expense`: Represents an outgoing transaction.

### 3. Categories Table

**Description:** Contains predefined categories that can be used to classify transactions.

  | Field       | Type         | Description                                       |
  |-------------|--------------|---------------------------------------------------|
  | id          | UUID         | Primary key, unique identifier for each category. |
  | name        | VARCHAR(50)  | The name of the category.                         |
  | description | TEXT         | A brief description of the category (optional).   |

#### Relationships

**Transactions to Categories:** Many-to-One (Optional). If implemented, each transaction can be assigned to one category, making it easier to classify and analyze expenses. This would require adding a `category_id` field to the Transactions table to establish a foreign key relationship with the Categories table.

**Users to Transactions:** One-to-Many. A single user can have multiple transactions, but each transaction is associated with one user. This relationship is established through the `user_id` field in the Transactions table, which acts as a foreign key to the Users table.

## Installation

```bash
# installation of dependences
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

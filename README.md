# Expense Tracker

## Table Of Content

* [Description](#description)
* [Technologies](#technologies)
* [Database Schema Documentation](#database-schema-documentation)
* [API Documentation](#api-documentation)
  * [Getting Started](#getting-started)
  * [Authentication](#authentication)
  * [Transactions Management](#authentication)
  * [Analytics Management](#authentication)
  * [Category Management](#authentication)
* [Installation](#installation)
* [Running the app](#running-the-app)

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

**Description:** Contains predefined categories that can be used to classify transactions as well as custom categories created by users.

  | Field       | Type         | Description                                                                                      |
  |-------------|--------------|--------------------------------------------------------------------------------------------------|
  | id          | UUID         | Primary key, unique identifier for each category.                                                |
  | name        | VARCHAR(50)  | The name of the category.                                                                        |
  | description | TEXT         | A brief description of the category (optional).                                                  |
  | user_id     | UUID         | Foreign key linking to the Users table (optional). Identifies the user who created the category. |

#### Relationships

**Transactions to Categories:** Many-to-One. Each transaction can be assigned to one category, making it easier to classify and analyze expenses. This would require adding a `category_id` field to the Transactions table to establish a foreign key relationship with the Categories table.

**Users to Transactions:** One-to-Many. A single user can have multiple transactions, but each transaction is associated with one user. This relationship is established through the `user_id` field in the Transactions table, which acts as a foreign key to the Users table.

## API Documentation

### Getting Started

**Endpoint:** `/graphql`

**Method:** POST

**Headers:**

* `Content-Type: application/json`
* `Authorization: Bearer <token>` (for protected routes)

### Authentication

#### Register a new user

Allows a new user to register an account by providing their email, password and name. Upon successful registration, returns the user's ID, email and name.

```graphql
mutation RegisterUser {
  register(userInput: { email: "user@example.com", password: "password123", name: "John Doe" }) {
    id
    email
    name
  }
}
```

#### Authenticate and receive a token

Authenticates a user with their email and password. Upon successful authentication, returns an access token that can be used for authenticated requests to the API.

```graphql
mutation AuthenticateUser {
  login(email: "user@example.com", password: "password123") {
    accessToken
  }
}
```

### Transactions Management

#### Add a new transaction

Allows a user to add a new transaction. The user must provide the `amount`, `type` (as an ENUM of either 'income' or 'expense'), `category_id` (referencing an existing category by UUID), `description`, and the `date` of the transaction.

Protected route.

```graphql
mutation AddTransaction {
  createTransaction(transactionInput: {
    amount: 50.00,
    type: "income",
    categoryId: "uuid-of-the-category",
    description: "Freelance payment",
    date: "2024-02-16T12:00:00Z"
  }) {
    id
    amount
    type
    categoryId
    description
    date
  }
}
```

#### Get user transactions

Retrieves a list of transactions for a user. The query can be filtered by various criteria (next query). By default, it returns all transactions associated with the user's account.

Protected route.

```graphql
query GetUserTransactions {
  transactions() {
    id
    amount
    type
    category {
      id
      name
    }
    description
    date
  }
}
```

#### Get user transactions with filters

Users can filter the transactions by date range (`startDate` and `endDate`), `category`, or `type`. This query returns all transactions associated with the user's account that match the given filters.

Protected route.

```graphql
query GetUserTransactions {
  transactions(
    filter: {
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      categoryId: "uuid-of-the-category",
      type: "expense"
    }
  ) {
    id
    amount
    type
    category {
      id
      name
    }
    description
    date
  }
}
```

#### Update an existing transaction

Allows a user to update the details of an existing transaction. The user can modify fields such as `amount`, `type`, `categoryId`, `description`, and `date`. The `id` of the transaction must be provided to specify which transaction is to be updated.

Protected route.

```graphql
mutation UpdateTransaction {
  updateTransaction(
    id: "uuid-of-the-transaction",
    transactionInput: {
      amount: 15.99,
      type: "expense",
      categoryId: "uuid-of-the-category",
      description: "Updated lunch",
      date: "2024-02-16T12:00:00Z"
    }
  ) {
    id
    amount
    type
    categoryId
    description
    date
  }
}
```

### Analytics Management

#### Get user financial analytics for a specific period

Retrieves financial analytics for a user over a specified date range (`startDate` and `endDate`). This could include total income, total expenses, and a breakdown by categories.

Protected route.

```graphql
query GetUserFinancialAnalytics {
  financialAnalytics(
    startDate: "2024-01-01",
    endDate: "2024-01-31"
  ) {
    totalIncome
    totalExpenses
    byCategory {
      categoryId
      categoryName
      totalAmount
    }
  }
}
```

### Category Management

#### Add a new category

Allows a user to create a new custom category. The user must provide the `name` of the category, and optionally a `description`.

Protected route.

```graphql
mutation AddCategory {
  addCategory(categoryInput: {
    name: "New Category",
    description: "Description of the new category"
  }) {
    id
    name
    description
  }
}
```

#### Get user categories

Retrieves a list of custom categories created by the user.

Protected route.

```graphql
query GetUserCategories {
  userCategories() {
    id
    name
    description
  }
}
```

#### Update an existing category

Allows a user to update the details of an existing category they own. The user must provide the category ID and can update the name and/or description.

Protected route.

```graphql
mutation UpdateCategory {
  updateCategory(
    id: "uuid-of-the-category",
    categoryInput: {
      name: "Updated Category Name",
      description: "Updated description of the category"
    }
  ) {
    id
    name
    description
  }
}
```

#### Delete a category

Allows a user to delete an existing category they own. The user must provide the category ID.

Protected route.

```graphql
mutation DeleteCategory {
  deleteCategory(
    id: "uuid-of-the-category"
  ) {
    success
  }
}
```

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

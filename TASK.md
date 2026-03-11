# Coding Challenge

## Instructions

- We have given you a simple full stack app with React, TS, Express, PGSQL running in docker
- We ask you to fork this repo, and use AI to iterate and add different features according to the spec we have requested
- You must record your screen during this task
- You can complete it at any time and send it to us
- You will have 2 hours to complete the task
- You may use AI during the task
- You must talk us through your thinking and problem solving during the task, why you are making decisions, how you are guiding the AI
- Don't focus on unit testing so much - manual checks are fine
- Remember to use git to commit your progress as you would normally
- You can change anything about the stack as you wish (e.g. switch Express for some other backend) though we don't recommend this as it will waste time. You can use different providers other than Stripe or Gemini SDK which we have recommended if they are not available to you.
- Submit the 2 hour video to us in an email or through LinkedIn

---

## The Product

A small-business accounting app that lets owners manage customers, record transactions, and issue invoices — all in one place.

---

## Core Features

Work through these in order. You are not expected to complete all of them.

### 1. Auth
Users can sign up for an account, log in, and log out. All other features require authentication.

### 2. Customers
Users can view a list of their customers, add new ones, edit existing ones, and delete them.

### 3. Transactions
Users can view a list of transactions, each showing its amount, type (income or expense), and category. Users can add new transactions and filter the list by type or category.

### 4. Invoices
Users can create an invoice for a customer with one or more line items. Invoices can be viewed and their status updated through the lifecycle: **draft → sent → paid**.

---

## Stretch Goals

If you have time left, pick any of the following in any order:

- **Dashboard** — a summary view showing total revenue, total expenses, and the value of outstanding invoices.
- **Categories** — a management screen for income and expense categories.
- **PDF export** — generate a downloadable PDF for an invoice.
- **CSV import** — bulk-import transactions from a CSV file.
- **AI categorisation** — automatically suggest a category for a transaction based on its description (Gemini SDK suggested, but any equivalent is fine).
- **Payment links** — add a payment link to an invoice (Stripe suggested, but any equivalent is fine).

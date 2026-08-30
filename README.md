# 📋 Subscription Tracker

<p align="center">
  <strong>A simple, secure, and professional subscription management application</strong>
</p>

<p align="center">
  Manage subscriptions, track spending, monitor renewal dates, and receive timely reminders — all from one clean dashboard.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-Black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Resend-000000?style=for-the-badge&logo=resend&logoColor=white" alt="Resend">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="MIT License">
</p>

<p align="center">
  <a href="#-about">About</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-environment-variables">Environment Variables</a> •
  <a href="#-security">Security</a> •
  <a href="#-license">License</a>
</p>

---

## 📖 About

**Subscription Tracker** is a full-stack web application built to make subscription management simple, organized, and easy to use.

It provides one central place to manage subscription information, monitor spending, track billing cycles, keep an eye on upcoming renewal dates, and receive renewal reminders.

The application combines a modern responsive interface with authentication, database storage, subscription management, renewal tracking, and email notifications.

---

## ✨ Features

### 🔐 Authentication

- Secure user registration and login
- Email and password authentication
- Email verification
- Google OAuth authentication
- Secure logout
- Protected application routes
- User-specific data

### 📊 Dashboard

- Subscription overview
- Total subscription count
- Monthly spending overview
- Yearly spending overview
- Active subscription information
- Upcoming renewal overview
- Quick access to subscription information

### 📋 Subscription Management

- Add subscriptions
- Edit subscriptions
- Delete subscriptions
- View subscription details
- Track subscription cost
- Track billing cycle
- Track next renewal date
- Store vendor information
- Store website information
- Add notes
- Organize subscriptions by category
- Manage subscription status

### 🔎 Search & Filtering

- Search subscriptions
- Filter subscriptions
- Filter by category
- Filter by status
- Quickly find subscription information

### 📅 Renewal Management

- Dedicated renewals section
- Upcoming renewal tracking
- Next 7 days renewal view
- Remaining-days indicator
- Renewal status tracking
- Automatic renewal monitoring

### 🔔 Notifications

- In-app renewal notifications
- Upcoming renewal alerts
- Configurable reminder preferences
- Multiple reminder intervals

### 📧 Email Reminders

- Automatic renewal reminder emails
- Multiple reminder intervals
- Renewal-day reminders
- Configurable email notifications
- Protected reminder processing
- Duplicate reminder protection

### ⚙️ Settings

- Account management
- Notification preferences
- Reminder preferences
- Theme preferences
- Light mode
- Dark mode
- Secure logout

### 📱 Responsive Design

- Responsive layout
- Desktop support
- Tablet support
- Mobile-friendly interface
- Clean and modern user experience

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js** | Full-stack React framework |
| **React** | User interface |
| **TypeScript** | Type-safe application development |
| **Tailwind CSS** | Styling and responsive design |
| **Supabase** | Authentication and backend services |
| **PostgreSQL** | Database |
| **Resend** | Email delivery |
| **Lucide React** | User interface icons |
| **React Hook Form** | Form management |
| **Zod** | Data validation |
| **date-fns** | Date handling |
| **ESLint** | Code quality and linting |
| **npm** | Package management |

---

## 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │        User         │
                         │     Web Browser     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     Next.js App     │
                         │                     │
                         │ React + TypeScript  │
                         │    Tailwind CSS     │
                         └──────────┬──────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
                  ▼                 ▼                 ▼
          ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
          │ Supabase Auth │ │  PostgreSQL   │ │  Server APIs  │
          │               │ │               │ │               │
          │ Email / Google│ │ Subscription  │ │ Secure Logic  │
          │ Authentication│ │     Data      │ │               │
          └───────────────┘ └───────────────┘ └───────┬───────┘
                                                      │
                                                      ▼
                                             ┌────────────────┐
                                             │     Resend     │
                                             │                │
                                             │ Email Reminders│
                                             └────────────────┘

## 🚀 Quick Start

### Prerequisites

Make sure you have:

- **Node.js 18+**
- **npm**
- **Git**
- A **Supabase project**
- A **Resend account** for email reminders

### Installation

```bash
git clone https://github.com/the-vivekkumar/Subscription-Tracker.git
cd Subscription-Tracker
npm.cmd install
```

### Environment Setup

Create a file named:

```text
.env.local
```

in the project root.

Add the required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

RESEND_API_KEY=YOUR_RESEND_API_KEY
RESEND_FROM_EMAIL=YOUR_SENDER_EMAIL

CRON_SECRET=YOUR_CRON_SECRET
```

> ⚠️ Never commit `.env.local` or real API keys to GitHub.

### Start the Application

```powershell
npm.cmd run dev
```

Open the application at:

```text
http://localhost:3000
```

> **Note:** `npm.cmd` is used on Windows PowerShell to avoid npm execution-policy issues.

---

## 🗄️ Supabase Setup

Subscription Tracker uses **Supabase** for authentication and database services.

The database schema is included in:

```text
supabase/schema.sql
```

Run the SQL from this file inside the **Supabase SQL Editor** to create the required database structure.

Supabase provides:

- User authentication
- User sessions
- PostgreSQL database
- Subscription data storage
- Row Level Security
- User-specific data access

---

## 🔑 Authentication

The application supports:

- Email and password authentication
- Email verification
- Google OAuth

Authentication is handled through **Supabase Auth**.

Users can securely create an account, verify their email address, sign in, and access their own subscription data.

Google sign-in is handled through the configured Supabase OAuth provider.

---

## 📧 Email Reminder System

Subscription Tracker supports automatic email reminders for upcoming subscription renewals.

### Default Reminder Schedule

| Reminder | Timing |
|---|---|
| First reminder | 30 days before renewal |
| Second reminder | 14 days before renewal |
| Third reminder | 7 days before renewal |
| Fourth reminder | 3 days before renewal |
| Fifth reminder | 1 day before renewal |
| Final reminder | Renewal day |

Email delivery is handled through **Resend**.

The renewal reminder process uses a protected server-side endpoint and requires scheduled execution to automatically process reminders.

---

## ⚙️ Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public client key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase access | Server operations |
| `RESEND_API_KEY` | Resend email service key | Email reminders |
| `RESEND_FROM_EMAIL` | Email sender address | Email reminders |
| `CRON_SECRET` | Protects scheduled reminder processing | Scheduled reminders |

> ⚠️ Never expose server-side secrets through client-side code.

> ⚠️ Never upload `.env.local` to a public GitHub repository.

---

## 🔒 Security

Security and user data protection are important parts of the application.

The project uses:

- Supabase Authentication
- PostgreSQL
- Row Level Security
- Protected application routes
- User-specific database access
- Server-side operations
- Environment variables for sensitive credentials
- Protected renewal reminder processing
- Secure authentication sessions

### Sensitive Credentials

The following values must remain private:

```text
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
CRON_SECRET
```

Never expose server-side secrets through client-side code.

Never upload `.env.local` to a public GitHub repository.

---

## 💳 Pricing

Subscription Tracker does **not charge users a monthly or yearly application subscription fee**.

The subscription costs stored in the application are used for tracking the user's own subscription expenses.

---

## 🧪 Development Commands

### Install Dependencies

```powershell
npm.cmd install
```

Installs all required project dependencies.

### Start Development Server

```powershell
npm.cmd run dev
```

Starts the local development server.

After the server starts, open:

```text
http://localhost:3000
```

> **Note:** `npm.cmd` is used on Windows PowerShell to avoid npm execution-policy issues.

---

## 🗺️ Roadmap

- 📊 Advanced spending analytics
- 📈 More detailed subscription insights
- 🔔 Additional notification options
- 📱 Further mobile improvements
- 📤 Additional export formats
- 🌍 Improved multi-currency support
- 📅 Enhanced renewal management
- ⚡ Continued performance improvements
- 🎨 Further UI and accessibility improvements

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

### Contribution Steps

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Test your changes
5. Commit your changes
6. Push your branch
7. Open a pull request

Please keep contributions focused on the purpose and functionality of the project.

---

## 📄 License

This project is licensed under the **MIT License**.

Copyright © 2026 **Vivek**

The MIT License allows others to use, copy, modify, merge, publish, distribute, sublicense, and sell copies of the software, subject to the terms of the license.

See the [`LICENSE`](LICENSE) file for the complete license text.

---

## 👨‍💻 Author

### Vivek

**MCA Student & Developer**

Built with ❤️ with a focus on simplicity, security, usability, and clean design.

<p align="center">
  <a href="https://github.com/the-vivekkumar">
    <strong>GitHub Profile →</strong>
  </a>
</p>

---

<p align="center">
  <strong>📋 Subscription Tracker</strong>
</p>

<p align="center">
  Manage subscriptions. Track renewals. Stay organized.
</p>

<p align="center">
  ⭐ If you find this project useful, consider giving the repository a star.
</p>
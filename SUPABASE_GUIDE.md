# 🚀 Supabase Backend Integration Guide

> Complete step-by-step guide to add Supabase authentication and database to your portfolio website.

---

## What is Supabase?

Supabase is an open-source **Firebase alternative** that gives you:

| Feature | Description |
|---|---|
| **Authentication** | Email/password, Google, GitHub OAuth |
| **PostgreSQL Database** | Tables, queries, real-time subscriptions |
| **Storage** | File/image uploads |
| **Edge Functions** | Serverless backend logic |

All available **free** on the starter plan.

---

## Step 1 — Create a Supabase Project

1. Go to **[supabase.com](https://supabase.com)** → Sign up / Log in
2. Click **"New Project"**
3. Fill in the details:
   - **Project name**: `portfolio`
   - **Database Password**: *(save this somewhere safe!)*
   - **Region**: Choose closest to you (e.g., South Asia)
4. Click **"Create new project"** → Wait ~2 minutes for setup

---

## Step 2 — Get Your API Keys

1. In your project dashboard, go to **Settings → API** (left sidebar)
2. Copy these two values:

```
Project URL  →  https://xyzxyz.supabase.co
Anon Key     →  eyJhbGci... (long JWT string)
```

> [!IMPORTANT]
> Never expose your `service_role` key in frontend code. Only use the `anon` (public) key.

---

## Step 3 — Add Supabase to Your HTML Files

Paste this inside `<head>` of **every HTML page** that uses Supabase:

```html
<!-- Supabase CDN -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const SUPABASE_URL = 'https://YOUR_PROJECT_URL.supabase.co';
  const SUPABASE_KEY = 'YOUR_ANON_PUBLIC_KEY';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
</script>
```

Replace `YOUR_PROJECT_URL` and `YOUR_ANON_PUBLIC_KEY` with your actual values from Step 2.

---

## Step 4 — Enable Authentication

1. In your Supabase dashboard, go to **Authentication → Providers**
2. **Email** is enabled by default ✅
3. *(Optional)* Enable **Google** or **GitHub** for social login

---

## Step 5 — Login Logic (`login.html`)

Add this to your login form's submit handler:

```javascript
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email    = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert('Login failed: ' + error.message);
  } else {
    alert('Login successful!');
    window.location.href = 'index.html'; // redirect to portfolio
  }
});
```

---

## Step 6 — Signup Logic (`signup.html`)

```javascript
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email    = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    alert('Signup failed: ' + error.message);
  } else {
    alert('Check your email to confirm your account!');
  }
});
```

---

## Step 7 — Protect Portfolio Page (`index.html`)

Add this at the **top of the script** in `index.html` to redirect unauthenticated users:

```javascript
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  window.location.href = 'login.html'; // not logged in → redirect
}
```

> [!NOTE]
> Wrap this in an `async` IIFE if you are not inside an async function:
> ```javascript
> (async () => {
>   const { data: { session } } = await supabase.auth.getSession();
>   if (!session) window.location.href = 'login.html';
> })();
> ```

---

## Step 8 — Logout Button

```javascript
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
});
```

Add a button in your HTML:

```html
<button id="logoutBtn">Logout</button>
```

---

## Step 9 — (Optional) Save Contact Form to Database

### 9a. Create the Table (Quickest Way)

Instead of clicking manually, run this SQL code:

1.  Go to **SQL Editor** (left sidebar) in Supabase.
2.  Paste the contents of `schema.sql` (included in your project files).
3.  Click **Run**.

This creates the `contacts` table with the correct columns (`name`, `email`, `subject`, `message`) and sets up the security policies automatically.

### 9b. Insert Data from Contact Form

```javascript
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name    = document.getElementById('name').value;
  const email   = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  const { error } = await supabase
    .from('contacts')
    .insert([{ name, email, message }]);

  if (error) {
    alert('Failed to send: ' + error.message);
  } else {
    alert('Message sent successfully!');
  }
});
```

---

## 🗺️ Integration Summary

```
portfolio/
├── login.html      → Step 5  (signInWithPassword)
├── signup.html     → Step 6  (signUp)
├── index.html      → Step 7  (getSession check) + Step 8 (logout)
└── index.html      → Step 9  (contact form → database)
```

| File | Supabase Feature Used |
|------|-----------------------|
| `login.html` | `auth.signInWithPassword()` |
| `signup.html` | `auth.signUp()` |
| `index.html` | `auth.getSession()`, `auth.signOut()` |
| Contact section | `supabase.from('contacts').insert()` |

---

## ✅ Quick Checklist

- [ ] Created Supabase project
- [ ] Copied `Project URL` and `Anon Key`
- [ ] Added CDN `<script>` to all HTML pages
- [ ] Implemented login logic
- [ ] Implemented signup logic
- [ ] Added session guard on `index.html`
- [ ] Added logout button
- [ ] (Optional) Created `contacts` table and wired up contact form

---

> [!TIP]
> You can view all logged-in users under **Authentication → Users** in your Supabase dashboard.
> All contact form submissions will appear under **Table Editor → contacts**.

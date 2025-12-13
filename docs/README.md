# SoftNex Website - Local Backend

This project includes a simple Node/Express backend to receive contact form submissions and a basic admin page to view them.

How to run locally:

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Open the site in your browser:

- Frontend: http://localhost:3000/
- Admin (view submissions): http://localhost:3000/admin

Where data is stored:

- Submissions are saved to `data/submissions.json` in the project folder. Open that file or visit `/admin` to view entries.

Notes:

- This is a minimal local backend intended for development. For production usage consider adding authentication for the admin page and using a real database.

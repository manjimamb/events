# Evently — Event Registration Admin Panel (MERN)

A simple, responsive MERN Stack admin panel for creating, viewing, updating, and deleting events.

## Features
- Dashboard displays Event ID, Event Name, Event Date, Venue, and Total Registrations.
- Navbar with Dashboard and Add Event links.
- Add and update form fields: name, description, date, and venue.
- Delete event with confirmation.
- Express REST API and MongoDB Atlas database.
- Responsive layout for desktop and mobile.
- Registration count starts at 0 for a new event. The current assignment does not include attendee registration, so the count is ready to display and can be extended later.

## 1. Requirements
Install Node.js (LTS) and npm. Create a MongoDB Atlas cluster and database user, then allow your computer's IP in Atlas Network Access.

## 2. Configure MongoDB Atlas
1. In MongoDB Atlas, open your cluster and choose **Connect**.
2. Choose **Drivers** and copy the connection string.
3. Open `backend/.env.example`, copy it to a new file named `.env` in the same folder.
4. Replace the placeholder with your connection string, including your database username/password and database name.

Example:
```
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.example.mongodb.net/event_admin
PORT=5000
```
Do not upload `.env` or share your database password publicly. If your password contains special characters, URL-encode them.

## 3. Start the backend
Open a terminal:
```
cd backend
npm install
npm run dev
```
Expected message: `Connected to MongoDB Atlas` and `Backend running at http://localhost:5000`.

## 4. Start the frontend
Open a second terminal:
```
cd frontend
npm install
npm run dev
```
Open the local URL shown by Vite, normally `http://localhost:5173`.

## API routes
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/events` | Get all events |
| GET | `/api/events/:id` | Get one event for editing |
| POST | `/api/events` | Add an event |
| PUT | `/api/events/:id` | Update an event |
| DELETE | `/api/events/:id` | Delete an event |

## Project structure
```
event-registration-admin/
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       └── main.jsx
└── README.md
```

## Notes
- Do not put your real MongoDB Atlas URI in source code or commit your `.env` file.
- If the UI says it cannot connect, check that the backend terminal is running and Atlas is reachable.
- This is an assignment starter. Read and understand the code and adjust it to your course requirements before submitting.

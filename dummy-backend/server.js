// dummy-backend/server.js

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Sample rooms data
const rooms = [
  { name: "Ayrton Senna", color: "#d97706" },
  { name: "Santos Dumont", color: "#7e57c2" },
  { name: "Alan Turing", color: "#2b6cb0" },
  { name: "Dorothy Vaughan", color: "#c0841a" },
  { name: "Ada Lovelace", color: "#2f9e74" },
  { name: "John Von Neumann", color: "#b23a76" }
];

// Sample bookings data
const bookings = [
  { room: "Dorothy Vaughan", start: "08:30", end: "09:30" },
  { room: "John Von Neumann", start: "08:30", end: "09:30" },
  { room: "Dorothy Vaughan", start: "09:30", end: "10:30" },
  { room: "John Von Neumann", start: "09:30", end: "10:30" },
  { room: "Ayrton Senna", start: "14:00", end: "17:00" },
  { room: "Alan Turing", start: "10:00", end: "12:00" },
  { room: "Santos Dumont", start: "11:00", end: "12:00" },
  { room: "Ada Lovelace", start: "15:00", end: "16:00" },
  { room: "Ayrton Senna", start: "08:00", end: "09:00" },
  { room: "Alan Turing", start: "09:00", end: "10:00" },
  { room: "Santos Dumont", start: "10:00", end: "11:00" },
  { room: "Ada Lovelace", start: "11:00", end: "12:00" },
  { room: "John Von Neumann", start: "13:00", end: "14:00" },
  { room: "Dorothy Vaughan", start: "14:00", end: "15:00" },
  { room: "Alan Turing", start: "16:00", end: "17:00" },
  { room: "Santos Dumont", start: "17:00", end: "18:00" },
  { room: "Ada Lovelace", start: "08:30", end: "09:30" },
  { room: "John Von Neumann", start: "12:00", end: "13:00" },
  { room: "Dorothy Vaughan", start: "17:00", end: "18:00" }
];

app.get("/rooms", (req, res) => {
  res.json(rooms);
});

app.get("/booking", (req, res) => {
  res.json(bookings);
});

app.listen(PORT, () => {
  console.log(`Dummy server running at http://localhost:${PORT}`);
});

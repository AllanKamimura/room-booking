import { useState, useEffect } from "react";
import "./App.css";

// Helper: parse "HH:MM" to minutes since 00:00
function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Generate hour slots from 06:00 to 18:00
const hourSlots = Array.from({ length: 13 }, (_, i) =>
  (6 + i).toString().padStart(2, "0") + ":00"
);

// Animation types
const ANIMATIONS = ["inflate-pop", "shake", "pulse", "color-flash"] as const;
type AnimationType = typeof ANIMATIONS[number];

// Helper to get a unique key for a booking block
function bookingBlockKey(room: string, start: string, end: string, hour: string, i: number) {
  return `${room}_${start}_${end}_${hour}_${i}`;
}

 // API base URL from env
const API_BASE_URL = import.meta.env.VITE_ROOM_API_BASE_URL || "http://localhost:3000";

type Room = { name: string; color: string };
type Booking = { room: string; start: string; end: string };

function App() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [animatedBlocks, setAnimatedBlocks] = useState<Record<string, AnimationType | null>>({});

  // Fetch rooms and bookings from API
  async function fetchData() {
    try {
      console.log("Fetching:", `${API_BASE_URL}/rooms`, `${API_BASE_URL}/booking`);
      const [roomsRes, bookingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/rooms`),
        fetch(`${API_BASE_URL}/booking`)
      ]);
      if (!roomsRes.ok || !bookingsRes.ok) throw new Error("API error");
      const roomsData = await roomsRes.json();
      const bookingsData = await bookingsRes.json();
      setRooms(roomsData);
      setBookings(bookingsData);
    } catch (err) {
      console.error("API fetch error:", err);
    }
  }

  // Fetch on mount and every 10 minutes (ignore time for debugging)
  useEffect(() => {
    console.log("API_BASE_URL:", API_BASE_URL);
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 10 * 60 * 1000); // 10 minutes
    return () => clearInterval(interval);
  }, []);

  // Randomly trigger animations on booking blocks
  useEffect(() => {
    const interval = setInterval(() => {
      // Find all visible booking blocks
      const allBlocks: { key: string; animation: AnimationType }[] = [];
      rooms.forEach((room) => {
        hourSlots.forEach((hour) => {
          getBookingsForHour(room.name, hour, bookings).forEach((b, i) => {
            const key = bookingBlockKey(room.name, b.start, b.end, hour, i);
            // Randomly pick an animation
            const animation = ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)];
            allBlocks.push({ key, animation });
          });
        });
      });
      if (allBlocks.length === 0) return;
      // Pick a random block to animate
      const randomBlock = allBlocks[Math.floor(Math.random() * allBlocks.length)];
      setAnimatedBlocks((prev) => ({
        ...prev,
        [randomBlock.key]: randomBlock.animation
      }));
      // Remove the animation after 1.2s
      setTimeout(() => {
        setAnimatedBlocks((prev) => ({
          ...prev,
          [randomBlock.key]: null
        }));
      }, 1200);
    }, 1800);
    return () => clearInterval(interval);
  }, [rooms, bookings]);

  // Helper: get bookings for a room that overlap a given hour
  function getBookingsForHour(room: string, hour: string, bookings: Booking[]) {
    const hourStart = timeToMinutes(hour);
    const hourEnd = hourStart + 60;
    return bookings
      .filter(
        (b) =>
          b.room === room &&
          timeToMinutes(b.end) > hourStart &&
          timeToMinutes(b.start) < hourEnd
      )
      .map((b) => {
        // Clamp booking to this hour
        const start = Math.max(timeToMinutes(b.start), hourStart);
        const end = Math.min(timeToMinutes(b.end), hourEnd);
        return { ...b, startMin: start, endMin: end };
      });
  }

  // Current date/time state
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  function formatDateTime(date: Date) {
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }

  return (
    <div className="booking-app full-screen">
      <div
        style={{
          position: "absolute",
          top: 18,
          right: 32,
          fontSize: "1.05rem",
          color: "#6366f1",
          fontWeight: 600,
          background: "rgba(255,255,255,0.85)",
          borderRadius: 8,
          padding: "2px 14px",
          zIndex: 20,
          boxShadow: "0 2px 8px rgba(99,102,241,0.07)",
        }}
      >
        {formatDateTime(now)}
      </div>
      <h1 className="title">Meeting Room Booking Overview</h1>
      <div className="table-container full-table" style={{ position: "relative" }}>
        {/* Current time vertical line */}
        <CurrentTimeLine />
        <table className="booking-table">
          <thead>
            <tr>
              <th>Room</th>
              {hourSlots.map((slot) => (
                <th key={slot}>{slot}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.name}>
                <td
                  className="room-name"
                  style={{
                    background: room.color + "22",
                    color: room.color,
                    borderRight: `2px solid ${room.color}55`
                  }}
                >
                  {room.name}
                </td>
                {hourSlots.map((hour) => (
                  <td key={hour} className="booking-cell" style={{ position: "relative", background: "#f8fafc" }}>
                    {getBookingsForHour(room.name, hour, bookings).map((b, i) => {
                      // Calculate left/width in percent for this hour cell
                      const hourStart = timeToMinutes(hour);
                      const left = ((b.startMin - hourStart) / 60) * 100;
                      let width = ((b.endMin - b.startMin) / 60) * 100;
                      // Minimum width for 15 min
                      const minWidth = (15 / 60) * 100;
                      if (width < minWidth) width = minWidth;
                      const blockKey = bookingBlockKey(room.name, b.start, b.end, hour, i);
                      const animation = animatedBlocks[blockKey];
                      return (
                        <div
                          key={blockKey}
                          className={`booking-block${animation ? " anim-" + animation : ""}`}
                          style={{
                            position: "absolute",
                            left: `${left}%`,
                            width: `${width}%`,
                            top: 0,
                            height: "100%",
                            background: `linear-gradient(90deg, ${room.color}cc 60%, ${room.color} 100%)`,
                            color: "#fff",
                            fontWeight: 600,
                            borderRadius: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.85rem",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                            zIndex: 2,
                            transition: "transform 0.2s"
                          }}
                          title={`${b.room}: ${b.start} - ${b.end}`}
                        >
                          Booked
                        </div>
                      );
                    })}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="footer">
        Made with 🍞 by Toradex
      </p>
    </div>
  );
}

/** Current time vertical line component */
function CurrentTimeLine() {
  // Get current time in minutes since 00:00
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = 6 * 60;
  const endMin = 18 * 60;
  // Only show if within range
  if (nowMin < startMin || nowMin > endMin) return null;
  // Calculate percent from 06:00 to 18:00 (12 hours)
  const percent = ((nowMin - startMin) / (endMin - startMin)) * 100;
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: `calc(${percent}% + 80px)`, // 80px for room name col
        width: "2px",
        height: "100%",
        background: "rgba(239,68,68,0.85)",
        zIndex: 10,
        pointerEvents: "none",
        boxShadow: "0 0 8px 2px rgba(239,68,68,0.18)"
      }}
      title="Current time"
    />
  );
}

export default App;

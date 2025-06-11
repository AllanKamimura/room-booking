import { useState, useEffect, useRef } from "react";
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

function getNowInSaoPaulo() {
  // Get the current time in America/Sao_Paulo as a Date object
  const now = new Date();
  // Get the time parts in the target timezone
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .formatToParts(now)
    .reduce((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {} as Record<string, string>);
  // Construct a Date object in local time with the Sao Paulo time parts
  return new Date(
    `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`
  );
}

function App() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [animatedBlocks, setAnimatedBlocks] = useState<Record<string, AnimationType | null>>({});

  // For hour grid lines alignment
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const hourCellRefs = useRef<(HTMLTableCellElement | null)[]>([]);
  const [hourCellLefts, setHourCellLefts] = useState<number[]>([]);

  // Fetch rooms and bookings from API
  async function fetchData() {
    try {
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
      // Optionally handle error
    }
  }

  // Fetch on mount and every 10 minutes (ignore time for debugging)
  useEffect(() => {
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

  // For hour grid lines: measure cell positions after render
  useEffect(() => {
    function updateHourCellLefts() {
      if (!tableContainerRef.current) return;
      const containerRect = tableContainerRef.current.getBoundingClientRect();
      const lefts = hourCellRefs.current.map(
        (cell) => cell ? cell.getBoundingClientRect().left - containerRect.left : 0
      );
      setHourCellLefts(lefts);
    }
    updateHourCellLefts();
    window.addEventListener("resize", updateHourCellLefts);
    return () => window.removeEventListener("resize", updateHourCellLefts);
  }, [rooms, bookings]);

  const [now, setNow] = useState(getNowInSaoPaulo());
  useEffect(() => {
    const timer = setInterval(() => setNow(getNowInSaoPaulo()), 1000);
    return () => clearInterval(timer);
  }, []);

  function formatDateTime(date: Date) {
    // Format as UTC-3
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "America/Sao_Paulo",
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
      <div
        className="table-container full-table"
        style={{ position: "relative", paddingBottom: 32 }}
        ref={tableContainerRef}
      >
        {/* Hour grid lines */}
        <HourGridLines hourCellLefts={hourCellLefts} />
        {/* Current time vertical line */}
        <CurrentTimeLine hourCellLefts={hourCellLefts} />
        <table className="booking-table">
          <thead>
            <tr>
              <th>Room</th>
              {hourSlots.map((slot, i) => (
                <th
                  key={slot}
                  ref={el => { hourCellRefs.current[i] = el; }}
                  style={{ position: "relative" }}
                >
                  {slot}
                </th>
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
        Made with <img src="https://icons.iconarchive.com/icons/google/noto-emoji-food-drink/256/32371-bread-icon.png" alt="🍞" width="24" height="24" /> by Toradex
      </p>
    </div>
  );
}

/** Hour grid lines component */
function HourGridLines({ hourCellLefts }: { hourCellLefts: number[] }) {
  // Draw a vertical line at each hour cell (except the first, which is 06:00)
  return (
    <>
      {hourCellLefts.map((left, i) =>
        i === 0 ? null : (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              left,
              width: "2px",
              height: "96%",
              background: "rgba(99,102,241,0.13)",
              zIndex: 5,
              pointerEvents: "none",
            }}
          />
        )
      )}
    </>
  );
}

/** Current time vertical line component */
function CurrentTimeLine({ hourCellLefts }: { hourCellLefts: number[] }) {
  // Get current time in minutes since 00:00 in America/Sao_Paulo
  const now = getNowInSaoPaulo();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = 6 * 60;
  const endMin = 18 * 60;
  // Only show if within range
  if (nowMin < startMin || nowMin > endMin || hourCellLefts.length < 2) return null;

  // Find the hour index and interpolate between the two hour cells
  const hourIdx = Math.floor((nowMin - startMin) / 60);
  const minInHour = nowMin - (startMin + hourIdx * 60);
  const leftA = hourCellLefts[hourIdx] ?? 0;
  const leftB = hourCellLefts[hourIdx + 1] ?? leftA + 60;
  const left = leftA + ((leftB - leftA) * (minInHour / 60));

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left,
          width: "6px",
          height: "96%",
          background: "rgba(239,68,68,0.92)",
          zIndex: 20,
          pointerEvents: "none",
          boxShadow: "0 0 12px 2px rgba(239,68,68,0.18)",
          borderRadius: "3px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        title="Current time"
      >
        {/* NOW label at the bottom, always visible and inside the container */}
        <div
          className="now-glow"
          style={{
            position: "absolute",
            left: "50%",
            bottom: 0,
            transform: "translate(-50%, 100%)",
            background: "rgba(239,68,68,0.95)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.85rem",
            borderRadius: "6px",
            padding: "2px 10px 2px 10px",
            boxShadow: "0 2px 8px rgba(239,68,68,0.13)",
            letterSpacing: "1px",
            pointerEvents: "none",
            zIndex: 30,
            whiteSpace: "nowrap",
            maxWidth: 80,
            textAlign: "center",
            animation: "now-glow 1.2s infinite alternate",
          }}
        >
          NOW
        </div>
      </div>
    </>
  );
}

export default App;

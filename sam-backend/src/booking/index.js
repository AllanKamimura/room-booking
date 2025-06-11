exports.handler = async (event) => {
  // Example: return some bookings
  const bookings = [
    { room: "Room A", start: "09:05", end: "09:35" },
    { room: "Room B", start: "10:00", end: "11:00" },
    { room: "Room C", start: "08:15", end: "08:45" },
    { room: "Room D", start: "14:00", end: "15:00" },
    { room: "Room E", start: "17:30", end: "18:00" }
  ];
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookings)
  };
};

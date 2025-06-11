exports.handler = async (event) => {
  // Example: return 5 rooms with name and color
  const rooms = [
    { name: "Room A", color: "#6366f1" },
    { name: "Room B", color: "#10b981" },
    { name: "Room C", color: "#f59e42" },
    { name: "Room D", color: "#ef4444" },
    { name: "Room E", color: "#a21caf" }
  ];
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rooms)
  };
};

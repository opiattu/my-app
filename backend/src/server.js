import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

const allowedOrigins = [
  "http://localhost:5173",
  "https://github.com/opiattu/my-app.git",
];

app.use(
  cors({
    origin: (origin, cb) => {
      
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);

app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/api", (req, res) => {
  res.json({
    message: "Booking API is working!",
    endpoints: [
      "/api/rooms",
      "/api/bookings",
      "/health"
    ]
  });
});

app.get("/api/rooms", async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({ 
      orderBy: { code: "asc" } 
    });
    
    const stats = {
      available: rooms.filter(r => r.status === "available").length,
      booked: rooms.filter(r => r.status === "booked").length,
      maintenance: rooms.filter(r => r.status === "maintenance").length,
      total: rooms.length
    };
    
    res.json({ rooms, stats });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});


app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      include: {
        room: true 
      }
    });
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});


app.post("/api/bookings", async (req, res) => {
  try {
    const { roomCode, roomName, date, startTime, endTime, status, organizer, note } = req.body ?? {};

    if (!roomCode || !date || !startTime || !endTime || !organizer) {
      return res.status(400).json({ 
        error: "roomCode, date, startTime, endTime, organizer are required" 
      });
    }

    const created = await prisma.booking.create({
      data: {
        roomCode: String(roomCode),
        roomName: String(roomName ?? ""),
        date: String(date),
        startTime: String(startTime),
        endTime: String(endTime),
        status: String(status ?? "pending"),
        organizer: String(organizer),
        note: note == null ? null : String(note),
      },
    });

    res.status(201).json(created);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: String(error) });
  }
});

app.patch("/api/bookings/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const patch = req.body ?? {};
    
    const updated = await prisma.booking.update({
      where: { id },
      data: {
        roomCode: patch.roomCode ?? undefined,
        roomName: patch.roomName ?? undefined,
        date: patch.date ?? undefined,
        startTime: patch.startTime ?? undefined,
        endTime: patch.endTime ?? undefined,
        status: patch.status ?? undefined,
        organizer: patch.organizer ?? undefined,
        note: patch.note === undefined ? undefined : patch.note,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ error: String(error) });
  }
});

app.delete("/api/bookings/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await prisma.booking.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ error: String(error) });
  }
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working",
    prisma: prisma ? "Prisma connected" : "Prisma not connected",
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5137;
app.listen(PORT, () => {
  console.log(`✅ API started on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API info: http://localhost:${PORT}/api`);
});
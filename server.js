
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Event schema
const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true, trim: true },
    registrations: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

// Registration schema
const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

const Registration = mongoose.model(
  "Registration",
  registrationSchema
);

// Check that the backend is running
app.get("/", (req, res) => {
  res.send("Event Registration API is running");
});

// Get all events
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ message: "Could not load events" });
  }
});

// Get one event
app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(400).json({ message: "Invalid event ID" });
  }
});

// Add a new event
app.post("/api/events", async (req, res) => {
  try {
    const { name, description, date, venue } = req.body;

    if (
      !name?.trim() ||
      !description?.trim() ||
      !date ||
      !venue?.trim()
    ) {
      return res.status(400).json({
        message: "Please fill in every field"
      });
    }

    const event = await Event.create({
      name,
      description,
      date,
      venue
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("Add event error:", error);
    res.status(500).json({ message: "Could not add event" });
  }
});

// Update an existing event
app.put("/api/events/:id", async (req, res) => {
  try {
    const { name, description, date, venue } = req.body;

    if (
      !name?.trim() ||
      !description?.trim() ||
      !date ||
      !venue?.trim()
    ) {
      return res.status(400).json({
        message: "Please fill in every field"
      });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { name, description, date, venue },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Update event error:", error);
    res.status(400).json({ message: "Could not update event" });
  }
});

// Delete an event
app.delete("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Delete registrations associated with this event
    await Registration.deleteMany({ eventId: event._id });

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(400).json({ message: "Could not delete event" });
  }
});

// Register a participant for an event
app.post("/api/events/:id/register", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Validate registration details
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof phone !== "string" ||
      !phone.trim()
    ) {
      return res.status(400).json({
        message: "Full name, email address, and phone number are required"
      });
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({
        message: "Please enter a valid email address"
      });
    }

    // Find the event
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    // Save participant details
    const registration = await Registration.create({
      eventId: event._id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim()
    });

    // Increase event registration count
    event.registrations = (event.registrations || 0) + 1;
    await event.save();

    res.status(201).json({
      message: "Registration successful",
      registration: {
        id: registration._id,
        eventId: registration.eventId,
        name: registration.name,
        email: registration.email,
        phone: registration.phone
      },
      registrations: event.registrations
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Registration failed. Please try again."
    });
  }
});

// Get registrations for an event (useful for the admin panel)
app.get("/api/events/:id/registrations", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const registrations = await Registration.find({
      eventId: event._id
    }).sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    console.error("Get registrations error:", error);
    res.status(400).json({ message: "Could not load registrations" });
  }
});

// Start server and connect to MongoDB
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing. Add it to backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();

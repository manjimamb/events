
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import "./App.css";

const API = "http://localhost:5000/api/events";

// ==================== NAVBAR ====================
function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="brand">
        Evently Admin
      </NavLink>

      <div className="nav-links">
        <NavLink to="/" end>
          Dashboard
        </NavLink>

        <NavLink to="/add">
          Add Event
        </NavLink>
      </div>
    </nav>
  );
}

// ==================== FOOTER ====================
function Footer() {
  return (
    <footer className="footer">
      <p>Event Registration Admin</p>
    </footer>
  );
}

// ==================== DASHBOARD ====================
function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEvents() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load events.");
      }

      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message || "Could not connect to the backend server."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function deleteEvent(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete event.");
      }

      setEvents((previous) =>
        previous.filter((event) => event._id !== id)
      );
    } catch (err) {
      window.alert(err.message || "Could not delete event.");
    }
  }

  const totalRegistrations = events.reduce(
    (total, event) => total + Number(event.registrations || 0),
    0
  );

  function formatDate(date) {
    if (!date) return "Not specified";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  return (
    <main className="container">
      <div className="page-header">
        <div>
          <h1>Event Dashboard</h1>
          <p>Manage your events and registrations.</p>
        </div>

        <NavLink to="/add" className="primary-button">
          + Add New Event
        </NavLink>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Events</h3>
          <p>{events.length}</p>
        </div>

        <div className="stat-card">
          <h3>Total Registrations</h3>
          <p>{totalRegistrations}</p>
        </div>
      </div>

      <section className="table-section">
        <div className="section-header">
          <h2>All Events</h2>

          <button
            type="button"
            className="secondary-button"
            onClick={loadEvents}
          >
            Refresh
          </button>
        </div>

        {loading && <p>Loading events...</p>}

        {error && (
          <div className="error-message">
            {error}
            <button type="button" onClick={loadEvents}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="empty-state">
            <h3>No events available</h3>
            <p>Create your first event to get started.</p>

            <NavLink to="/add" className="primary-button">
              Add Event
            </NavLink>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Registrations</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr key={event._id}>
                    <td>{event.name}</td>
                    <td>{formatDate(event.date)}</td>
                    <td>{event.venue || "Not specified"}</td>
                    <td>{event.registrations || 0}</td>

                    <td>
                      <div className="action-buttons">
                        <NavLink
                          to={`/register/${event._id}`}
                          className="register-button"
                        >
                          Register
                        </NavLink>

                        <NavLink
                          to={`/edit/${event._id}`}
                          className="edit-button"
                        >
                          Update
                        </NavLink>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => deleteEvent(event._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

// ==================== ADD / UPDATE EVENT ====================
function EventForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    date: "",
    venue: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;

    let cancelled = false;

    async function loadEvent() {
      try {
        setError("");

        const response = await fetch(`${API}/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load event details.");
        }

        if (!cancelled) {
          setForm({
            name: data.name || "",
            date: data.date
              ? new Date(data.date).toISOString().slice(0, 10)
              : "",
            venue: data.venue || "",
            description: data.description || "",
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load event details.");
        }
      } finally {
        if (!cancelled) {
          setFetching(false);
        }
      }
    }

    loadEvent();

    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.date ||
      !form.venue.trim() ||
      !form.description.trim()
    ) {
      setError("Please fill in every field.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        isEdit ? `${API}/${id}` : API,
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            date: form.date,
            venue: form.venue.trim(),
            description: form.description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save event.");
      }

      navigate("/");
    } catch (err) {
      setError(
        err.message || "Could not connect to the backend server."
      );
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <main className="container">
        <p>Loading event details...</p>
      </main>
    );
  }

  return (
    <main className="container form-page">
      <form className="event-form" onSubmit={handleSubmit}>
        <h1>{isEdit ? "Update Event" : "Add New Event"}</h1>

        <p>
          Enter the details to {isEdit ? "update" : "create"} an event.
        </p>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <label htmlFor="name">Event Name *</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Enter event name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="date">Event Date *</label>
        <input
          id="date"
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          required
        />

        <label htmlFor="venue">Location *</label>
        <input
          id="venue"
          name="venue"
          type="text"
          placeholder="Enter event location"
          value={form.venue}
          onChange={handleChange}
          required
        />

        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          placeholder="Enter event description"
          rows="4"
          value={form.description}
          onChange={handleChange}
          required
        />

        <div className="form-buttons">
          <button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : isEdit
                ? "Update Event"
                : "Add Event"}
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/")}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}

// ==================== EVENT REGISTRATION ====================
function RegistrationForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [loadingEvent, setLoadingEvent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEvent() {
      try {
        setError("");

        const response = await fetch(`${API}/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load event.");
        }

        if (!cancelled) {
          setEvent(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load event.");
        }
      } finally {
        if (!cancelled) {
          setLoadingEvent(false);
        }
      }
    }

    loadEvent();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function formatDate(date) {
    if (!date) return "Not specified";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not specified";
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  async function handleSubmit(eventObject) {
    eventObject.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      setError("Please fill in every field.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API}/${id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed. Please try again."
        );
      }

      setSuccess("Registration successful!");

      setForm({
        name: "",
        email: "",
        phone: "",
      });
    } catch (err) {
      setError(
        err.message || "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingEvent) {
    return (
      <main className="container">
        <p>Loading event...</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="container">
        <h1>Event not found</h1>
        {error && <p className="error-message">{error}</p>}

        <button type="button" onClick={() => navigate("/")}>
          Back to Dashboard
        </button>
      </main>
    );
  }

  return (
    <main className="container registration-page">
      <section className="event-details">
        <h1>Event Registration</h1>
        <h2>{event.name}</h2>

        <p>
          <strong>Date:</strong> {formatDate(event.date)}
        </p>

        <p>
          <strong>Location:</strong>{" "}
          {event.venue || "Not specified"}
        </p>

        {event.description && <p>{event.description}</p>}

        <p>Enter your details to register for this event.</p>
      </section>

      <form className="event-form" onSubmit={handleSubmit}>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {success && (
          <div className="success-message" role="status">
            <p>{success}</p>
            <button
              type="button"
              onClick={() => navigate("/")}
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {!success && (
          <>
            <label htmlFor="registration-name">Full Name *</label>
            <input
              id="registration-name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <label htmlFor="registration-email">
              Email Address *
            </label>
            <input
              id="registration-email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="registration-phone">
              Phone Number *
            </label>
            <input
              id="registration-phone"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={handleChange}
              required
            />

            <div className="form-buttons">
              <button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Registration"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/")}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </form>
    </main>
  );
}

// ==================== NOT FOUND ====================
function NotFound() {
  return (
    <main className="container">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>

      <NavLink to="/" className="primary-button">
        Back to Dashboard
      </NavLink>
    </main>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<EventForm />} />
          <Route path="/edit/:id" element={<EventForm />} />
          <Route
            path="/register/:id"
            element={<RegistrationForm />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

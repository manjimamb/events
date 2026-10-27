
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = "http://localhost:5000/api/events";

export default function RegistrationForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventName, setEventName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetch(`${API}/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Event not found");
        return res.json();
      })
      .then(event => setEventName(event.name))
      .catch(() => alert("Could not load event details."));
  }, [id]);

  async function register(event) {
    event.preventDefault();

    try {
      const response = await fetch(`${API}/${id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, phone })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful!");
        navigate("/");
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch {
      alert("Could not connect to the backend.");
    }
  }

  return (
    <main className="form-page">
      <h1>Event Registration</h1>
      <p>Event: <strong>{eventName}</strong></p>

      <form onSubmit={register}>
        <label>Attendee Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <label>Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
        />

        <button type="submit">Register Now</button>
        <button
          type="button"
          className="cancel"
          onClick={() => navigate("/")}
        >
          Cancel
        </button>
      </form>
    </main>
  );
}

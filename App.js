
import React, { useState } from "react";

export default function App() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    fetch("https://docs.google.com/forms/d/e/1FAIpQLSdPoqhngYi6z8AUF9k_8QAEc2HIlyihWViA-1-5MxvLf6yYpg/formResponse", {
      method: "POST",
      mode: "no-cors",
      body: new URLSearchParams({
        "entry.1065878465": form.get("name"),
        "entry.949387187": form.get("email"),
        "entry.2029084220": form.get("countryCode"),
        "entry.992718981": form.get("phone"),
        "entry.546523940": form.get("location"),
        "entry.181614183": form.get("message"),
      }),
    }).then(() => setSubmitted(true));
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
      <div className="max-w-md mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Leverage Calculator Contact</h1>
        {submitted ? (
          <p className="text-green-600">Thank you! Your response has been recorded.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input name="name" placeholder="Name" className="w-full p-2 border rounded" required />
            <input name="email" placeholder="Email" className="w-full p-2 border rounded" required />
            <input name="countryCode" placeholder="Country Code" className="w-full p-2 border rounded" required />
            <input name="phone" placeholder="Phone" className="w-full p-2 border rounded" required />
            <input name="location" placeholder="City, Country" className="w-full p-2 border rounded" required />
            <textarea name="message" placeholder="Your message" className="w-full p-2 border rounded" required />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded">
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

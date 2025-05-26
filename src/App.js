import React, { useState, useEffect } from "react";

export default function App() {
  const [direction, setDirection] = useState("long");
  const [entryPrice, setEntryPrice] = useState(29000);
  const [slPercent, setSlPercent] = useState(2);
  const [slAmount, setSlAmount] = useState(1000);
  const [leverage, setLeverage] = useState(50);
  const [calculated, setCalculated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme) setDarkMode(theme === "dark");
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const isValid = entryPrice > 0 && slPercent > 0 && slAmount > 0 && leverage > 0;
  const conversionRate = 85;

  const qty = slAmount / (entryPrice * conversionRate * (slPercent / 100));
  const notional = qty * entryPrice;
  const margin = notional / leverage;
  const fee = notional * 0.0008 * 2;
  const breakEvenPercent = (fee / notional) * 100;

  const slPrice =
    direction === "long"
      ? entryPrice - (entryPrice * slPercent) / 100
      : entryPrice + (entryPrice * slPercent) / 100;

  const liqDrop = 50 / leverage;
  const liquidation =
    direction === "long"
      ? entryPrice - (entryPrice * liqDrop) / 100
      : entryPrice + (entryPrice * liqDrop) / 100;

  const slSafe = direction === "long" ? slPrice > liquidation : slPrice < liquidation;

  const targets = [1, 2, 3].map((r) => {
    const percent = slPercent * r;
    const price =
      direction === "long"
        ? entryPrice + (entryPrice * percent) / 100
        : entryPrice - (entryPrice * percent) / 100;
    return { r, percent, price };
  });

  const results = [
    { label: "Quantity", value: `${qty.toFixed(4)} BTC` },
    { label: "Notional", value: `$${notional.toFixed(2)} USDT` },
    { label: "Margin Required", value: `$${margin.toFixed(2)} USDT` },
    { label: "SL Price", value: `${slPrice.toFixed(2)} USDT` },
    {
      label: "Liquidation Price",
      value: `${liquidation.toFixed(2)} USDT — ${slSafe ? "SL is Safe ✅" : "SL below liquidation ❌"}`,
    },
    { label: "Break-even Move", value: `${breakEvenPercent.toFixed(2)}%` },
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setToast("Copied to clipboard!");
  };

  const copyAllResults = () => {
    const combined = results.map((r) => `${r.label}: ${r.value}`).join("\n");
    navigator.clipboard.writeText(combined);
    setToast("All results copied!");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    fetch(
      "https://docs.google.com/forms/d/e/1FAIpQLSdPoqhngYi6z8AUF9k_8QAEc2HIlyihWViA-1-5MxvLf6yYpg/formResponse",
      {
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
      }
    ).then(() => setToast("Your message has been recorded!"));
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"} min-h-screen p-6 font-sans transition-colors duration-300 relative`}>
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className={`max-w-xl mx-auto rounded-xl shadow-md p-6 transition-colors duration-300 ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Leverage Calculator</h2>
          <button onClick={() => setDarkMode(!darkMode)} className={`${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"} text-sm px-3 py-1 border rounded`}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium">Direction</span>
            <select className="w-full mt-1 p-2 border rounded bg-transparent" value={direction} onChange={(e) => setDirection(e.target.value)}>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-medium">Entry Price (USDT)</span>
            <input className="w-full mt-1 p-2 border rounded bg-transparent" type="number" value={entryPrice} onChange={(e) => setEntryPrice(Number(e.target.value))} />
          </label>

          <label className="block">
            <span className="block text-sm font-medium">Stop Loss %</span>
            <input className="w-full mt-1 p-2 border rounded bg-transparent" type="number" value={slPercent} onChange={(e) => setSlPercent(Number(e.target.value))} />
          </label>

          <label className="block">
            <span className="block text-sm font-medium">SL Amount (₹)</span>
            <input className="w-full mt-1 p-2 border rounded bg-transparent" type="number" value={slAmount} onChange={(e) =>	setSlAmount(Number(e.target.value))} />
          </label>

          <label className="block">
            <span className="block text-sm font-medium">Leverage</span>
            <select className="w-full	mt-1 p-2	border rounded	bg-transparent" value={leverage} onChange={(e) => setLeverage(Number(e.target.value))}>
              {[...Array(21)].map((_, i) => i * 50).filter(v => v > 0).map(val => (
                <option key={val} value={val}>{val}x</option>
              ))}
            </select>
          </label>

          <button onClick={() => setCalculated(true)} disabled={!isValid} className="w-full	mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50">
            Calculate
          </button>
        </div>

        {calculated && isValid && (
          <div className={`mt-6 p-4 rounded border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}`}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Results</h3>
              <button onClick={copyAllResults} className="text-xs text-blue-400 hover:text-blue-600">Copy All</button>
            </div>
            {results.map(r => (
              <div key={r.label} className="flex justify-between items-center">
                <p><strong>{r.label}:</strong> {r.value}</p>
                <button onClick={() =>	copyToClipboard(r.value)} className="text-xs text-blue-400 hover:text-blue-600">Copy</button>
              </div>
            ))}
            <div className="mt-2">
              <p className="font-semibold mb-1">Target Prices:</p>
              <ul className="list-disc list-inside">
                {targets.map(t => (
                  <li key={t.r}>{t.r}:1 → {t.price.toFixed(2)} USDT ({t.percent.toFixed(2)}%)</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <footer className="text-xs text-center text-gray-400 mt-10">
        Built with 🤍 by <a ...>Sultan</a>
        <div className="mt-2">
          <button onClick={() => setShowContactForm(!showContactForm)} ...>
            {showContactForm ? "Hide Contact Form" : "Contact / Collaborate"}
          </button>
        </div>
      </footer>

      {showContactForm && (
        <div ...>
          <h3 ...>Reach Out / Collaborate</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input name="name" placeholder="Your Name" ... required />
            <input name="email" placeholder="Your Email" ... required />
            <input name="countryCode" placeholder="Country Code (e.g. +91)" ... required />
            <input name="phone" placeholder="Contact Number" ... required />
            <input name="location" placeholder="City, Country" ... required />
            <textarea name="message" rows={3} placeholder="Your Message" ... required></textarea>
            <button type="submit" ...>Submit</button>
          </form>
        </div>
      )}

      <div className="mt-2 text-center text-[10px] text-gray-400 px-4">
        Disclaimer: ...
      </div>
    </div>
  );
}

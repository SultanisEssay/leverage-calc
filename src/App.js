import React, { useState, useEffect } from "react";

export default function App() {
  const [direction, setDirection] = useState("long");
  const [entryPrice, setEntryPrice] = useState("");
  const [slPercent, setSlPercent] = useState("");
  const [slAmount, setSlAmount] = useState("");
  const [leverage, setLeverage] = useState("");
  const [selectedRR, setSelectedRR] = useState(1);
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

  const isValid = [entryPrice, slPercent, slAmount, leverage].every(val => val !== "" && !isNaN(val) && Number(val) > 0);
  const conversionRate = 85;

  const qty = isValid ? slAmount / (entryPrice * conversionRate * (slPercent / 100)) : 0;
  const notional = isValid ? qty * entryPrice : 0;
  const margin = isValid ? notional / leverage : 0;
  const fee = isValid ? notional * 0.0008 * 2 : 0;
  const breakEvenPercent = isValid ? (fee / notional) * 100 : 0;

  const slPrice = isValid ? (
    direction === "long"
      ? entryPrice - (entryPrice * slPercent) / 100
      : entryPrice + (entryPrice * slPercent) / 100
  ) : 0;

  const liqDrop = isValid ? 50 / leverage : 0;
  const liquidation = isValid ? (
    direction === "long"
      ? entryPrice - (entryPrice * liqDrop) / 100
      : entryPrice + (entryPrice * liqDrop) / 100
  ) : 0;

  const slSafe = isValid ? (direction === "long" ? slPrice > liquidation : slPrice < liquidation) : false;

  const rrPercent = isValid ? slPercent * selectedRR : 0;
  const rrTargetPrice = isValid ? (
    direction === "long"
      ? entryPrice + (entryPrice * rrPercent) / 100
      : entryPrice - (entryPrice * rrPercent) / 100
  ) : 0;

  const rrGrossProfit = isValid ? (rrTargetPrice - entryPrice) * qty * (direction === "long" ? 1 : -1) : 0;
  const rrNetProfit = rrGrossProfit - fee;
  const netLossUSDT = isValid ? slAmount / conversionRate + fee : 0;
  const netLossINR = isValid ? slAmount + fee * conversionRate : 0;

  const inputClass = `w-full p-2 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`;

  const results = isValid ? [
    { label: "Margin Required", value: `$${margin.toFixed(2)} USDT / ₹${(margin * conversionRate).toLocaleString()}`, color: "text-purple-500" },
    { label: `💱 Using INR/USDT Rate`, value: `₹${conversionRate} per USDT`, color: "text-gray-500" },
    { label: "Quantity", value: `${qty.toFixed(4)} BTC` },
    { label: "Notional", value: `$${notional.toFixed(2)} USDT` },
    { label: "SL Price", value: `${slPrice.toFixed(2)} USDT` },
    {
      label: "Liquidation Price",
      value: `${liquidation.toFixed(2)} USDT — ${slSafe ? "SL is Safe ✅" : "❌ SL below liquidation"}`,
      color: slSafe ? "text-green-500" : "text-red-500",
    },
    { label: "Break-even Move", value: `${breakEvenPercent.toFixed(2)}%`, color: "text-blue-500" },
    { label: `📈 Net Profit at 1:${selectedRR} R:R (after fees)`, value: `$${rrNetProfit.toFixed(2)} / ₹${(rrNetProfit * conversionRate).toLocaleString("en-IN")}`, color: rrNetProfit >= 0 ? "text-green-500" : "text-red-500" },
    { label: `🎯 Target Price at 1:${selectedRR}`, value: `${rrTargetPrice.toFixed(2)} USDT (${rrPercent.toFixed(2)}%)`, color: "text-blue-500" },
    { label: `📉 Net Loss (after fees)`, value: `$${netLossUSDT.toFixed(2)} / ₹${netLossINR.toLocaleString("en-IN")}`, color: "text-orange-500" },
  ] : [];

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen p-6 transition-colors duration-300`}>
      {toast && (
        <div className={`${darkMode ? "bg-green-700" : "bg-green-600"} fixed top-4 left-1/2 transform -translate-x-1/2 text-white px-4 py-2 rounded shadow-lg z-50`}>
          {toast}
        </div>
      )}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Crypto R:R Calculator</h1>
          <button onClick={() => setDarkMode(!darkMode)}>{darkMode ? "☀️" : "🌙"}</button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <label>
            Direction
            <select value={direction} onChange={(e) => setDirection(e.target.value)} className={inputClass}>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </label>
          <label>
            Entry Price (USDT)
            <input type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="e.g. 28000" className={inputClass} />
          </label>
          <label>
            Stop Loss %
            <input type="number" value={slPercent} onChange={(e) => setSlPercent(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="e.g. 2" className={inputClass} />
          </label>
          <label>
            SL Amount (INR)
            <input type="text" value={slAmount.toLocaleString("en-IN")} onChange={(e) => { const raw = e.target.value.replace(/,/g, ""); setSlAmount(raw === "" ? "" : Number(raw)); }} placeholder="e.g. 1000" className={inputClass} />
          </label>
          <label>
            Leverage
            <select value={leverage} onChange={(e) => setLeverage(Number(e.target.value))} className={inputClass}>
              <option value="" disabled hidden>Select Leverage</option>
              {[...Array(21)].map((_, i) => i * 50).filter(v => v > 0).map((val) => (
                <option key={val} value={val}>{val}x</option>
              ))}
            </select>
          </label>
          <label>
            Risk-Reward Ratio
            <select value={selectedRR} onChange={(e) => setSelectedRR(Number(e.target.value))} className={inputClass}>
              {[...Array(50)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{`1:${i + 1}`}</option>
              ))}
            </select>
          </label>
        </div>
        <button onClick={() => setCalculated(true)} disabled={!isValid} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50">
          Calculate
        </button>

        {calculated && isValid && (
          <div className={`${darkMode ? "bg-gray-800 text-white border-gray-600" : "bg-gray-100 text-black border-gray-300"} mt-6 p-4 border rounded`}>
            <h2 className="text-lg font-bold mb-2">Results</h2>
            <ul className="space-y-2">
              {results.map((r) => (
                <li key={r.label} className={`flex justify-between border-b pb-1 ${r.color || ''}`}>
                  <span>{r.label}</span>
                  <span>{r.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <footer className="text-xs text-center text-gray-400 mt-10">
          <p>
            Built with 🤍 by <a href="https://www.instagram.com/_imsultan?igsh=Y2hnYzJ5N2VuNTdj&utm_source=qr" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">Sultan</a>
          </p>
          <div className="mt-2">
            <button onClick={() => setShowContactForm(!showContactForm)} className="text-blue-500 underline hover:text-blue-700 text-sm">
              {showContactForm ? "Hide Contact Form" : "Contact / Collaborate"}
            </button>
          </div>
        </footer>

        {showContactForm && (
          <div className={`mt-6 max-w-xl mx-auto p-4 rounded shadow transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}>
            <h3 className="text-lg font-semibold text-center mb-2">Reach Out / Collaborate</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.target);
              fetch("https://script.google.com/macros/s/AKfycbzVi30fB1_2J5k3sqtTO9CmFRzjvQBbLhJ78_5S9zsunhEWE45i6Ls9Q880uxFvnNUg/exec", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: form.get("name"),
                  email: form.get("email"),
                  countryCode: form.get("countryCode"),
                  phone: form.get("phone"),
                  location: form.get("location"),
                  message: form.get("message")
                })
              }).then(() => {
                setToast("Your message has been recorded!");
                e.target.reset();
              });
            }} className="space-y-3">
              <input name="name" placeholder="Your Name" className={inputClass} type="text" autoComplete="off" required />
              <input name="email" placeholder="Your Email" className={inputClass} type="email" autoComplete="off" required />
              <input name="countryCode" placeholder="Country Code (e.g. +91)" className={inputClass} required />
              <input name="phone" placeholder="Contact Number" className={inputClass} type="tel" required />
              <input name="location" placeholder="City, Country" className={inputClass} required />
              <textarea name="message" rows={3} placeholder="Your Message" className={inputClass} required></textarea>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">Submit</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

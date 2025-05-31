import React, { useState, useEffect } from "react";

export default function App() {
  const [direction, setDirection] = useState("long");
  const [entryPrice, setEntryPrice] = useState("");
  const [slPercent, setSlPercent] = useState("");
  const [slAmount, setSlAmount] = useState("");
  const [leverage, setLeverage] = useState("");
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

  const targets = isValid ? [1, 2, 3].map((r) => {
    const percent = slPercent * r;
    const price = direction === "long"
      ? entryPrice + (entryPrice * percent) / 100
      : entryPrice - (entryPrice * percent) / 100;
    const profitUSDT = (price - entryPrice) * qty * (direction === "long" ? 1 : -1);
    const profitINR = profitUSDT * conversionRate;
    return { r, percent, price, profitUSDT, profitINR };
  }) : [];

  const results = [
    
    { label: "Margin Required", value: `$${margin.toFixed(2)} USDT / ₹${(margin * conversionRate).toLocaleString()} INR`, color: "text-purple-500" },
    { label: `💱 Using INR/USDT Rate`, value: `₹${conversionRate} per USDT`, color: "text-gray-500" },
    { label: "Potential Loss (SL + Fees)", value: `$${(fee + (slAmount / conversionRate)).toFixed(2)} USDT / ₹${(fee * conversionRate + Number(slAmount)).toLocaleString()} INR`, color: "text-orange-500" },
    { label: "Potential Loss (Maker+Maker)", value: `$${(slAmount / conversionRate + notional * 0.0002 * 2).toFixed(2)} USDT / ₹${((slAmount / conversionRate + notional * 0.0002 * 2) * conversionRate).toLocaleString()} INR`, color: "text-yellow-600" },
    { label: "Potential Loss (Taker+Maker)", value: `$${(slAmount / conversionRate + notional * (0.0004 + 0.0002)).toFixed(2)} USDT / ₹${((slAmount / conversionRate + notional * (0.0004 + 0.0002)) * conversionRate).toLocaleString()} INR`, color: "text-yellow-600" },
    { label: "Potential Loss (Taker+Taker)", value: `$${(slAmount / conversionRate + notional * 0.0004 * 2).toFixed(2)} USDT / ₹${((slAmount / conversionRate + notional * 0.0004 * 2) * conversionRate).toLocaleString()} INR`, color: "text-yellow-600" },
    { label: "Quantity", value: `${qty.toFixed(4)} BTC` },
    { label: "Notional", value: `$${notional.toFixed(2)} USDT` },
    
    { label: "SL Price", value: `${slPrice.toFixed(2)} USDT` },
    {
      label: "Liquidation Price",
      value: `${liquidation.toFixed(2)} USDT — ${slSafe ? "SL is Safe ✅" : "❌ SL below liquidation"}`,
      color: slSafe ? "text-green-500" : "text-red-500",
    },
    { label: "Break-even Move", value: `${breakEvenPercent.toFixed(2)}%`, color: "text-blue-500" },
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
    
    fetch("https://script.google.com/macros/s/AKfycbzVi30fB1_2J5k3sqtTO9CmFRzjvQBbLhJ78_5S9zsunhEWE45i6Ls9Q880uxFvnNUg/exec", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
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
  e.target.reset(); // Optional: clear the form
});
    
  const inputClass = `w-full p-2 border rounded ${darkMode ? "bg-transparent text-white" : "bg-white text-black"}`;

  return (
    <div className={`${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"} min-h-screen p-6 font-sans transition-colors duration-300 relative`}>
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className={`max-w-3xl mx-auto rounded-2xl shadow-lg p-10 transition-all duration-300 space-y-6 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}`} style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">Position Size & Risk Calculator for Crypto Traders</h2>
            <p className="text-sm text-gray-500 mt-1">Enter your SL %, capital risk, and leverage to calculate ideal position size, margin needed, liquidation safety, and target profits.</p>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className={`text-sm px-3 py-1 border rounded transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        

        <div className="grid md:grid-cols-2 gap-6 mt-8">
  <label className="block">
    <span className="block text-sm font-medium">Direction
      <span className="ml-1 text-gray-400 cursor-help" title="Whether you're buying (long) or selling (short) the asset.">❔</span>
    </span>
    <select className={inputClass} value={direction} onChange={(e) => setDirection(e.target.value)}>
      <option value="long">Long</option>
      <option value="short">Short</option>
    </select>
  </label>

  <label className="block">
    <span className="block text-sm font-medium">Entry Price (USDT)
      <span className="ml-1 text-gray-400 cursor-help" title="The price at which you plan to enter the trade.">❔</span>
    </span>
    <input className={inputClass} type="number" placeholder="Enter price" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value !== "" ? Number(e.target.value) : "")} />
  </label>

  <label className="block">
    <span className="block text-sm font-medium">Stop Loss %
      <span className="ml-1 text-gray-400 cursor-help" title="How much % you're willing to risk on the trade.">❔</span>
    </span>
    <input className={inputClass} type="number" placeholder="Enter stop loss %" value={slPercent} onChange={(e) => setSlPercent(e.target.value !== "" ? Number(e.target.value) : "")} />
  </label>

  <label className="block">
    <span className="block text-sm font-medium">SL Amount (₹)
      <span className="ml-1 text-gray-400 cursor-help" title="Your total loss in INR if SL hits.">❔</span>
    </span>
    <input className={inputClass} type="text" placeholder="Enter SL amount (₹)" value={slAmount.toLocaleString("en-IN")} onChange={(e) => { const raw = e.target.value.replace(/,/g, ""); setSlAmount(raw === "" ? "" : Number(raw)); }} />
  </label>

  <label className="block">
    <span className="block text-sm font-medium">Leverage
      <span className="ml-1 text-gray-400 cursor-help" title="Leverage multiplies your position size but increases risk.">❔</span>
    </span>
    <select className={inputClass} value={leverage} onChange={(e) => setLeverage(e.target.value !== "" ? Number(e.target.value) : "")}>
      <option value="" disabled hidden>Select Leverage</option>
      {[...Array(21)].map((_, i) => i * 50).filter((v) => v > 0).map((val) => (
        <option key={val} value={val}>{val}x</option>
      ))}
    </select>
  </label>

  <button onClick={() => setCalculated(true)} disabled={!isValid} className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50">
    Calculate
  </button>
</div>

        {/* Results Display */}
        {calculated && isValid && (
          <div className={`mt-10 p-6 rounded-2xl border text-base shadow-md tracking-wide ${darkMode ? "bg-gray-800 border-gray-600" : "bg-gray-50 border-gray-300"}`}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Results</h3>
              <button onClick={copyAllResults} className="text-xs text-blue-400 hover:text-blue-600">Copy All</button>
            </div>
            {results.map((r) => (
              <div key={r.label} className={`flex justify-between items-center py-3 border-b border-dashed border-gray-500/20 text-sm ${r.color || ''}`}>
                <p><strong>{r.label}:</strong> {r.value}</p>
                <button onClick={() => copyToClipboard(r.value)} className="text-xs text-blue-400 hover:text-blue-600">Copy</button>
              </div>
            ))}
            <div className="mt-2">
              <p className="font-semibold mb-1">Target Prices:</p>
              <ul className="list-disc list-inside">
  {targets.map((t) => (
    <li key={t.r}>
  {t.r}:1 → {t.price.toFixed(2)} USDT ({t.percent.toFixed(2)}%) — Profit: ${t.profitUSDT.toFixed(2)} / ₹{t.profitINR.toLocaleString()}
</li>
  ))}
</ul>


            </div>
          </div>
        )}

        {/* Footer */}
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

        {/* Contact Form */}
        {showContactForm && (
          <div className={`mt-6 max-w-xl mx-auto p-4 rounded shadow transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}>
            <h3 className="text-lg font-semibold text-center mb-2">Reach Out / Collaborate</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
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

        {/* Liquidation Info */}
        

        {/* Disclaimer */}
        <div className="mt-8 text-center text-[11px] text-gray-400 px-4 leading-relaxed">
          Disclaimer: This calculator is intended for educational and illustrative purposes only. It does not constitute financial advice. Trading involves risk and may not be suitable for all investors. You are solely responsible for your own trading decisions.<br />
          By using this tool, you acknowledge that you understand and accept these risks. The creator of this application holds no liability for any losses incurred through use of this tool.
        </div>
      </div>
    </div>
  );
}

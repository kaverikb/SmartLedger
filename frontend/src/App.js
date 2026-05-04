import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import "./App.css";

const COLORS = [
  "#FFC107", "#FFD54F", "#FFCA28",
  "#FBC02D", "#F9A825", "#FF9800",
  "#FB8C00", "#F57C00"
];

function App() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const s = await fetch("http://127.0.0.1:8000/summary").then(r => r.json());
        setSummary(s);

        const t = await fetch("http://127.0.0.1:8000/transactions").then(r => r.json());
        setTransactions(t);

        // Extract unique months from transactions
        if (t && t.length > 0) {
          const months = [...new Set(t.map(tx => tx.datetime?.split("T")[0]?.slice(0, 7)))].sort().reverse();
          if (months.length > 0) {
            setSelectedMonth(months[0]);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, []);

  // Update monthly breakdown when selectedMonth changes
  useEffect(() => {
    if (selectedMonth && transactions.length > 0) {
      const monthTransactions = transactions.filter(tx =>
        tx.datetime?.split("T")[0]?.startsWith(selectedMonth)
      );

      const breakdown = {};
      monthTransactions.forEach(tx => {
        const category = tx.llm_category || "Unknown";
        breakdown[category] = (breakdown[category] || 0) + parseFloat(tx.Amount || 0);
      });

      const data = Object.entries(breakdown).map(([k, v]) => ({
        category: k,
        amount: v
      }));

      setMonthlyBreakdown(data);
    }
  }, [selectedMonth, transactions]);

  const askQuestion = async () => {
    if (!query.trim() || loading) return;

    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch(`http://127.0.0.1:8000/ask?query=${query}`);
      const data = await res.json();
      setAnswer(data.answer || "No response received");
    } catch (err) {
      console.error("Ask error:", err);
      setAnswer("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const categoryData =
    summary?.category_breakdown
      ? Object.entries(summary.category_breakdown).map(([k, v]) => ({
          category: k,
          amount: v
        }))
      : [];

  const monthlyData =
    summary?.monthly_trend
      ? Object.entries(summary.monthly_trend).map(([k, v]) => ({
          month: k,
          amount: v
        }))
      : [];

  // Get unique months for dropdown
  const months = transactions.length > 0
    ? [...new Set(transactions.map(tx => tx.datetime?.split("T")[0]?.slice(0, 7)))].sort().reverse()
    : [];

  // Calculate total for selected month
  const monthTotal = monthlyBreakdown.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="header">
        <div className="header-content">
          <h1 className="logo">💰 Smart Ledger</h1>
          <p className="tagline">Intelligent Financial Dashboard</p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {!summary ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Syncing your data...</p>
          </div>
        ) : (
          <>
            {/* HERO CARDS */}
            <section className="hero-section">
              <div className="stat-card">
                <span className="stat-label">Total Spent</span>
                <h2 className="stat-value">₹{summary.total_spent.toFixed(2)}</h2>
                <div className="accent-line"></div>
              </div>

              <div className="stat-card">
                <span className="stat-label">Top Category</span>
                <h2 className="stat-value">{summary.top_category}</h2>
                <div className="accent-line"></div>
              </div>
            </section>

            {/* CHARTS SECTION */}
            <section className="charts-section">
              {/* BAR CHART - MONTHLY DISTRIBUTION */}
              <div className="chart-card">
                <h3 className="chart-title">📊 Monthly Distribution</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                    <XAxis 
                      dataKey="month" 
                      stroke="#666" 
                      style={{ fontSize: "12px" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#666" style={{ fontSize: "12px" }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#1a1a1a", 
                        border: "1px solid #FFC107",
                        borderRadius: "8px"
                      }}
                      labelStyle={{ color: "#FFC107" }}
                    />
                    <Bar dataKey="amount" fill="#FFC107" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* PIE CHART - CATEGORY DISTRIBUTION */}
              <div className="chart-card">
                <h3 className="chart-title">🥧 Spending Distribution</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#1a1a1a", 
                        border: "1px solid #FFC107",
                        borderRadius: "8px"
                      }}
                      labelStyle={{ color: "#FFC107" }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: "20px", fontSize: "13px" }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* MONTHLY DONUT CHART WITH DROPDOWN */}
            <section className="donut-section">
              <div className="chart-card">
                <div className="donut-header">
                  <h3 className="chart-title">🍩 Monthly Spending Breakdown</h3>
                  <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="month-dropdown"
                  >
                    {months.map(month => (
                      <option key={month} value={month}>
                        {new Date(month + "-01").toLocaleDateString("en-US", { 
                          year: "numeric", 
                          month: "long" 
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                {monthlyBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={monthlyBreakdown}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      >
                        {monthlyBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#1a1a1a", 
                          border: "1px solid #FFC107",
                          borderRadius: "8px"
                        }}
                        labelStyle={{ color: "#FFC107" }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: "20px", fontSize: "13px" }}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data">
                    <p>No data available for this month</p>
                  </div>
                )}
              </div>
            </section>

            {/* TRANSACTIONS TABLE */}
            <section className="transactions-section">
              <div className="section-header">
                <h3 className="section-title">💳 Recent Transactions</h3>
                <span className="tx-count">{transactions.length} total</span>
              </div>

              <div className="table-wrapper">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Category</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 100).map((t, i) => (
                      <tr key={i} className={t.anomaly ? "row-anomaly" : ""}>
                        <td className="td-date">{t.datetime?.split("T")[0]}</td>
                        <td className="td-desc">{t.clean_desc}</td>
                        <td className="td-amount">₹{t.Amount}</td>
                        <td className="td-category">
                          <span className="category-badge">{t.llm_category}</span>
                        </td>
                        <td className="td-status">{t.anomaly ? "🚨" : "✅"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* AI CHAT SECTION */}
            <section className="chat-section">
              <div className="chat-card">
                <h3 className="chart-title">🤖 Ask Your Data</h3>
                <p className="chat-subtext">Get instant insights from your spending</p>

                <div className="input-group">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !loading) {
                        askQuestion();
                      }
                    }}
                    placeholder="What do you want to know about your spending?"
                    className="chat-input"
                  />
                  <button 
                    onClick={askQuestion} 
                    className="chat-button"
                    disabled={loading}
                  >
                    {loading ? "..." : "Ask"}
                  </button>
                </div>

                {loading && (
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}

                {!loading && answer && (
                  <div className="answer-box">
                    <p className="answer-text">{answer}</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <p>Smart Ledger © 2024 | Financial Intelligence at your fingertips</p>
      </footer>
    </div>
  );
}

export default App;
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createExpense, getExpenses, deleteExpense } from "../services/api";
import API, { updateSalary, getProfile } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [editId, setEditId] = useState(null);

  const [salary, setSalary] = useState(0);
  const [salaryInput, setSalaryInput] = useState("");
  const [salarySet, setSalarySet] = useState(false);

  const [animatedSalary, setAnimatedSalary] = useState(0);
  const [animatedExpenses, setAnimatedExpenses] = useState(0);
  const [animatedLeftover, setAnimatedLeftover] = useState(0);

  const formRef = useRef(null);

  const [currentMonthIndex, setCurrentMonthIndex] = useState(
    new Date().getMonth(),
  );

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Rent",
    "Investment",
  ];

  const fetchExpenses = async () => {
    const response = await getExpenses();
    const sorted = response.data.sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
    setExpenses(sorted);
  };

  const fetchProfile = async () => {
    const response = await getProfile();
    if (response.data.salary && response.data.salary > 0) {
      setSalary(response.data.salary);
      setSalarySet(true);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchProfile();
  }, []);

  const animateValue = (target, setter) => {
    let start = 0;
    const duration = 800;
    const increment = target / (duration / 16);

    const counter = setInterval(() => {
      start += increment;
      if (start >= target) {
        setter(target);
        clearInterval(counter);
      } else {
        setter(Math.floor(start));
      }
    }, 16);
  };

  const filteredExpenses = expenses.filter((e) => {
    const expenseMonth = new Date(e.date).getMonth();
    return expenseMonth === currentMonthIndex;
  });

  const totalExpenses = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0,
  );

  const leftover = salary - totalExpenses;

  useEffect(() => {
    if (salarySet) {
      animateValue(salary, setAnimatedSalary);
      animateValue(totalExpenses, setAnimatedExpenses);
      animateValue(leftover, setAnimatedLeftover);
    }
  }, [salary, totalExpenses]);

  const handleSalarySubmit = async () => {
    if (!salaryInput || salaryInput <= 0) return;
    await updateSalary({ salary: salaryInput });
    setSalary(Number(salaryInput));
    setSalarySet(true);
  };

  const handleSubmit = async () => {
    if (!salarySet) return;

    if (editId) {
      await API.put(`/expenses/${editId}`, {
        title,
        amount,
        category,
        date,
      });
      setEditId(null);
    } else {
      await createExpense({ title, amount, category, date });
    }

    setTitle("");
    setAmount("");
    setCategory("Food");
    setDate("");
    fetchExpenses();
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev + 1) % 12);
  };

  const handleEdit = (expense) => {
    setTitle(expense.title);
    setAmount(expense.amount);
    setCategory(expense.category);
    setDate(expense.date.split("T")[0]);
    setEditId(expense._id);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    await deleteExpense(id);
    fetchExpenses();
  };

  const groupedExpenses = filteredExpenses.reduce((acc, e) => {
    if (!acc[e.category]) acc[e.category] = [];
    acc[e.category].push(e);
    return acc;
  }, {});

  const handleDownloadCSV = () => {
    const filtered = expenses.filter((e) => {
      const expenseMonth = new Date(e.date).getMonth();
      return expenseMonth === currentMonthIndex;
    });

    if (filtered.length === 0) {
      alert("No data available for this month.");
      return;
    }

    const sorted = filtered.sort((a, b) =>
      a.category.localeCompare(b.category),
    );

    const headers = ["Month", "Date", "Title", "Category", "Amount (INR)"];

    const rows = sorted.map((e) => [
      months[currentMonthIndex],
      `="${new Date(e.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}"`,
      e.title,
      e.category,
      e.amount,
    ]);

    const csvContent =
      "\uFEFF" + // UTF-8 BOM for Excel ₹ fix
      [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Expense_Report_${months[currentMonthIndex]}.csv`,
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <div className="bg-slate-900 border-b border-slate-700 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold text-white">Smart Expense Tracker</h1>
        <div className="flex items-center gap-6">
          {/* Previous Month */}
          <button
            onClick={() => setCurrentMonthIndex((prev) => (prev - 1 + 12) % 12)}
            className="bg-blue-500 hover:bg-blue-600 transition duration-300 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Previous Month
          </button>

          {/* Current Month Display */}
          <span className="text-lg font-bold text-white">
            {months[currentMonthIndex]}
          </span>

          {/* Next Month */}
          <button
            onClick={handleNextMonth}
            className="bg-blue-500 hover:bg-blue-600 transition duration-300 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Next Month
          </button>

          {/* Analytics */}
          <button
            onClick={() => navigate(`/analytics?month=${currentMonthIndex}`)}
            className="bg-purple-500 hover:bg-purple-600 transition duration-300 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Analytics
          </button>

          {/* {Download CSV} */}
          <button
            onClick={handleDownloadCSV}
            className="bg-emerald-500 hover:bg-emerald-600 transition duration-300 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Download CSV
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="bg-red-500 hover:bg-red-600 transition duration-300 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {!salarySet && (
          <div className="bg-slate-800 p-8 rounded-xl shadow-lg mb-10">
            <h2 className="text-2xl font-bold mb-4">
              Enter Your Monthly Salary
            </h2>

            <input
              type="number"
              placeholder="Monthly Salary"
              className="p-3 rounded-lg bg-slate-700 mr-4"
              value={salaryInput}
              onChange={(e) => setSalaryInput(e.target.value)}
            />

            <button
              onClick={handleSalarySubmit}
              className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg"
            >
              Continue
            </button>
          </div>
        )}

        {salarySet && (
          <>
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                <p className="text-gray-400">Salary</p>
                <h2 className="text-2xl font-bold">₹{animatedSalary}</h2>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                <p className="text-gray-400">Total Expenses</p>
                <h2 className="text-2xl font-bold text-red-400 mb-3">
                  ₹{animatedExpenses}
                </h2>

                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        (totalExpenses / salary) * 100,
                        100,
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                <p className="text-gray-400">Leftover</p>
                <h2
                  className={`text-2xl font-bold ${
                    leftover >= 0 ? "text-green-400" : "text-red-500"
                  }`}
                >
                  ₹{animatedLeftover}
                </h2>
              </div>
            </div>

            {/* Add / Update Form */}
            <div
              ref={formRef}
              className="bg-slate-800 p-6 rounded-xl shadow-lg mb-10"
            >
              <h3 className="text-xl font-semibold mb-4">
                {editId ? "Update Expense" : "Add Expense"}
              </h3>

              <div className="grid md:grid-cols-4 gap-4">
                <input
                  className="p-3 rounded-lg bg-slate-700"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <input
                  className="p-3 rounded-lg bg-slate-700"
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />

                <select
                  className="p-3 rounded-lg bg-slate-700"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>

                <input
                  className="p-3 rounded-lg bg-slate-700"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <button
                onClick={handleSubmit}
                className="mt-5 bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-semibold"
              >
                {editId ? "Update" : "Add"}
              </button>
            </div>

            {/* Category Containers */}
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(groupedExpenses).map(([cat, items]) => {
                const total = items.reduce(
                  (sum, e) => sum + Number(e.amount),
                  0,
                );

                return (
                  <div
                    key={cat}
                    className="bg-slate-800 p-6 rounded-xl shadow-lg"
                  >
                    <h3 className="text-lg font-semibold mb-3">
                      {cat} — ₹{total}
                    </h3>

                    {items.map((e) => (
                      <div
                        key={e._id}
                        className="flex justify-between items-center bg-slate-700 p-2 rounded mb-2"
                      >
                        <span>
                          {e.title} — ₹{e.amount}
                        </span>

                        <div className="space-x-2">
                          <button
                            onClick={() => handleEdit(e)}
                            className="text-yellow-400"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(e._id)}
                            className="text-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

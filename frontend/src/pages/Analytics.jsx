import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getProfile } from "../services/api";
import API from "../services/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

function Analytics() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const monthIndex = Number(queryParams.get("month"));

  const [expenses, setExpenses] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState({});

  const [salary,setSalary]=useState(0);

  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7f50",
    "#00c49f",
    "#ffbb28",
    "#a28cff",
  ];

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Fetch all expenses
  const fetchExpenses = async () => {
    try {
      const response = await API.get("/expenses");
      setExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses");
    }
  };

  useEffect(() => {
    const fetchData=async()=>{
      await fetchExpenses();
      const res=await getProfile();
      setSalary(res.data.salary);
    };
    fetchData();
  }, []);

  // Month filtering for Pie Chart
  useEffect(() => {
    const filtered = expenses.filter((e) => {
      const expenseMonth = new Date(e.date).getMonth();
      return expenseMonth === monthIndex;
    });

    const totals = {};
    filtered.forEach((e) => {
      if (!totals[e.category]) totals[e.category] = 0;
      totals[e.category] += Number(e.amount);
    });

    setCategoryTotals(totals);
  }, [expenses, monthIndex]);

  // Pie data
  const totalAmount = Object.values(categoryTotals).reduce(
    (sum, val) => sum + val,
    0,
  );

  const pieData = Object.entries(categoryTotals).map(([category, value]) => ({
    name: category,
    value,
    percentage: totalAmount ? ((value / totalAmount) * 100).toFixed(1) : 0,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-600">
          <p>{data.name}</p>
          <p>₹{data.value}</p>
          <p>{data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  /* ---------- Annual Monthly Calculations ---------- */

  const monthlyTotals = Array(12).fill(0);

  expenses.forEach((e) => {
    const m = new Date(e.date).getMonth();
    monthlyTotals[m] += Number(e.amount);
  });

  const yearlyBarData = months.map((m, index) => ({
    month: m,
    expenses: monthlyTotals[index],
    leftMoney: salary - monthlyTotals[index],
  }));


  // ---- Cumulative Savings Calculation ----

  const cumulativeSavings = salary-monthlyTotals[monthIndex]

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navbar */}
      <div className="bg-slate-900 border-b border-slate-700 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        {/* Left Title */}
        <h1 className="text-xl font-bold">Analytics - {months[monthIndex]}</h1>

        {/* Middle Savings Display */}
        <div className="text-lg font-semibold text-green-400">
          Savings Till {months[monthIndex]} : ₹{cumulativeSavings}
        </div>

        {/* Right Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Dashboard
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="p-10 max-w-6xl mx-auto">
        {/* ---------- Pie Chart ---------- */}
        <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Expense Distribution
          </h2>

          {pieData.length === 0 ? (
            <p className="text-center text-gray-400">
              No expense data for this month.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={140}
                  label={({ percentage }) => `${percentage}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ---------- Bar Charts Below Pie ---------- */}
        <div className="mt-12 grid gap-10">
          {/* Bar Chart 1: Amount vs Left Money */}
          <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-6 text-center">
              Monthly Amount vs Left Money
            </h2>

            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={yearlyBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leftMoney" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart 2: Amount vs Expenses */}
          <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-6 text-center">
              Monthly Amount vs Expenses
            </h2>

            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={yearlyBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;

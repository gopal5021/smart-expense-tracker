import axios from "axios";

const API = axios.create({
  baseURL: "https://smartexpense-8b2f.onrender.com/api",
});

// Add token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});
export const getProfile = () => API.get("/auth/profile");

// Auth APIs
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);

// Expense APIs
export const createExpense = (data) => API.post("/expenses", data);
export const getExpenses = (month) =>
  API.get(`/expenses${month ? `?month=${month}` : ""}`);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);
export const updateSalary = (data) =>
  API.put("/auth/salary", data);

export default API;
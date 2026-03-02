const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
require("dotenv").config();

const app = express();

// Middleware
// app.use(cors());

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/analytics", analyticsRoutes);

// // Test Route
// app.get("/", (req, res) => {
//   res.send("SmartExpense API Running...");
// });                                              

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

const PORT = process.env.PORT || 5021;

// const path=require("path");
// app.use(express.static(path.join(__dirname,"../frontend/dist")));
// app.get("/",(req,resp)=>{
//   resp.sendFile(path.join(__dirname,"../frontend/dist/index.html"));
// });


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


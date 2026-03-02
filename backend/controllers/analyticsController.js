const Expense = require("../models/Expense");

exports.getSummary = async (req, res) => {
  try {
    // Get all expenses (no user filtering)
    const expenses = await Expense.find({user:req.user.id});

    // Total Expense
    const totalExpenses = expenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0
    );

    // Category Totals
    const categoryTotals = {};
    expenses.forEach((e) => {
      if (!categoryTotals[e.category]) {
        categoryTotals[e.category] = 0;
      }
      categoryTotals[e.category] += Number(e.amount);
    });

    // Monthly Totals
    const monthlyTotals = {};
    expenses.forEach((e) => {
      const month = new Date(e.date).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      if (!monthlyTotals[month]) {
        monthlyTotals[month] = 0;
      }
      monthlyTotals[month] += Number(e.amount);
    });

    res.json({
      totalExpenses,
      categoryTotals,
      monthlyTotals,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.exportData = async (req, res) => {
  try {
    const expenses = await Expense.find({user:req.user.id});

    const formatted = expenses.map((e) => ({
      date: e.date,
      title: e.title,
      category: e.category,
      amount: e.amount,
    }));

    res.json(formatted);

  } catch (error) {
    res.status(500).json({ message: "Export failed" });
  }
};
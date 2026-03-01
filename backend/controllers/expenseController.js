const Expense = require("../models/Expense");

// Create Expense
exports.createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, notes } = req.body;

    const expense = await Expense.create({
      userId: req.user.id,
      title,
      amount,
      category,
      date,
      notes,
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Expenses (with optional month filter)
exports.getExpenses = async (req, res) => {
  try {
    const { month } = req.query;

    let filter = { userId: req.user.id };

    if (month) {
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      filter.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Expense
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
  try {
    await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    res.status(200).json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

/**
 * CREATE Customer
 */
router.post("/", async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET All Customers
 */
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET Single Customer
 */
router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid ID" });
  }
});

/**
 * UPDATE Customer
 */
router.put("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Customer updated successfully",
      data: customer
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * DELETE Customer
 */
router.delete("/:id", async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: "Customer deleted successfully"
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

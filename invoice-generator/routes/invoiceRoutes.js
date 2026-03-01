const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");

/**
 * CREATE Invoice
 */
router.post("/", async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    await invoice.save();

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET All Invoices
 */
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("customer")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET Single Invoice
 */
router.get("/:id", async (req, res) => {
  try {
    let invoice;
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);

    if (isObjectId) {
      invoice = await Invoice.findById(req.params.id)
        .populate("customer")
        .populate("items.product");
    } else {
      invoice = await Invoice.findOne({ invoiceNumber: req.params.id })
        .populate("customer")
        .populate("items.product");
    }

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(400).json({ message: "Invalid ID format or error fetching" });
  }
});

/**
 * DELETE Invoice
 */
router.delete("/:id", async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: "Invoice deleted successfully"
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

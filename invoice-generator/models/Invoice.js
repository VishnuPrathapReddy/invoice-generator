const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },

    description: {
      type: String,
      required: true
    },

    hsnSac: {
      type: String
    },

    qty: {
      type: Number,
      required: true,
      min: 1
    },

    rate: {
      type: Number,
      required: true,
      min: 0
    },

    serviceCharge: {
      type: Number,
      default: 0
    },

    gstRate: {
      type: Number,
      required: true
    },

    gstAmount: {
      type: Number,
      required: true
    },

    total: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceType: {
      type: String,
      required: true,
      enum: ["Sale Invoice", "Purchase Invoice"]
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },

    invoiceDate: {
      type: Date,
      required: true
    },

    placeOfSupply: {
      type: String
    },

    paymentMode: {
      type: String,
      required: true,
      enum: ["Cash", "Card", "UPI", "Bank Transfer", "Credit"]
    },

    gstType: {
      type: String,
      required: true,
      enum: ["In State (CGST + SGST)", "Out of State (IGST)"]
    },

    priceType: {
      type: String,
      required: true,
      enum: ["Inclusive of Tax", "Exclusive of Tax"]
    },

    items: [invoiceItemSchema],

    subTotal: {
      type: Number,
      required: true
    },

    totalGST: {
      type: Number,
      required: true
    },

    grandTotal: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);

/*
sample doc
{
  "invoiceType": "Sale Invoice",
  "customer": "65bcf12d8f4c1a001234abcd",
  "invoiceNumber": "INV-6",
  "invoiceDate": "2026-02-03",
  "placeOfSupply": "Delhi",
  "paymentMode": "Cash",
  "gstType": "In State (CGST + SGST)",
  "priceType": "Exclusive of Tax",
  "items": [
    {
      "description": "Website Development",
      "hsnSac": "998314",
      "qty": 1,
      "rate": 25000,
      "serviceCharge": 0,
      "gstRate": 18,
      "gstAmount": 4500,
      "total": 29500
    }
  ],
  "subTotal": 25000,
  "totalGST": 4500,
  "grandTotal": 29500
}
*/

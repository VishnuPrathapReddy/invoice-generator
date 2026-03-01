const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    contactNumber: {
      type: String,
      required: true,
      trim: true
    },

    businessType: {
      type: String,
      required: true,
      enum: ["Individual", "Proprietor", "Partnership", "Company", "Other"],
      default: "Individual"
    },

    address: {
      type: String,
      required: true,
      trim: true
    },

    gstin: {
      type: String,
      trim: true,
      uppercase: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Customer", customerSchema);
/*
sample doc
{
  "name": "Rahul Sharma",
  "contactNumber": "9876543210",
  "businessType": "Individual",
  "address": "Bangalore, Karnataka",
  "gstin": "29ABCDE1234F1Z5"
}
*/

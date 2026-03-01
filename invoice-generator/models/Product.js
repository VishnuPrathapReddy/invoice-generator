const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    hsnSacCode: {
      type: String,
      trim: true
    },

    barcode: {
      type: String,
      trim: true
    },

    saleRate: {
      type: Number,
      required: true,
      min: 0
    },

    serviceCharge: {
      type: Number,
      default: 0,
      min: 0
    },

    gstRate: {
      type: Number,
      required: true,
      enum: [0, 5, 12, 18, 28] // common GST slabs
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Product", productSchema);

/*
sample doc
{
  "name": "Website Development",
  "description": "Full website design & development",
  "hsnSacCode": "998314",
  "barcode": "",
  "saleRate": 25000,
  "serviceCharge": 0,
  "gstRate": 18
}
*/

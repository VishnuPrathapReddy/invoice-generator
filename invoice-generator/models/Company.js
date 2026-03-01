const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    gstin: { type: String },
    address: { type: String },
    email: { type: String },
    phone: { type: String },
    bankName: { type: String },
    branchName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    upiId: { type: String },
    declaration: { type: String },
    logoUrl: { type: String },
    signatureUrl: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Company', companySchema);

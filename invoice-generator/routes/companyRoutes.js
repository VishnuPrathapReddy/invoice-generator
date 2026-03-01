const express = require("express");
const router = express.Router();
const Company = require("../models/Company");

/**
 * GET Company Details
 * Fetches the single existing company record. If it doesn't exist, returns null.
 */
router.get("/", async (req, res) => {
    try {
        const companyInfo = await Company.findOne();
        res.json({
            success: true,
            data: companyInfo
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * PUT/POST Company Details
 * Upserts the company record (creates if none exists, updates if one exists)
 */
router.put("/", async (req, res) => {
    try {
        // We only want ONE company profile per database for an invoice generator
        let companyInfo = await Company.findOne();

        if (companyInfo) {
            // Update existing
            companyInfo = await Company.findOneAndUpdate({}, req.body, { new: true });
        } else {
            // Create new
            companyInfo = new Company(req.body);
            await companyInfo.save();
        }

        res.json({
            success: true,
            message: "Company details saved successfully",
            data: companyInfo
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;

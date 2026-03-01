const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Product = require("../models/Product");

/**
 * GET Dashboard Data (KPIs and Recent Invoices)
 */
router.get("/", async (req, res) => {
    try {
        const allInvoices = await Invoice.find().populate("customer").sort({ invoiceDate: -1 });

        // Quick KPI Computations 
        // Since the system doesn't have an explicit payment status field yet, 
        // we'll use place holders or calculate based on date for demo purposes
        const totalInvoices = allInvoices.length;
        let totalOutstanding = 0;

        allInvoices.forEach(inv => {
            totalOutstanding += inv.grandTotal;
        });

        // Formatting for the frontend KPI tiles
        const kpis = [
            {
                title: 'Total Outstanding',
                amount: `₹ ${totalOutstanding.toLocaleString('en-IN')}`,
                subtitle: 'From all invoices',
                trend: 'Active',
                trendColor: 'text-green-600',
                trendBg: 'bg-green-50',
                icon: 'account_balance_wallet',
                iconBg: 'bg-primary/10',
                iconColor: 'text-primary'
            },
            {
                title: 'Total Invoices',
                amount: totalInvoices.toString(),
                subtitle: 'Generated to date',
                trend: 'Active',
                trendColor: 'text-green-600',
                trendBg: 'bg-green-50',
                icon: 'check_circle',
                iconBg: 'bg-green-100',
                iconColor: 'text-green-600'
            },
            {
                title: 'Customers',
                amount: (await Customer.countDocuments()).toString(),
                subtitle: 'Registered clients',
                trend: 'Active',
                trendColor: 'text-blue-600',
                trendBg: 'bg-blue-50',
                icon: 'group',
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600'
            },
            {
                title: 'Products',
                amount: (await Product.countDocuments()).toString(),
                subtitle: 'Available items',
                trend: 'Active',
                trendColor: 'text-purple-600',
                trendBg: 'bg-purple-50',
                icon: 'inventory_2',
                iconBg: 'bg-purple-100',
                iconColor: 'text-purple-600'
            }
        ];

        // Map recent invoices strictly to what `BillingService.Invoice` interface expects
        // export interface Invoice { id: string; client: Client; contact: string; date: string; amount: string; status: string; }
        const recentInvoices = allInvoices.slice(0, 5).map(inv => {
            return {
                id: inv.invoiceNumber,
                client: {
                    name: inv.customer ? inv.customer.name : 'Unknown Client',
                    initials: inv.customer && inv.customer.name ? inv.customer.name.substring(0, 2).toUpperCase() : 'NA',
                    logoBg: 'bg-primary/10',
                    logoColor: 'text-primary'
                },
                contact: inv.customer ? inv.customer.contactNumber : 'N/A',
                date: new Date(inv.invoiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                amount: `₹ ${inv.grandTotal.toLocaleString('en-IN')}`,
                status: 'Generated' // Assuming 'Generated' since no status field in DB
            };
        });

        res.json({
            success: true,
            data: {
                kpis,
                recentInvoices
            }
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

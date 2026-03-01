const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URI,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
const { protect } = require("./middleware/authMiddleware");

app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/users", require("./routes/user.routes"));
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const companyRoutes = require('./routes/companyRoutes');

app.use('/api/products', protect, productRoutes);
app.use('/api/customers', protect, customerRoutes);
app.use('/api/invoices', protect, invoiceRoutes);
app.use('/api/dashboard', protect, dashboardRoutes);
app.use('/api/company', protect, companyRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

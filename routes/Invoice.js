const mongoose = require("mongoose");

const invoiceSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicineDets',
    required: true
  },
  invoiceDate: {
    type: Date,
    default: Date.now
  },
  // Add other fields relevant to your invoice
});

module.exports = mongoose.model("Invoice", invoiceSchema);
const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  sex: {
    type: String,
    required: true,
  },
  healthID: {
    type: String,
    required: true,
  },
  consultationDate: {
    type: String,
    required: true,
  },
  chiefComplaints: {
    type: String,
    required: true,
  },
  associatedComplaints: {
    type: String,
  },
  pastIllness: {
    type: String,
  },
  labInvestigations: {
    type: String,
  },
  medicineName: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  consumption: {
    type: String,
    required: true,
  },
  signature: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

const MedicineModel = mongoose.model("MedicineDets", medicineSchema);

module.exports = MedicineModel;

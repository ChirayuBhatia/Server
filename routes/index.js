var express = require("express");
var router = express.Router();

var users = require("./users.js");
var localStrategy = require("passport-local");
const { route, post } = require("../app");
const passport = require("passport");
const mongoose = require("mongoose");
const MedicineModel = require("./MedicineDets.js");
const UserModel = require("./users.js");
const PDFDocument = require("pdfkit");
// const expressPDF = require("express-pdfkit");
// router.use(expressPDF());
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const InvoiceModel = require("./Invoice.js");
const axios = require("axios");

passport.use(new localStrategy(UserModel.authenticate()));

mongoose
  .connect("mongodb+srv://bhatiachirayu:abc123456@cluster0.kttx9ez.mongodb.net/?retryWrites=true&w=majority")
  .then(function (result) {
    console.log("connected to database");
  })
  .catch(function (err) {
    console.log(err);
  });

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/MedicineForm", function (req, res, next) {
  res.render("MedicineForm");
});

router.get("/Signup", function (req, res, next) {
  res.render("Signup");
});

router.post("/Signup", function (req, res, next) {
  var newUserData = {
    username: req.body.username,
    fullName: req.body.fullName,
  };

  UserModel.register(newUserData, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/MedicineForm");
    });
  });
});

router.get("/Login", function (req, res, next) {
  res.render("login");
});

router.post(
  "/Login",
  passport.authenticate("local", {
    successRedirect: "/MedicineForm",
    failureRedirect: "/Login",
  }),
  function (req, res) {}
);

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next()
  }
  else {
    res.redirect("/login");
  }
}

router.get("/logout", function(req, res){
  req.logOut(function(err){
    if(err) {return next(err)}
    else {
      res.redirect("/");
    }
  })
})

router.post("/Medicine",isLoggedIn , async function (req, res, next) {
  try {
    const allUsers = await UserModel.find();
    const allMedicine = await MedicineModel.find().populate("user");

    const newMedicine = new MedicineModel({
      user: req.user._id,
      patientName: req.body.patientName,
      age: req.body.age,
      sex: req.body.sex,
      healthID: req.body.healthID,
      consultationDate: req.body.consultationDate,
      chiefComplaints: req.body.chiefComplaints,
      associatedComplaints: req.body.associatedComplaints,
      pastIllness: req.body.pastIllness,
      labInvestigations: req.body.labInvestigations,
      medicineName: req.body.medicineName,
      quantity: req.body.quantity,
      consumption: req.body.consumption,
      signature: req.body.signature,
    });

    const savedMedicine = await newMedicine.save();

    const newInvoice = new InvoiceModel({
      user: req.user._id,
      medicine: savedMedicine._id,
      // Add other fields relevant to your invoice
    });

    await newInvoice.save();
    await newMedicine.save();

    // Redirect only after the database operations are completed
    res.redirect("/viewqr");
  } catch (error) {
    console.error("Error saving medicine:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/generatePDF/:invoiceId", async function (req, res, next) {
  try {
    const invoiceId = req.params.invoiceId;
    const invoice = await InvoiceModel.findOne({
      _id: req.params.invoiceId,
    })
      .populate("user")
      .populate("medicine");

    console.log(invoice);

    if (!invoice) {
      return res.status(404).send("Invoice not found");
    }

    // Create a PDF document
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=${invoiceId}.pdf`);

    // Pipe the PDF content to the response stream
    doc.pipe(res);

    // Download the prescription image from the URL
    const imageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${invoice._id}&size=100x100`;
    const imageBuffer = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const margin = 100;

    doc.image(imageBuffer.data, { width: 50, margin: [margin, margin] });
    doc.moveDown();
    doc.moveDown();
    // Add relevant data to the PDF
    doc.fontSize(30).text("Prescription Details", {
      align: "center",
      margin: [margin, margin],
    });
    doc.moveDown();
    doc.fontSize(12).text(`Patient Name: ${invoice.medicine.patientName}`, {
      margin: [margin, 0],
    });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Age: ${invoice.medicine.age}`, { margin: [margin, 0] });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Sex: ${invoice.medicine.sex}`, { margin: [margin, 0] });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Health ID: ${invoice.medicine.healthID}`, { margin: [margin, 0] });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Consultation Date: ${invoice.medicine.consultationDate}`, {
        margin: [margin, 0],
      });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Chief Complaints: ${invoice.medicine.chiefComplaints}`, {
        margin: [margin, 0],
      });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Associated Complaints: ${invoice.medicine.associatedComplaints}`, {
        margin: [margin, 0],
      });
    doc.moveDown();
    doc.fontSize(12).text(`Past Illness: ${invoice.medicine.pastIllness}`, {
      margin: [margin, 0],
    });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Lab Investigations: ${invoice.medicine.labInvestigations}`, {
        margin: [margin, 0],
      });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Medicine Name: ${invoice.medicine.medicineName}`, {
        margin: [margin, 0],
      });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Quantity: ${invoice.medicine.quantity}`, {
        margin: [margin, 0],
      });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Consumptions: ${invoice.medicine.consumption}`, {
        margin: [margin, 0],
      });
    doc.moveDown();
    doc.moveDown();
    doc.moveDown();
    doc.moveDown();
    doc.moveDown();

    const signatureMargin = 20;
    doc
      .fontSize(12)
      .text(`Digital Signature of the Doctor: ${invoice.medicine.signature}`, {
        align: "right",
        margin: [margin, signatureMargin, margin, signatureMargin],
      });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/viewqr",isLoggedIn ,async function (req, res, next) {
  var allInvoices = await InvoiceModel.find().populate("user").populate("medicine");

  res.render("viewqr", { Invoices: allInvoices });
});

// router.post("/generateInvoice", async (req, res, next) => {
//   try {
//     // Create a new PDF document
//     const doc = new PDFDocument();

//     // Pipe the PDF content to a file
//     const filePath = path.join(__dirname, "invoices", "invoice.pdf"); // Adjust the path accordingly
//     const writeStream = fs.createWriteStream(filePath);
//     doc.pipe(writeStream);

//     // Add content to the PDF using the form data
//     doc.fontSize(16).text("Invoice", { align: "center" });

//     // Extract data from the form submission
//     const {
//       patientName,
//       age,
//       sex,
//       healthID,
//       consultationDate,
//       chiefComplaints,
//       associatedComplaints,
//       pastIllness,
//       labInvestigations,
//       medicines,
//       signature,
//     } = req.body;

//     // Add relevant data to the PDF
//     doc.fontSize(12).text(`Patient Name: ${patientName}`);
//     doc.fontSize(12).text(`Age: ${age}`);
//     doc.fontSize(12).text(`Sex: ${sex}`);
//     doc.fontSize(12).text(`Health ID: ${healthID}`);
//     doc.fontSize(12).text(`Consultation Date: ${consultationDate}`);
//     doc.fontSize(12).text(`Chief Complaints: ${chiefComplaints}`);
//     doc.fontSize(12).text(`Associated Complaints: ${associatedComplaints}`);
//     doc.fontSize(12).text(`Past Illness: ${pastIllness}`);
//     doc.fontSize(12).text(`Lab Investigations: ${labInvestigations}`);

//     // Add a table for medicines
//     doc.fontSize(12).text("Medicines:");
//     const table = {
//       headers: ["Medicine Name", "Quantity", "Consumption"],
//       rows: medicines.map((medicine) => [
//         medicine.medicineName,
//         medicine.quantity,
//         medicine.consumption,
//       ]),
//     };
//     doc.table(table, { width: 400 });

//     doc.fontSize(12).text(`Digital Signature of the Doctor: ${signature}`);

//     // Finalize the PDF
//     doc.end();

//     // Respond with a link to the generated PDF
//     res.send(`<a href="/invoices/invoice.pdf" target="_blank">Download Invoice PDF</a>`);
//   } catch (error) {
//     console.error("Error generating PDF:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

module.exports = router;

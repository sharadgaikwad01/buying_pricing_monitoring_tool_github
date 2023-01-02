const fs = require("fs");
const PDFDocument = require("pdfkit");
const https = require('https');
var async = require("async");

async function createSupplierAssortments(assortment_details, path) {
  let doc = new PDFDocument({ size: "A4", margin: 50 });
  var stream;
  var shouldReturn = false;
  async.waterfall([
    function (callback) {
      generateHeader(doc);
      console.log("step 1");
      callback(null)
    },
    function (callback) {
      generateCustomerInformation(doc, assortment_details);
      console.log("step 2");
      callback(null)
    },
    function (callback) {
      generateAssortmentTable(doc, assortment_details);
      console.log("step 3");
      callback(null)
    },
    function (callback) {
      generateFooter(doc);
      console.log("step 4");
      callback(null)
    },
    function (callback) {      
      stream = doc.pipe(fs.createWriteStream(path));
      doc.end();
      console.log("step 5");
      stream.on('finish', function() {
        
      });
    }
  ]); 
  
}

function generateHeader(doc) {
  doc
    .image("logo.png", 50, 45, { height: 30, width: 150 })
    .fillColor("#444444")
    .fontSize(15)
    .text("Buying Price Monitoring Tool.", 50, 80)
    .fontSize(10)
    .text("Buyer Name", 200, 50, { align: "right" })
    .text("Category Manger", 200, 65, { align: "right" })
    .text("Country", 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, assortment_details) {
  doc
    .fillColor("#444444")
    .fontSize(11)
    .text("Dear Sharad,", 50, 160)
    .text("As per our discussion, I am sharing the agreed article price and effective date in the table below.", 50, 180);
}

function generateAssortmentTable(doc, assortment_details) {
  let i;
  const assortment_detailsTableTop = 230;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    assortment_detailsTableTop,
    "SL. No.",
    "Article No.",
    "Description",
    "Requested Price",
    "Agreed Price",
    "Price Effective Date "
  );
  generateHr(doc, assortment_detailsTableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < assortment_details.length; i++) {
    const item = assortment_details[i];
    const position = assortment_detailsTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.suppl_no,
      item.art_no,
      item.art_name,
      item.new_price,
      item.final_price,
      item.price_increase_effective_date
    );
    generateHr(doc, position + 20);
  }
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      "System generated PDF",
      50,
      780,
      { align: "center", width: 500 }
    );
}

function generateTableRow(
  doc,
  y,
  suppl_no,
  art_no,
  art_name,
  new_price,
  final_price,
  price_increase_effective_date
) {
  doc
    .fontSize(8)
    .text(suppl_no, 50, y)
    .text(art_no, 100, y)
    .text(art_name, 180, y, { width: 120, align: "left" })
    .text(new_price, 300, y, { width: 50, align: "center" })
    .text(final_price, 380, y, { width: 50, align: "center" })
    .text(price_increase_effective_date, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

module.exports = {
  createSupplierAssortments
};
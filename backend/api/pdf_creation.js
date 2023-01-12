const fs = require("fs");
const PDFDocument = require("pdfkit");
const https = require('https');
var async = require("async");
const { sendEmail } = require("./sendEmail");
var config = require('../config');
var path = require('path');

async function createSupplierAssortments(assortment_details=null, path=null, res=null, country=null, buyer_name=null, flag=null, supplier_name=null) {
  let doc = new PDFDocument({ size: "A4", margin: 50 });
  var stream;
  var shouldReturn = false;
  await generateHeader(doc, country, buyer_name);
  await generateCustomerInformation(doc, assortment_details, supplier_name);
  await generateAssortmentTable(doc, assortment_details);
  await generateFooter(doc);
  stream = await doc.pipe(fs.createWriteStream(path));
  doc.end();
  stream.on('finish', function() {
    if( flag == 'pdf-download'){
      var data =fs.readFileSync(path);
      res.contentType("application/pdf");
      res.send(data);
      return;
    } else {
      message = (
        'Dear '+buyer_name+', <br><br>'+
        'The attached file contains a pdf of a closed article price request.<br><br>'+
        '<br>For more information, please visit the BPMT portal. <a href="'+config.reactFrontend+'/buyer_login" >Click here </a><br>'+
        '<br>If you require any assistance, please contact our support email address: support-hyperautomation@metro-gsc.in'+
        '<br><br>Sincerely,'+
        '<br>Team BPMT'+	
        '<br><br><br><p style="font-size: 10px;">Note: This email was sent from a notification-only address that cannot accept incoming email. Please do not reply to this message.</p>'			
      );
      //to = value.buyer_emailid;
      to = 'sharad.gaikwad02@metro-gsc.in'
      subject = 'Attached is a PDF of the closed price request for the article - BPMT'
      html = message
      //sendEmail(to, subject, html, path)
    }    
  });
}

function generateHeader(doc, country, buyer_name) {
  doc
    .image("tool_logo.png", 50, 45, { height: 30, width: 150 })
    .fillColor("#444444")
    .fontSize(15)
    .text("", 50, 80)
    .fontSize(10)
    .text(buyer_name, 200, 50, { align: "right" })
    .text("Category Manger", 200, 65, { align: "right" })
    .text(country, 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, assortment_details, supplier_name) {
  doc
    .fillColor("#444444")
    .fontSize(11)
    .text("Dear "+supplier_name+",", 50, 160)
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
const fs = require("fs");
const PDFDocument = require("pdfkit");
const https = require('https');
var async = require("async");
const { sendEmail } = require("./sendEmail");
var config = require('../config');
var path = require('path');

async function createSupplierAssortments(assortment_details=null, path=null, res=null, country=null, buyer_name=null, flag=null, supplier_name=null, buyer_emailid=null) {
  let doc = new PDFDocument({ size: "A4", margin: 50 });
  var stream;
  var shouldReturn = false;
  var file_path='';
  if(country){
    file_path="../languages/"+country.toUpperCase()+".json";
  }

  var language_contect = require(file_path);

  await generateHeader(doc, country, buyer_name);
  await generateCustomerInformation(doc, assortment_details, supplier_name);
  await generateCustomerInformationLanguage(doc, assortment_details, supplier_name, language_contect)
  await generateAssortmentTable(doc, assortment_details);
  await generateFooter(doc,language_contect);  
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
        language_contect.dear+' '+buyer_name+', <br><br>'+
        language_contect.attached_file+'<br><br>'+
        '<br>'+language_contect.more_information+' <a href="'+config.reactFrontend+'/buyer_login" >'+language_contect.click_here+' </a><br>'+
        '<br>'+language_contect.support_email+' support-hyperautomation@metro-gsc.in'+
        '<br><br>'+language_contect.sincerely+','+
        '<br>'+language_contect.team_BPMT+''+	
        '<br><br><br><p style="font-size: 10px;">'+language_contect.note+'</p>'			
      );
      to = buyer_emailid;
      //to = 'archanaaditya.deokar@metro-gsc.in'
      subject = language_contect.subject
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
    .text("Category Manager", 200, 65, { align: "right" })
    .text(country, 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, assortment_details, supplier_name) {
  doc
    .fillColor("#444444")
    .fontSize(11)
    .text("M\S "+supplier_name+",", 50, 140)
    .text("As per our discussion, I am sharing the agreed article price and effective date in the table below.", 50, 160);

    generateHr(doc, 180);
}

function generateCustomerInformationLanguage(doc, assortment_details, supplier_name, language_contect) {
  console.log(language_contect)
  doc
    .fillColor("#444444")
    .fontSize(11)
    .text(`${language_contect.dear_text} ${supplier_name},`, 50, 200)
    .text(language_contect.per_our_discussion, 50, 220);
  
    generateHr(doc, 260);
}

function generateAssortmentTable(doc, assortment_details) {
  let i;
  const assortment_detailsTableTop = 300;

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

function generateFooter(doc,language_contect) {
  doc
    .fontSize(10)
    .text(
      "System generated PDF",
      50,
      780,
      { align: "center", width: 500 }
    )
    .text(
      `${language_contect.System_generated_PDF}`,
      50,
      800,
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
import { User, Briefcase, Mail, Calendar, DollarSign, X } from 'react-feather'

import { nodeBackend } from '@utils'

import { useState } from 'react'

import axios from 'axios'
// import { nodeBackend } from '@utils'
// ** Reactstrap Imports
import { Modal, Input, Label, Button, ModalHeader, ModalBody, InputGroup, InputGroupText, Row, Col } from 'reactstrap'

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import  secureLocalStorage  from  "react-secure-storage"
import LoadingSpinner from '@src/@core/components/spinner/Loading-spinner.js'

const MySwal = withReactContent(Swal)

import { read, utils } from 'xlsx'

const UploadBuyerArticliesModal = ({ open, handleModal, setsupplierInputsData }) => {
  const country = secureLocalStorage.getItem('country')
  const email = secureLocalStorage.getItem('email')
  const [isLoading, setIsLoading] = useState(false)
  // ** Custom close btn
  const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />

  const [file, setFile] = useState()

  const [behalfOfSupplier, setBehalfOfSupplier] = useState(false)

  const fileReader = new FileReader()

  const handleOnChange = (e) => {
    setFile(e.target.files[0])
  }

  async function uploadFile(data) {
    const buyer_inputs = data
    setIsLoading(true)
    await axios({
      method: "post",
      url: `${nodeBackend}/upload_buyer_input`,
      data: { buyer_inputs, country, email }
    }).then(function (success) {
        setsupplierInputsData(success.data.data.buyerInputs)
       
        // console.log(success)
        if (success.data.status) {
          setIsLoading(false)
          handleModal(false)
          return MySwal.fire({
            title: 'Done!',
            text: success.data.sucess_count > 1 ? `${success.data.sucess_count} Records has been uploaded` : `${success.data.sucess_count} Record has been uploaded`,
            icon: 'success',
            customClass: {
              confirmButton: 'btn btn-primary'
            },
            buttonsStyling: false
          })
        } else {
          setIsLoading(false)
          handleModal(false)
          return MySwal.fire({
            title: 'Duplicate entry found.',
            text: 'Request already open for article. Please check file records',
            icon: 'error',
            customClass: {
              confirmButton: 'btn btn-primary'
            },
            buttonsStyling: false
          })
        }
      })
      .catch(function (e) {
        console.log(e)
        setIsLoading(false)
        handleModal(false)
        return MySwal.fire({
          title: 'Error',
          text: 'Something went wrong. Please try again later',
          icon: 'error',
          customClass: {
            confirmButton: 'btn btn-primary'
          },
          buttonsStyling: false
        })
      })
  }

  async function uploadSupplierInput(data) {
    const supplier_inputs = data
    setIsLoading(true)
    await axios({
      method: "post",
      url: `${nodeBackend}/upload_supplier_input_by_buyer`,
      data: { supplier_inputs, country, email }
    })
      .then(function (success) {
        setsupplierInputsData(success.data.data.supplierInputs)
        if (success.data.status) {
          setIsLoading(false)
          handleModal(false)
          return MySwal.fire({
            title: 'Done!',
            text: success.data.sucess_count > 1 ? `${success.data.sucess_count} Records has been uploaded` : `${success.data.sucess_count} Record has been uploaded`,
            icon: 'success',
            customClass: {
              confirmButton: 'btn btn-primary'
            },
            buttonsStyling: false
          })
        } else {
          setIsLoading(false)
          handleModal(false)
          return MySwal.fire({
            title: 'Duplicate entry found.',
            text: 'Request already open for article. Please check file records',
            icon: 'error',
            customClass: {
              confirmButton: 'btn btn-primary'
            },
            buttonsStyling: false
          })
        }
      })
      .catch(function () {
        setIsLoading(false)
        handleModal(false)
        return MySwal.fire({
          title: 'Error',
          text: 'Something went wrong. Please try again later',
          icon: 'error',
          customClass: {
            confirmButton: 'btn btn-primary'
          },
          buttonsStyling: false
        })
      })
  }

  const csvFileToArray = async (string) => {
    const csvHeader = string.slice(0, string.indexOf("\n")).split(",")
    const csvRows = string.slice(string.indexOf("\n") + 1).split("\n")

    const supplier_inputs = csvRows.map(i => {
      const values = i.split(",")

      const obj = csvHeader.reduce((object, header, index) => {
        if (values[index]) {
          object[header.replace('\r', '').replace('"', '')] = values[index].replace('\r', '')
        }

        return object
      }, {})
      return obj
    })
   
    if (behalfOfSupplier) {
      uploadFile(supplier_inputs)
    } else {
      uploadSupplierInput(supplier_inputs)
      
    }    
  }

  const handleOnSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    if (file) {
      if (behalfOfSupplier) {
        const filename = file.name.split(".")
        if (filename[1] === 'csv') {
          fileReader.onload = function (event) {
            const csvOutput = event.target.result
            // console.log(csvOutput)
            csvFileToArray(csvOutput)
          }
          fileReader.readAsText(file)
          setIsLoading(false)
        }
        if (filename[1] === 'xlsx') {
          fileReader.readAsBinaryString(file)
          fileReader.onload = function (event) {
            const fileData = event.target.result
            const wb = read(fileData, { type: 'binary', cellDates: true, dateNF:'yyyy-mm-dd;@'})
            wb.SheetNames.forEach(function (sheetName) {
              const rowObj = utils.sheet_to_row_object_array(wb.Sheets[sheetName], { header: 1, raw: false, blankrows: false, dateNF: 'yyyy-mm-dd' })
              // console.log(rowObj)
              const customHeadingsData = rowObj.map((item) => ({
                  country_name : item[0],
                  vat_no : item[1],
                  suppl_no : item[2],
                  art_no : item[3],
                  art_name : item[4],
                  subsys_no : item[5],
                  ean_no : item[6],
                  umbrella_name : item[7],
                  new_price : item[8],
                  price_change_reason : item[9],
                  price_increase_effective_date : item[10]
                }
              ))
              customHeadingsData.shift()
              
              setIsLoading(false)
              uploadSupplierInput(customHeadingsData)
            })
          }
        }
      } else {
        const filename = file.name.split(".")
        if (filename[1] === 'csv') {
          fileReader.onload = function (event) {
            const csvOutput = event.target.result
            // console.log(csvOutput)
            csvFileToArray(csvOutput)
          }
          fileReader.readAsText(file)
          setIsLoading(false)
        }
        if (filename[1] === 'xlsx') {
          fileReader.readAsBinaryString(file)
          fileReader.onload = function (event) {
            const fileData = event.target.result
            const wb = read(fileData, { type: 'binary', cellDates: true, dateNF: 'yyyy-mm-dd;@' })
            wb.SheetNames.forEach(function (sheetName) {
              const rowObj = utils.sheet_to_row_object_array(wb.Sheets[sheetName], { header: 1, raw: false, blankrows: false, dateNF: 'yyyy-mm-dd' })
              // console.log(rowObj)
              const customHeadingsData = rowObj.map((item) => ({
                Supplier_Number: item[0],
                Supplier_Name: item[1],
                Article_Number: item[2],
                subsys_no : item[3],
                EAN_Number: item[4],
                Article_Description: item[5],
                Current_Price: item[6],
                Requested_Price: item[7],
                Requested_Date: item[8],
                Price_change_Reason: item[9],
                Price_Effective_Date: item[10],
                Final_Price: item[11],
                Price_Finalize_Date: item[12],
                CAT_Manager_Comment: item[13]
              }
              ))
              customHeadingsData.shift()
              // console.log(customHeadingsData)
              uploadFile(customHeadingsData)
            })
          }
        }
      }
    } else {
      setIsLoading(false)
      return MySwal.fire({
        title: 'Error',
        text: 'Please select File First',
        icon: 'error',
        customClass: {
          confirmButton: 'btn btn-primary'
        },
        buttonsStyling: false
      })
    }
  }

  return (
    <Modal
      isOpen={open}
      toggle={handleModal}
      className=''
      contentClassName='pt-0'
    >
      <ModalHeader className='mb-1' toggle={handleModal} close={CloseBtn} tag='div'>
        <h5 className='modal-title'>Upload Supplier Input</h5>
      </ModalHeader>
      {isLoading ? <LoadingSpinner /> : <ModalBody className='flex-grow-1'>
        <Row className='mb-50'>
          <Col lg='12' md='6' className='mb-1'>
            Note : While Uploading Article
            <ul>
              <li>Date format for Price Finalize Date should be "yyyy-mm-dd" eg. 2022-12-15</li>
              <li>Requested Price Should be numeric value. eg. 20 or 20.00</li>
            </ul>
          </Col>

          <Col lg='12' md='6' className='mb-1'>
            <Label className='form-label' for='inputFile'>
              Upload file
            </Label>
            <Input type='file' required id='inputFile' name='supplier_input_file' accept={".csv, .xlsx"} onChange={handleOnChange} />
          </Col>
          <Col lg='12' md='6' className='mb-1'>
            <div className='form-check form-check-inline'>
              <Input type='checkbox' id='basic-cb-unchecked' checked={behalfOfSupplier} onChange={e => { setBehalfOfSupplier(e.target.checked) }} />
              <Label for='basic-cb-unchecked' className='form-check-label'>
                Behalf of supplier
              </Label>
            </div>
          </Col>
        </Row>
        <div className='d-flex justify-content-center'>
          <Button className='me-1' color='primary' onClick={(e) => { handleOnSubmit(e) }}>
            Upload
          </Button>
        </div>
      </ModalBody> }
    </Modal>
  )
}

export default UploadBuyerArticliesModal
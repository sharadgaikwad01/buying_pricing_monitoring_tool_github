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

const MySwal = withReactContent(Swal)

import { read, utils } from 'xlsx'

const UploadmintechModal = ({ open, handleModal, setUsersInputsData, searchName, searchCategory }) => {

  // ** Custom close btn
  const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />

  const [file, setFile] = useState()

  const fileReader = new FileReader()

  const handleOnChange = (e) => {
    setFile(e.target.files[0])
  }

  async function uploadFile(data) {
    const mintech_inputs = data
    const created_by = secureLocalStorage.getItem('email')
    await axios({
      method: "post",
      url: `${nodeBackend}/upload_mintech_input`,
      data: { mintech_inputs, created_by, searchName, searchCategory }
    })
      .then(function (success) {
        setUsersInputsData(success.data.data.users)
        if (success.data.status) {
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
          return MySwal.fire({
            title: 'Duplicate entry found.',
            text: 'Data already exist. Please check file records',
            icon: 'error',
            customClass: {
              confirmButton: 'btn btn-primary'
            },
            buttonsStyling: false
          })
        }
      })
      .catch(function () {
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

    const mintech_inputs = csvRows.map(i => {
      const values = i.split(",")

      const obj = csvHeader.reduce((object, header, index) => {
        if (values[index]) {
          object[header.replace('\r', '').replace('"', '')] = values[index].replace('\r', '')
        }

        return object
      }, {})
      return obj
    })
    handleModal(false)    
    uploadFile(mintech_inputs)
  }

  const handleOnSubmit = (e) => {
    e.preventDefault()
    if (file) {
      const filename = file.name.split(".")
      if (filename[1] === 'csv') {
        fileReader.onload = function (event) {
          const csvOutput = event.target.result
          // console.log(csvOutput)
          csvFileToArray(csvOutput)
        }
        fileReader.readAsText(file)
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
                dashboard_name : item[0],
                dashboard_url : item[1],
                stratbuyer_category : item[2],
                mintec_sub_category : item[3]
              }
            ))
            customHeadingsData.shift()
            handleModal(false)
            uploadFile(customHeadingsData)
          })
        }
      }
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
        <h5 className='modal-title'>Upload Mintech Data</h5>
      </ModalHeader>
      <ModalBody className='flex-grow-1'>
        <Row className='mb-50'>
            {/* <Col lg='12' md='6' className='mb-1'>
                <a href='/somefile.txt' download>Click here to download sample file</a>
            </Col> */}

            <Col lg='12' md='6' className='mb-1'>
                    Note : While Uploading Article 
                <ul>
                    <li>Dashboard Name should be unique value</li>
                    <li>All field are a required field</li>
                    {/* <li>Employee ID must be 8 Digit</li> */}
                </ul>
            </Col>
          
          <Col lg='12' md='6' className='mb-1'>
            <Label className='form-label' for='inputFile'>
              Upload file
            </Label>
            <Input type='file' required id='inputFile' name='supplier_input_file' accept={".xlsx"} onChange={handleOnChange} />
          </Col>
        </Row>
        <div className='d-flex justify-content-center'>
          <Button className='me-1' color='primary' onClick={(e) => { handleOnSubmit(e) }}>
            Upload
          </Button>
        </div>
      </ModalBody>
    </Modal>
  )
}

export default UploadmintechModal
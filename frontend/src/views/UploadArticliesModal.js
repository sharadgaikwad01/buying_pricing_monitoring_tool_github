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
const MySwal = withReactContent(Swal)

const UploadArticliesModal = ({ open, handleModal, setsupplierInputsData }) => {
  const country = localStorage.getItem('country')
  const vat_number = localStorage.getItem('vat')

  // ** Custom close btn
  const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />

  const [file, setFile] = useState()

  const fileReader = new FileReader()

  const handleOnChange = (e) => {
    setFile(e.target.files[0])
  }

  const csvFileToArray = async(string) => {
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

    handleModal(false)

    await axios({
      method: "post",
      url: `${nodeBackend}/upload_supplier_input`,
      data: { supplier_inputs, country, vat_number }
    })
      .then(function (success) {
        //handle success    
        setsupplierInputsData(success.data.data.supplierInputs)
        if (success.data.status) {
          return MySwal.fire({
            title: 'Done!',
            text: 'File has been uploaded!',
            icon: 'success',
            customClass: {
              confirmButton: 'btn btn-primary'
            },
            buttonsStyling: false
          })
        } else {
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

  const handleOnSubmit = (e) => {
    e.preventDefault()
    if (file) {
      fileReader.onload = function (event) {
        const csvOutput = event.target.result
        csvFileToArray(csvOutput)
        console.log()
      }
      fileReader.readAsText(file)
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
      <ModalBody className='flex-grow-1'>
        <Row className='mb-50'>
          <Col lg='12' md='6' className='mb-1'>
            <Label className='form-label' for='inputFile'>
              Upload file
            </Label>
            <Input type='file' id='inputFile' name='supplier_input_file' accept={".csv"} onChange={handleOnChange} />
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

export default UploadArticliesModal
// ** Third Party Components
import React, { useState } from "react"

import { X } from 'react-feather'

import axios from 'axios'

// ** Reactstrap Imports
import { Modal, Input, Label, Button, ModalHeader, ModalBody, InputGroup, InputGroupText, Row, Col, FormFeedback, Form } from 'reactstrap'

import Select from 'react-select'
import { nodeBackend } from '@utils'
// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'

import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)

const fileDownload = require('js-file-download')

const DownloadArticliesModal = ({ open, handleModal, supllierNumberOptions }) => {

    const country = localStorage.getItem('country')

    const [supplierNumber, setSupplierNumber] = useState('')

    const SupplierInputSchema = yup.object().shape({
        supplier_number: yup.string().required()
    })

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm({ mode: 'onChange', resolver: yupResolver(SupplierInputSchema) })

    const onSubmit = async (data) => {
        console.log(data)
        const supplier_number = data.supplier_number
        await axios.get(`${nodeBackend}/download_supplier_assoerment_pdf`, {
            params: { supplier_number, country },
            responseType: 'blob'
        }).then(async (res) => {
            handleModal(false)
            console.log(res)
            fileDownload(res.data, "download.pdf")
            if (res.data.status) {
                return MySwal.fire({
                    title: 'Done!',
                    text: 'Supplier Assortment PDF has been downloaded!',
                    icon: 'success',
                    customClass: {
                        confirmButton: 'btn btn-primary'
                    },
                    buttonsStyling: false
                })
            } else {
                MySwal.fire({
                    title: 'Info!',
                    text: 'There is no article details available for this supplier number',
                    icon: 'info',
                    customClass: {
                        confirmButton: 'btn btn-primary'
                    },
                    buttonsStyling: false
                })
            }
        })
    }

    const handleChange = async (val) => {
        await setSupplierNumber(val)
    }


    // ** Custom close btn
    const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />

    return (
        <Modal
            isOpen={open}
            toggle={handleModal}
            className='modal-sm'
            contentClassName='pt-0'
        >
            <ModalHeader className='mb-1' toggle={handleModal} close={CloseBtn} tag='div'>
                <h5 className='modal-title'>Download Assortment PDF</h5>
            </ModalHeader>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <ModalBody className='flex-grow-1'>
                    <Row className='mb-50'>
                        <Col lg='12' md='6' className='mb-1'>
                            <Label className='form-label' for='supplier_number'>
                                Supplier Number
                            </Label>
                            <Controller
                                name="supplier_number"
                                control={control}
                                render={({ field: { onChange } }) => (
                                    <Select
                                        options={supllierNumberOptions}
                                        className='is-invalid select-custom'
                                        classNamePrefix="react-select"
                                        value={supllierNumberOptions.find((c) => c.value === supplierNumber)}
                                        onChange={(val) => { onChange(val.value, handleChange(val)) }}
                                    />
                                )}
                            />
                            {errors["supplier_number"] && <FormFeedback>{'Supplier number is a required field'}</FormFeedback>}
                        </Col>
                    </Row>
                    <div className='d-flex justify-content-center'>
                        <Button className='me-1' color='primary' type='submit'>
                            Download
                        </Button>
                    </div>
                </ModalBody>
            </Form>
        </Modal >
    )
}

export default DownloadArticliesModal
// ** Third Party Components
import Flatpickr from 'react-flatpickr'

import React, { useState } from "react"

import { User, Briefcase, Mail, Calendar, DollarSign, X } from 'react-feather'

import { MultiSelect } from "react-multi-select-component"

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

import { utils, writeFile } from 'xlsx'

const DownloadArticliesModal = ({ open, handleModal, supllierNumberOptions }) => {

    const country = localStorage.getItem('country')
    const vat_number = localStorage.getItem('vat')
    const [fileName] = useState('export')
    const [fileFormat] = useState('xlsx')

    const [selected, setSelected] = useState([])

    function convertArrayOfObjectsToCSV(array) {
        let result
        const columnDelimiter = ','
        const lineDelimiter = '\n'
        const keys = Object.keys(array[0])

        result = ''
        result += keys.join(columnDelimiter)
        result += lineDelimiter

        array.forEach(item => {
            let ctr = 0
            keys.forEach(key => {
                if (ctr > 0) result += columnDelimiter

                result += item[key]

                ctr++
            })
            result += lineDelimiter
        })

        return result
    }
    // ** Downloads CSV
    async function downloadCSV(array) {
        const link = document.createElement('a')
        let csv = convertArrayOfObjectsToCSV(array)
        if (csv === null) return

        const filename = 'export.csv'

        if (!csv.match(/^data:text\/csv/i)) {
            csv = `data:text/csv;charset=utf-8,${csv}`
        }

        link.setAttribute('href', encodeURI(csv))
        link.setAttribute('download', filename)
        link.click()

        handleModal(false)

        return MySwal.fire({
            title: 'Done!',
            text: 'File has been downloaded!',
            icon: 'success',
            customClass: {
                confirmButton: 'btn btn-primary'
            },
            buttonsStyling: false
        })
    }

    const SupplierInputSchema = yup.object().shape({
        supplier_number: yup.array().min(1, "").required()
    })

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm({ mode: 'onChange', resolver: yupResolver(SupplierInputSchema) })

    const onSubmit = async (data) => {
        let supplier_string = ''
        for (const value of data.supplier_number) {
            supplier_string = `${supplier_string}, '${value.value}'` 
        }
        const supplier_number = supplier_string.substring(1)
        await axios.get(`${nodeBackend}/supplier_article_details`, { params: { supplier_number, country, vat_number } }).then((res) => {
            console.log(res.data)
            if (res.data.data.length > 0) {
                
                const name = fileName.length ? `${fileName}.${fileFormat}` : `excel-sheet.${fileFormat}`
                const wb = utils.json_to_sheet(res.data.data)
                const wbout = utils.book_new()
                utils.book_append_sheet(wbout, wb, 'test')
                writeFile(wbout, name)
            } else {
                handleModal(false)
                downloadCSV(res.data.data)
                MySwal.fire({
                    title: 'Error',
                    text: 'There is no article details available for this supplier number',
                    icon: 'error',
                    customClass: {
                        confirmButton: 'btn btn-primary'
                    },
                    buttonsStyling: false
                })
            }
        })
    }

    const handleChange = async (val) => {
        await setSelected(val)
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
                <h5 className='modal-title'>Supplier Input</h5>
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
                                    <MultiSelect
                                        options={supllierNumberOptions}
                                        value={selected}
                                        onChange={(val) => onChange(val, handleChange(val))}
                                        labelledBy="Select"
                                    />
                                )}
                            />
                            {errors["supplier_number"] && <FormFeedback>{'Supplier number is a required field'}</FormFeedback>}
                        </Col>
                    </Row>
                    <div className='d-flex justify-content-center'>
                        <Button className='me-1' color='primary' type='submit'>
                            Export Article Details
                        </Button>
                    </div>
                </ModalBody>
            </Form>
        </Modal >
    )
}

export default DownloadArticliesModal
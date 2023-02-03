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

const DownloadArticliesModal = ({ open, handleModal, supllierNumberOptions, flag = null }) => {

    const country = localStorage.getItem('country')
    const email = localStorage.getItem('email')
    const vat_number = localStorage.getItem('vat')
    const [fileName] = useState('export')
    const [fileFormat] = useState('xlsx')

    const [selected, setSelected] = useState([])
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
        if (flag === 2) {
            await axios.get(`${nodeBackend}/buyer_article_details`, { params: { country, email, flag} }).then((res) => {
                const csvdata = res.data.data
                csvdata.forEach(function (item) {
                  delete item.row_id
                  delete item.frmt_new_price
                })
                const finalcsvdata = csvdata.map(item => ({
                  "Supplier Number": item.suppl_no ? item.suppl_no.replace(",", ".") : item.suppl_no,
                  "Supplier Name":item.suppl_name ? item.suppl_name.replace(",", ".") : item.suppl_name,
                  "Article Number": item.art_no ? item.art_no.replace(",", ".") : item.art_no,
                  "EAN Number": item.ean_no ? item.ean_no.replace(",", ".") : item.ean_no,
                  "Article Description": item.art_name_tl ? item.art_name_tl.replace(",", ".") : item.art_name_tl,
                  "Current Price":item.current_price ? item.current_price.replace(",", ".") : item.current_price,
                  "Requested Price": item.new_price ? item.new_price.replace(",", ".") : item.new_price,
                  "Requested Date": item.request_date ? item.request_date.replace(",", ".") : item.request_date,
                  "Price change Reason": item.price_change_reason ? item.price_change_reason.replace(",", ".") : item.price_change_reason,
                  "Price Effective Date": item.price_increase_effective_date ? item.price_increase_effective_date.replace(",", ".") : item.price_increase_effective_date,
                  "Final Price": item.negotiate_final_price ? item.negotiate_final_price.replace(",", ".") : item.negotiate_final_price,
                  "Price Finalize Date": item.price_increase_communicated_date ? item.price_increase_communicated_date.replace(",", ".") : item.price_increase_communicated_date,
                  "CAT Manager Comment": null
                }))
                const name = fileName.length ? `${fileName}.${fileFormat}` : `excel-sheet.${fileFormat}`
                const wb = utils.json_to_sheet(finalcsvdata)
                const wbout = utils.book_new()
                utils.book_append_sheet(wbout, wb, 'test')
                writeFile(wbout, name)
                handleModal(false)
              })
        } else {
            const supplier_number = supplier_string.substring(1)
            await axios.get(`${nodeBackend}/supplier_article_details`, { params: { supplier_number, country, vat_number } }).then((res) => {
                console.log(res.data)
                if (res.data.data.length > 0) {
                    const customHeadingsData = res.data.data.map(item => ({
                        "Country Name": item.country_name,
                        "Vat Number": item.vat_no,
                        "Supplier Number": item.suppl_no,
                        "Article Number": item.art_no,
                        "Article Name": item.art_name,
                        "Umbrella Name": item.umbrella_name,
                        "Requested New Price": item.new_price,
                        "Price Change Reason": item.price_change_reason,
                        "Price Effective Date": item.price_increase_effective_date
                    }))
                    const name = fileName.length ? `${fileName}.${fileFormat}` : `excel-sheet.${fileFormat}`
                    const wb = utils.json_to_sheet(customHeadingsData)
                    const wbout = utils.book_new()
                    utils.book_append_sheet(wbout, wb, 'test')
                    writeFile(wbout, name)
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
                } else {
                    handleModal(false)
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
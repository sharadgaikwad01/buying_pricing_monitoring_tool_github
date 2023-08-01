// ** Third Party Components
import Flatpickr from 'react-flatpickr'

import React, { useState, useEffect, Fragment } from "react"

import { User, Briefcase, Mail, Calendar, DollarSign, X } from 'react-feather'

import { MultiSelect } from "react-multi-select-component"
import UILoader from '@components/ui-loader'
import Spinner from '@components/spinner/Loading-spinner'

import axios from 'axios'

// ** Reactstrap Imports
import { Modal, Input, Label, Button, ModalHeader, ModalBody, InputGroup, InputGroupText, Row, Col, FormFeedback, Form, CardText } from 'reactstrap'

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
import  secureLocalStorage  from  "react-secure-storage"

const DownloadArticliesModal = ({ open, handleModal, supllierNumberOptions, flag = null }) => {

    const country = secureLocalStorage.getItem('country')
    const user_type = secureLocalStorage.getItem('type')
    const email = secureLocalStorage.getItem('email')
    const vat_number = secureLocalStorage.getItem('vat')
    const [fileName] = useState('export')
    const [fileFormat] = useState('xlsx')

    const [behalfOfSupplier, setBehalfOfSupplier] = useState(false)

    const [selected, setSelected] = useState([])
    const SupplierInputSchema = yup.object().shape({
        supplier_number: yup.array().min(1, "").required(),
        behalf_of_supplier: yup.boolean().oneOf([true, false])
    })

    const [block, setBlock] = useState(false)
    const [supllierNumberOptionsList, setSupllierNumberOptionsList] = useState([])

    useEffect(() => {
        setBlock(false)
        setSelected([])
        setSupllierNumberOptionsList(supllierNumberOptions)
        console.log(supllierNumberOptions)
    }, [supllierNumberOptions])

    const {
        control,
        setValue,
        handleSubmit,
        formState: { errors }
    } = useForm({ mode: 'onChange', resolver: yupResolver(SupplierInputSchema) })


    const handleBlock = () => {
        setBlock(true)
    }

    const onSubmit = async (data) => {
        setSelected([])
        setBlock(false)
        setBehalfOfSupplier(false)
        handleBlock()
        // setSupllierNumberOptionsList([])
        let supplier_string = ''
        for (const value of data.supplier_number) {
            supplier_string = `${supplier_string}, '${value.value}'`
        }
        if (flag === 2) {
            const supplier_number = supplier_string.substring(1)
            if (data.behalf_of_supplier) {
                await axios.get(`${nodeBackend}/supplier_article_details`, { params: { supplier_number, country } }).then((res) => {
                    // console.log(res.data)
                    if (res.data.data.length > 0) {
                        const customHeadingsData = res.data.data.map(item => ({
                            "Country Name": item.country_name,
                            "Vat Number": item.vat_no,
                            "Supplier Number": item.suppl_no,
                            "Article Number": item.art_no,
                            "Subsystem Number": item.mikg_art_no,
                            "EAN Number": item.ean_no,
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
                        setBlock(false)
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
                        setBlock(false)
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
            } else {
                await axios.get(`${nodeBackend}/buyer_article_details`, { params: { supplier_number, country, email, flag } }).then((res) => {
                    const csvdata = res.data.data
                    if (csvdata.length > 0) {
                        csvdata.forEach(function (item) {
                            delete item.row_id
                            delete item.frmt_new_price
                        })
                        const finalcsvdata = csvdata.map(item => ({
                            "Supplier Number": item.suppl_no ? item.suppl_no.replace(",", ".") : item.suppl_no,
                            "Supplier Name": item.suppl_name ? item.suppl_name.replace(",", ".") : item.suppl_name,
                            "Article Number": item.art_no ? item.art_no.replace(",", ".") : item.art_no,
                            "Subsystem Number": item.mikg_art_no ? item.mikg_art_no.replace(",", ".") : item.mikg_art_no,
                            "EAN Number": item.ean_no ? item.ean_no.replace(",", ".") : item.ean_no,
                            "Article Description": item.art_name_tl ? item.art_name_tl.replace(",", ".") : item.art_name_tl,
                            "Current Price": item.current_price ? item.current_price.replace(",", ".") : item.current_price,
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
                        setBlock(false)
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
                        setBlock(false)
                        handleModal(false)
                        return MySwal.fire({
                            title: 'Info!',
                            text: 'There is no any details to download.',
                            icon: 'info',
                            customClass: {
                                confirmButton: 'btn btn-primary'
                            },
                            buttonsStyling: false
                        })
                    }
                })
            }
        } else {
            const supplier_number = supplier_string.substring(1)
            await axios.get(`${nodeBackend}/supplier_article_details`, { params: { supplier_number, country, vat_number } }).then((res) => {
                // console.log(res.data)
               // setSupllierNumberOptionsList(supllierNumberOptions)
                if (res.data.data.length > 0) {
                    const customHeadingsData = res.data.data.map(item => ({
                        "Country Name": item.country_name,
                        "Vat Number": item.vat_no,
                        "Supplier Number": item.suppl_no,
                        "Article Number": item.art_no,
                        "Subsystem Number": item.mikg_art_no,
                        "EAN Number": item.ean_no,
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
                    setBlock(false)
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
                    setBlock(false)
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

    const handleSupplierList = async (state) => {
        if (state === true) {
            await axios.get(`${nodeBackend}/getSupplierListByBuyer`, { params: { country, email } }).then((res) => {
                setSupllierNumberOptionsList(res.data.data.supplierIDOptions)
                console.log(supllierNumberOptionsList)
            })
        } else {
                setSupllierNumberOptionsList(supllierNumberOptions)
        }        
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
                <UILoader blocking={block} overlayColor='rgba(115, 103, 240, .1)' >
                    <ModalHeader className='mb-1' toggle={handleModal} close={CloseBtn} tag='div'>
                        <h5 className='modal-title'>Supplier Input</h5>
                    </ModalHeader>
                    <Form onSubmit={handleSubmit(onSubmit)}>                    
                        <ModalBody className='flex-grow-1'>
                            <Row className='mb-50'>
                                { (user_type === 'BUYER' || user_type === 'ADMIN' || user_type === 'SUPERADMIN') ? (<Col lg='12' md='6' className='mb-1'>
                                    <Controller
                                        name="behalf_of_supplier"
                                        control={control}
                                        render={({ field }) => <Input type="checkbox"
                                            checked={behalfOfSupplier}
                                            id='basic-cb-unchecked' {...field} onChange={e => { setBehalfOfSupplier(e.target.checked); handleSupplierList(e.target.checked); setValue('behalf_of_supplier', e.target.checked, { shouldValidate: true }) }} invalid={errors.behalf_of_supplier && true} />}
                                    />
                                    <Label for='basic-cb-unchecked' className='form-check-label'>
                                        &nbsp; Behalf of supplier
                                    </Label>
                                </Col>) : ''}                                
                                <Col lg='12' md='6' className='mb-1'>
                                    <Label className='form-label' for='supplier_number'>
                                        Supplier Number
                                    </Label>
                                    <Controller
                                        name="supplier_number"
                                        control={control}
                                        render={({ field: { onChange } }) => (
                                            <MultiSelect
                                                options={supllierNumberOptionsList}
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
                </UILoader>
            </Modal >
    )
}

export default DownloadArticliesModal
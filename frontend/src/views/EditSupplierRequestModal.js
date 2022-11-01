// ** React Imports
// ** Third Party Components
import { useState, useEffect } from 'react'

import { User, Briefcase, Mail, Calendar, DollarSign, X } from 'react-feather'

import axios from 'axios'
import Select from 'react-select'

// ** Reactstrap Imports
import { Modal, Input, Label, Button, ModalHeader, ModalBody, InputGroup, InputGroupText, FormFeedback, Form } from 'reactstrap'

// ** Third Party Components
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)

const EditSupplierRequestModal = ({ open, handleModal, rowData, supllierNumberOptions, setsupplierInputsData }) => {
  // ** State
  // const [Picker, setPicker] = useState('')
  const [articleOptions, setarticleOptions] = useState([])

  useEffect(async () => {
    const supplierNumber = rowData.suppl_no
    await axios.get(`http://localhost:8080/getArticlesBySupplierNumber`, { params: { supplierNumber } }).then((res) => {
      setarticleOptions(res.data.data.articleOptions)
    })
  }, [rowData])

  const country = localStorage.getItem('country')
  const vat_number = localStorage.getItem('vat')
  
  const [newPrice, setNewPrice] = useState('')
  const [reason, setReason] = useState('')
  const [supplierNumber, setSupplierNumber] = useState('')
  const [articleNumber, setArticleNumber] = useState('')
  const [rowId, setRowId] = useState('')

  const SupplierInputSchema = yup.object().shape({
    new_price: yup.number().required().positive().integer(),
    reason: yup.string().required(),
    supplier_number: yup.string().required(),
    article_number: yup.string().required(),
    row_id: yup.string()
  })

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm({ mode: 'onChange', reValidateMode: 'onChange', resolver: yupResolver(SupplierInputSchema) })  

  useEffect(async () => {
    if (rowData) {
      const supplierNumber = rowData.suppl_no
      await setRowId(rowData.row_id)
      await setNewPrice(rowData.new_price)
      await setReason(rowData.request_date)
      await setSupplierNumber(rowData.suppl_no)
      await setArticleNumber(rowData.art_no)
      
      setValue('row_id', rowData.row_id)
      setValue('new_price', rowData.new_price, { shouldValidate: true })
      setValue('reason', rowData.request_date, { shouldValidate: true })
      setValue('supplier_number', rowData.suppl_no, { shouldValidate: true })
      setValue('article_number', rowData.art_no, { shouldValidate: true })

      await axios.get(`http://localhost:8080/getArticlesBySupplierNumber`, { params: { supplierNumber, country, vat_number } }).then((res) => {
        setarticleOptions(res.data.data.articleOptions)
      })
    }
  }, [rowData])

  // ** Custom close btn
  const CloseBtn = <X className='cursor-pointer' size={15} onClick={(e) => handleModal(e, false)} />

  // ** Hooks  

  const onSubmit = data => {
    const new_price = data.new_price
    const reason = data.reason
    const supplier_number = data.supplier_number
    const article_number = data.article_number
    const row_id = data.row_id

    handleModal(false)

    axios({
      method: "post",
      url: "http://localhost:8080/update_supplier_input",
      data: { row_id, new_price, reason, supplier_number, article_number, country, vat_number}
    }).then(function (success) {
      //handle success        
      if (success.data.status) {
        setsupplierInputsData(success.data.data.supplierInputs) 
        return MySwal.fire({
          title: 'Done!',
          text: 'Records has been updated successfully.',
          icon: 'success',
          customClass: {
            confirmButton: 'btn btn-primary'
          },
          buttonsStyling: false
        })
      } else {
        return MySwal.fire({
          title: 'Error',
          text: 'Something went wrong. Please try again later',
          icon: 'error',
          customClass: {
            confirmButton: 'btn btn-primary'
          },
          buttonsStyling: false
        })
      }
    }).catch(function () {
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

  const handleSupplierNumberFilter = async (value) => {
    const supplierNumber = value.value
    setValue('article_number', '', { shouldValidate: true })
    await axios.get(`http://localhost:8080/getArticlesBySupplierNumber`, { params: { supplierNumber, country, vat_number } }).then((res) => {
      console.log(res.data)
      setarticleOptions(res.data.data.articleOptions)
    })
  }

  return (
    <Modal
      isOpen={open}
      toggle={handleModal}
      className='sidebar-sm'
      modalClassName='modal-slide-in'
      contentClassName='pt-0'
    >
      <ModalHeader className='mb-1' toggle={handleModal} close={CloseBtn} tag='div'>
        <h5 className='modal-title'>Update Record</h5>
      </ModalHeader>
      <ModalBody className='flex-grow-1'>
        <Form onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" name="row_id" value={rowId} />
          <div className='mb-1'>
            <Label className='form-label' for='supplier_number'>
              Supplier Number
            </Label>
            <Controller
              name="supplier_number"
              id="supplier_number"
              control={control}
              render={({ field: { onChange } }) => (
                <Select
                  isDisabled={ true }
                  options={supllierNumberOptions}
                  className='is-invalid'
                  value={supllierNumberOptions.find((c) => c.value === supplierNumber)}
                  onChange={(val) => { setSupplierNumber(val); handleSupplierNumberFilter(val); setValue('supplier_number', val, { shouldValidate: true }); onChange(val.value) }}
                />
              )}
            />
            {errors["supplier_number"] && <FormFeedback>{'Supplier number is a required field'}</FormFeedback>}
          </div>
          <div className='mb-1'>
            <Label className='form-label' for='article_number'>
              Article Number
            </Label>
            <Controller
              name="article_number"
              id="article_number"
              control={control}
              isReadOnly={true}
              render={({ field: { onChange } }) => (
                <Select
                  isDisabled={ true }
                  options={articleOptions}
                  className='is-invalid'
                  value={articleOptions.find((c) => c.value === articleNumber)}
                  onChange={(val) => { setArticleNumber(val); onChange(val.value); setValue('article_number', val.value, { shouldValidate: true }) }}
                />
              )}
            />
            {errors["article_number"] && <FormFeedback>{'Article number is a required field'}</FormFeedback>}
          </div>
          <div className='mb-1'>
            <Label className='form-label' for='new_Price'>
              New Price
            </Label>
            <InputGroup>
              <InputGroupText>
                €
              </InputGroupText>
              <Controller
                id='new_price'
                name='new_price'
                control={control}
                render={({ field }) => <Input type="number"{...field} placeholder='e.g. 65' value={newPrice} onChange={e => { setNewPrice(e.target.value); setValue('new_price', e.target.value, { shouldValidate: true }) }} invalid={errors.new_price && true} />}
              />
              {errors.new_price && <FormFeedback>{"New Price is a required field"}</FormFeedback>}
            </InputGroup>
          </div>
          <div className='mb-1'>
            <Label className='form-label' for='reason'>
              Reason for price increase
            </Label>
            <Controller
              id='reason'
              name='reason'
              defaultValue=''
              control={control}
              render={({ field }) => <Input type='textarea' rows='5' {...field} placeholder='Reason' value={reason} onChange={e => { setReason(e.target.value); setValue('reason', e.target.value, { shouldValidate: true }) }} invalid={errors.reason && true} />}
            />
            {errors.reason && <FormFeedback>{"Reason is a required field"}</FormFeedback>}
          </div>
          <Button className='me-1' color='primary' type='submit'>
            Update
          </Button>
          <Button color='secondary' onClick={(e) => handleModal(e, false)} outline>
            Cancel
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default EditSupplierRequestModal
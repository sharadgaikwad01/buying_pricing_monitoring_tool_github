// ** React Imports
// ** Third Party Components

import { useState, useEffect } from 'react'
import { nodeBackend } from '@utils'

import { User, Briefcase, Mail, Calendar, DollarSign, X } from 'react-feather'

import axios from 'axios'
import Select from 'react-select'
import Flatpickr from 'react-flatpickr'

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

import { currencies } from './countryCurrency'

const AddBuyerInputModal = ({ open, handleModal, rowData, setsupplierInputsData }) => {
  // ** State
  // const [Picker, setPicker] = useState('')
  const country = localStorage.getItem('country')
  const email = localStorage.getItem('email') 

  const [newPrice, setNewPrice] = useState('')
  const [finalPrice, setFinalPrice] = useState('')
  const [rowId, setRowId] = useState('')
  const [articleNumber, setArticleNumber] = useState('')
  const [articleDescription, setArticleDescription] = useState('')
  const [priceIncreaseEffectiveDate, setPriceIncreaseEffectiveDate] = useState('')
  const [priceFinalliseDate, setPriceFinalliseDate] = useState('')

  // ** Custom close btn
  const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />

  const SupplierInputSchema = yup.object().shape({
    new_price: yup.number().required().positive(),
    price_effective_date: yup.array().required(),
    final_price: yup.number()
      .typeError("you must specify a number")
      .notRequired()
      .when("new_price", (new_price, SupplierInputSchema) => {
        return SupplierInputSchema.test({
          test: (final_price) => {
            if (!final_price) return true
            return final_price <= new_price
          },
          message: "Final Price Amount should be less than Requested Price"
        })
      })
  })
  // ** Hooks
  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm({ mode: 'onChange', resolver: yupResolver(SupplierInputSchema) })


  useEffect(async () => {
    if (rowData) {
      console.log(rowData)
      await setArticleNumber(rowData.art_no)
      await setArticleDescription(rowData.art_name_tl)
      await setNewPrice(rowData.new_price)
      await setFinalPrice(rowData.negotiate_final_price)
      await setRowId(rowData.row_id)

      const priceFinalliseDateArr = []
      if (rowData.price_increase_communicated_date) {
        const dateE = rowData.price_increase_communicated_date.split("-")
        const dateS = `${dateE[2]}/${dateE[1]}/${dateE[0]}`
        priceFinalliseDateArr.push(new Date(dateS))
      }

      setPriceFinalliseDate(priceFinalliseDateArr)

      const finatEffectiveDate = []
      if (rowData.price_increase_effective_date) {
        const dateE = rowData.price_increase_effective_date.split("-")
        const dateS = `${dateE[2]}/${dateE[1]}/${dateE[0]}`
        finatEffectiveDate.push(new Date(dateS))
      }

      setPriceIncreaseEffectiveDate(finatEffectiveDate)

      setValue('article_number', rowData.art_no)
      setValue('article_description', rowData.art_name_tl)
      setValue('new_price', rowData.new_price)
      setValue('final_price', rowData.negotiate_final_price)
      setValue('row_id', rowData.row_id)
      setValue('price_effective_date', finatEffectiveDate, { shouldValidate: true })
      setValue('price_finalize_date', priceFinalliseDateArr, { shouldValidate: true })
    }
  }, [rowData])

  const onSubmit = data => {
    console.log(data)
    const finalize_date_arr = []
    const effective_date_arr = []
    const row_id = data.row_id
    const final_price = data.final_price
    const comment = data.comment
    const price_finalize_date = data.price_finalize_date
    const price_effective_date = data.price_effective_date

    price_finalize_date.map(i => {
      const date = new Date(i)

      const year = date.getFullYear()

      let month = (1 + date.getMonth()).toString()
      month = month.length > 1 ? month : `0${month}`

      let day = date.getDate().toString()
      day = day.length > 1 ? day : `0${day}`

      finalize_date_arr.push(`${year}-${month}-${day}`)
      return true
    })
    const finalize_date = finalize_date_arr[0]

    price_effective_date.map(i => {
      const date = new Date(i)

      const year = date.getFullYear()

      let month = (1 + date.getMonth()).toString()
      month = month.length > 1 ? month : `0${month}`

      let day = date.getDate().toString()
      day = day.length > 1 ? day : `0${day}`

      effective_date_arr.push(`${year}-${month}-${day}`)
      return true
    })
    const effective_date = effective_date_arr[0]


    handleModal(false)

    axios({
      method: "post",
      url: `${nodeBackend}/update_buyer_input`,
      data: { row_id, final_price, comment, finalize_date, effective_date, country, email}
    })
      .then(function (success) {
        //handle success 
        if (success.data.status) {
          console.log(success.data)
          setsupplierInputsData(success.data.data.supplierInputs)
          return MySwal.fire({
            title: 'Done!',
            text: 'Request has been updated',
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
            <Label className='form-label' for='article_number'>
              Article number
            </Label>
            <InputGroup>
              <Controller
                id='article_number'
                name='article_number'
                defaultValue=''
                control={control}
                render={({ field }) => <Input type="number"{...field} value={articleNumber} readOnly />}
              />
            </InputGroup>
          </div>
          <div className='mb-1'>
            <Label className='form-label' for='article_description'>
              Article Description
            </Label>
            <InputGroup>
              <Controller
                id='article_description'
                name='article_description'
                defaultValue=''
                control={control}
                render={({ field }) => <Input type="text"{...field} value={articleDescription} readOnly />}
              />
            </InputGroup>
          </div>
          <div className='mb-1'>
            <Label className='form-label' for='new_Price'>
              Requested Price
            </Label>
            <InputGroup>
              <InputGroupText>
                {currencies[0][country]}
              </InputGroupText>
              <Controller
                id='new_price'
                name='new_price'
                control={control}
                render={({ field }) => <Input type="number"{...field} placeholder='e.g. 65.00' readOnly value={newPrice} onChange={e => { setNewPrice(e.target.value); setValue('new_price', e.target.value, { shouldValidate: true }) }} invalid={errors.new_price && true} />}
              />
              {errors.new_price && <FormFeedback>{"Requested Price is a required field"}</FormFeedback>}
            </InputGroup>
          </div>
          <div className='mb-1'>
            <Label className='form-label' for='final_price'>
              Final Price
            </Label>
            <InputGroup>
              <InputGroupText>
                {currencies[0][country]}
              </InputGroupText>
              <Controller
                id='final_price'
                name='final_price'
                defaultValue=''
                control={control}
                render={({ field }) => <Input type="number"{...field} placeholder='e.g. 65.00' value={finalPrice} onChange={e => { setFinalPrice(e.target.value); setValue('final_price', e.target.value, { shouldValidate: true }) }} invalid={errors.final_price && true} />}
              />
              {errors.final_price && <FormFeedback>{errors.final_price.message}</FormFeedback>}
            </InputGroup>
          </div>
          <div className='mb-1'>
            <Label className='form-label' for='price_finalize_date'>
              Price Finalize Date
            </Label>
            <InputGroup>
            <InputGroupText>
              <Calendar size={15} />
            </InputGroupText>
              <Controller
                id='default-picker1'
                name='price_finalize_date'
                defaultValue=''
                control={control}
                render={({ field: { onChange } }) => <Flatpickr
                        className='form-control flat-picker-input-custom'
                        value={priceFinalliseDate}
                        onChange={(val) => onChange(val, setValue('price_finalize_date', val, { shouldValidate: true }))}
                        options={{
                          dateFormat: 'd-m-Y'
                        }}
                      />}
              />
              {errors.price_finalize_date && <FormFeedback>{"Price Finalize Date is a required field"}</FormFeedback>}
            </InputGroup>
          </div>
          <div className='mb-1'>
            <Label className='form-label' for='price_effective_date'>
              Price Effective Date
            </Label>
            <InputGroup>
            <InputGroupText>
              <Calendar size={15} />
            </InputGroupText>
              <Controller
                id='default-picker'
                name='price_effective_date'
                defaultValue=''
                control={control}                
                render={({ field: { onChange } }) => <Flatpickr
                        className='form-control flat-picker-input-custom'
                        value={priceIncreaseEffectiveDate}
                        onChange={(val) => onChange(val, setValue('price_effective_date', val, { shouldValidate: true }))}
                        options={{
                          dateFormat: 'd-m-Y'
                        }}
                      />}
              />
              {errors.price_effective_date && <FormFeedback>{"Price Effective Date is a required field"}</FormFeedback>}
            </InputGroup>
          </div>
          <div className='mb-1'>
            <Label className='form-label' for='comment'>
              Comment
            </Label>
            <Controller
              id='comment'
              name='comment'
              defaultValue=''
              control={control}
              render={({ field }) => <Input type='textarea' rows='3' {...field} placeholder='Comment' invalid={errors.comment && true} />}
            />
            {errors.comment && <FormFeedback>{"Comment is a required field"}</FormFeedback>}
          </div>
          <Button className='me-1' color='primary' type='submit'>
            Submit
          </Button>
          <Button color='danger' onClick={handleModal} outline>
            Cancel
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  )
}
export default AddBuyerInputModal
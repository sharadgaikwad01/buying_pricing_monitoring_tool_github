// ** React Imports
// ** Third Party Components
import { useState, useEffect} from 'react'
import { currencies } from './countryCurrency'
import { nodeBackend } from '@utils'
import Flatpickr from 'react-flatpickr'
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

const AddNewModal = ({ open, handleModal, supllierNumberOptions, setsupplierInputsData, type }) => {
  // ** State
  // const [Picker, setPicker] = useState('')
  const country = localStorage.getItem('country')
  const vat_number = localStorage.getItem('vat')
  const email = localStorage.getItem('email')

  const [articleOptions, setarticleOptions] = useState([])

  const [newPrice, setNewPrice] = useState('')
  const [reason, setReason] = useState('')
  const [supplierNumber, setSupplierNumber] = useState('')
  const [articleNumber, setArticleNumber] = useState('')
  const [priceIncreaseEffectiveDate, setPriceIncreaseEffectiveDate] = useState([])

  useEffect(async () => {
    await setNewPrice('')
    await setReason('')
    await setSupplierNumber('')
    await setArticleNumber('')
    await setPriceIncreaseEffectiveDate('')
  }, [])

  // ** Custom close btn
  const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />

  const SupplierInputSchema = yup.object().shape({
    new_price: yup.number().required().positive(),
    supplier_number: yup.string().required(),
    article_number: yup.string().required(),
    price_effective_date: yup.array().required()
  })
  // ** Hooks
  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm({ mode: 'onChange', resolver: yupResolver(SupplierInputSchema) })

  const onSubmit = data => {

    const new_price = data.new_price
    const reason = data.reason
    const supplier_number = data.supplier_number
    const article_number = data.article_number
    const effective_date = data.price_effective_date

    const effective_date_arr = []

    effective_date.map(i => {
      const date = new Date(i)

      const year = date.getFullYear()

      let month = (1 + date.getMonth()).toString()
      month = month.length > 1 ? month : `0${month}`

      let day = date.getDate().toString()
      day = day.length > 1 ? day : `0${day}`

      effective_date_arr.push(`${year}-${month}-${day}`)
      return true
    })
    const price_effective_date = effective_date_arr[0]

    setNewPrice('')
    setReason('')
    setSupplierNumber('')
    setArticleNumber('')
    setPriceIncreaseEffectiveDate('')

    handleModal(false)
    
    axios({
      method: "post",
      url: type === 'behalf_of_supplier' ? `${nodeBackend}/add_supplier_input_by_buyer` :  `${nodeBackend}/add_supplier_input`,
      data: { new_price, reason, supplier_number, article_number, country, vat_number, price_effective_date, email}
    })
      .then(function (success) {
        //handle success 
        // console.log(success.data.data)
        setsupplierInputsData(success.data.data.supplierInputs)     
        if (success.data.status) {
          return MySwal.fire({
            title: 'Done!',
            text: 'Request has been added successfully',
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

  const handleSupplierNumberFilter = async (value) => {
    setarticleOptions([{ value: '', label: '' }])
    const supplierNumber = value.value
    if (supplierNumber) {
      await axios.get(`${nodeBackend}/getArticlesBySupplierNumber`, { params: { supplierNumber, country, vat_number} }).then((res) => {
        if (res.data.data) {
          setarticleOptions(res.data.data.articleOptions)
        }      
      })
    }
   
  } 
  const handleModalClose = async () => {
    setNewPrice('')
    setReason('')
    setSupplierNumber('')
    setArticleNumber('')
    setPriceIncreaseEffectiveDate('')
    handleModal(false)
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
        <h5 className='modal-title'>New Record</h5>
      </ModalHeader>
      <ModalBody className='flex-grow-1'>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className='mb-1'>
            <Label className='form-label' for='supplier_number'>
              Supplier Number
            </Label>
            <Controller className="select-custom-wrap"
              name="supplier_number"
              control={control}
              render={({ field: { onChange } }) => (
                <Select
                  options={supllierNumberOptions}
                  className='is-invalid select-custom'
                  classNamePrefix="react-select"
                  value={supllierNumberOptions.find((c) => c.value === supplierNumber)}
                  onChange={(val) => { handleSupplierNumberFilter(val); onChange(val.value) } }
                  theme={(theme) => ({
                    ...theme,
                    borderRadius: '4px',
                    height: "20px",
                    colors: {
                      ...theme.colors,
                      primary: "#003B7E"
                    }
                  })}
                />
              )}
            />
            {errors["supplier_number"] && <FormFeedback>{'Supplier number is a required field'}</FormFeedback>}
          </div>
          <div className='mb-1'>
            <Label className='form-label' for='article_number'>
              Article Number
            </Label>
            <Controller className="select-custom-wrap"
              name="article_number"
              control={control}
              render={({ field: { onChange } }) => (
                <Select
                  options={articleOptions}
                  className='is-invalid select-custom'
                  classNamePrefix="react-select"
                  value={articleOptions.find((c) => c.value === articleNumber)}
                  onChange={(val) => onChange(val.value)}
                  theme={(theme) => ({
                    ...theme,
                    borderRadius: '4px',
                    colors: {
                      ...theme.colors,
                      primary: "#003B7E"
                    }
                  })}
                />
              )}
            />
            {errors["article_number"] && <FormFeedback>{'Article number is a required field'}</FormFeedback>}
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
                render={({ field }) => <Input type="number"{...field} placeholder='e.g. 65.00' value={newPrice} onChange={e => { setNewPrice(e.target.value); setValue('new_price', e.target.value, { shouldValidate: true }) }} invalid={errors.new_price && true} />}
              />
              {errors.new_price && <FormFeedback>{"Requested Price is a required field"}</FormFeedback>}
            </InputGroup>
          </div>
          <div className='mb-1'>
            <Label className='form-label' for='price_effective_date'>
              Requested Price Effective Date
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
                        onChange={(val) => onChange(val)}
                        value={priceIncreaseEffectiveDate}
                        options={{
                          dateFormat: 'd-m-Y'
                        }}
                      />}
              />
              {errors.price_effective_date && <FormFeedback>{"Requested Price Effective Date is a required field"}</FormFeedback>}
            </InputGroup>
          </div>
          <div className='mb-1'>
            <Label className='form-label' for='reason'>
              Reason for price Change
            </Label>
            <Controller
              id='reason'
              name='reason'
              defaultValue=''
              control={control}
              render={({ field }) => <Input type='textarea' rows='5' {...field} placeholder='Reason' value={reason} onChange={e => { console.log(e); setReason(e.target.value);  setValue('reason', e.target.value, { shouldValidate: true }) }} invalid={errors.reason && true} />}
            />
            {errors.reason && <FormFeedback>{"Reason is a required field"}</FormFeedback>}
          </div>
          <Button className='me-1' color='primary' type='submit'>
            Submit
          </Button>
          <Button color='danger'  onClick={() => handleModalClose()} outline>
            Cancel
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default AddNewModal

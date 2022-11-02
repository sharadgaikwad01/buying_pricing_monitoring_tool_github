// ** React Imports
// ** Third Party Components
import { useState, useEffect } from 'react'

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

const AddBuyerInputModal = ({ open, handleModal, rowData }) => {
  // ** State
  // const [Picker, setPicker] = useState('')
  const country = localStorage.getItem('country')

  const [rowId, setRowId] = useState('')

  // ** Custom close btn
  const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />

  const SupplierInputSchema = yup.object().shape({
    final_price: yup.number().required().positive().integer(),
    comment: yup.string().required()
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
      await setRowId(rowData.row_id)      
      setValue('row_id', rowData.row_id)
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
      url: "http://localhost:8080/update_buyer_input",
      data: { row_id, final_price, comment, finalize_date, effective_date, country}
    })
      .then(function (success) {
        //handle success 
        if (success.data.status) {
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
            <Label className='form-label' for='final_price'>
              Final Price
            </Label>
            <InputGroup>
              <InputGroupText>
                €
              </InputGroupText>
              <Controller
                id='final_price'
                name='final_price'
                defaultValue=''
                control={control}
                render={({ field }) => <Input type="number"{...field} placeholder='e.g. 65' invalid={errors.final_price && true} />}
              />
              {errors.final_price && <FormFeedback>{"Final Price is a required field"}</FormFeedback>}
            </InputGroup>
          </div>
          <div className='mb-1'>
            <Label className='form-label' for='price_finalize_date'>
              Price Finalize Date
            </Label>
            <InputGroup>
              <Controller
                id='default-picker1'
                name='price_finalize_date'
                defaultValue=''
                control={control}
                render={({ field }) => <Flatpickr { ...field }
                        className='form-control'
                        options={{
                          dateFormat: 'Y-m-d'
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
              <Controller
                id='default-picker'
                name='price_effective_date'
                defaultValue=''
                control={control}
                render={({ field }) => <Flatpickr { ...field }
                        className='form-control'
                        options={{
                          dateFormat: 'Y-m-d'
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
              render={({ field }) => <Input type='textarea' rows='5' {...field} placeholder='Comment' invalid={errors.comment && true} />}
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

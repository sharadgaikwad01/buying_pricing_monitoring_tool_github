// ** React Imports
// ** Third Party Components
import { useState } from 'react'

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

const AddNewModal = ({ open, handleModal, supllierNumberOptions }) => {
  // ** State
  // const [Picker, setPicker] = useState('')

  const [articleOptions, setarticleOptions] = useState([])

  // ** Custom close btn
  const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />

  const SupplierInputSchema = yup.object().shape({
    new_price: yup.number().required().positive().integer(),
    reason: yup.string().required(),
    supplier_number: yup.string().required(),
    article_number: yup.string().required()
  })
  // ** Hooks
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({ mode: 'onChange', resolver: yupResolver(SupplierInputSchema) })

  const onSubmit = data => {
    const new_price = data.new_price
    const reason = data.reason
    const supplier_number = data.supplier_number
    const article_number = data.article_number

    handleModal(false)
    
    axios({
      method: "post",
      url: "http://localhost:8080/add_supplier_input",
      data: { new_price, reason, supplier_number, article_number }
    })
      .then(function (success) {
        //handle success        
        if (success.data.status) {
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
    await axios.get(`http://localhost:8080/getArticlesBySupplierNumber`, { params: { supplierNumber} }).then((res) => {
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
              render={({ field: { onChange, value } }) => (
                <Select
                  options={supllierNumberOptions}
                  className='is-invalid select-custom'
                  value={supllierNumberOptions.find((c) => c.value === value)}
                  onChange={(val) => { handleSupplierNumberFilter(val); onChange(val.value) } }
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
              render={({ field: { onChange, value } }) => (
                <Select
                  options={articleOptions}
                  className='is-invalid select-custom'
                  value={articleOptions.find((c) => c.value === value)}
                  onChange={(val) => onChange(val.value)}
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
                defaultValue=''
                control={control}
                render={({ field }) => <Input type="number"{...field} placeholder='e.g. 65' invalid={errors.new_price && true} />}
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
              render={({ field }) => <Input type='textarea' rows='3' {...field} placeholder='Reason' invalid={errors.reason && true} />}
            />
            {errors.reason && <FormFeedback>{"Reason is a required field"}</FormFeedback>}
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

export default AddNewModal

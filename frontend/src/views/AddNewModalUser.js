// ** React Imports
// ** Third Party Components
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

const AddNewModal = ({ open, handleModal }) => {
  // ** State
  // const [Picker, setPicker] = useState('')

  // ** Custom close btn
  const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />

  const SupplierInputSchema = yup.object().shape({
    name: yup.string().required(),
    email: yup.string().required().email(),
    emp_id: yup.string().required().test('len', 'Must be exactly 8 characters', val => val.length === 8),
    user_role: yup.string().required(),
    user_type: yup.string().required()
  })

  // ** Hooks
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({ mode: 'onChange', resolver: yupResolver(SupplierInputSchema) })

  const onSubmit = data => {
    const name = data.name
    const email = data.email
    const emp_id = data.emp_id
    const user_role = data.user_role
    const user_type = data.user_type

    handleModal(false)
    
    axios({
      method: "post",
      url: "http://localhost:8080/add_user_input",
      data: { name, email, emp_id, user_role, user_type }
    })
      .then(function (success) {
        //handle success        
        if (success.data.status) {
          return MySwal.fire({
            title: 'Done!',
            text: 'User Created Successfully!',
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

  const RoleOptions = [
    { value: 'Admin', label: 'Admin' },
    { value: 'User', label: 'User' }
  ]

  const user_typeOptions = [
    { value: 'buyer', label: 'Buyer' },
  { value: 'supplier', label: 'Supplier' }
  ]

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
            <Label className='form-label' for='user_role'>
              Role
            </Label>
            <Controller
              name="user_role"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  options={RoleOptions}
                  className='is-invalid'
                  value={RoleOptions.find((c) => c.value === value)}
                  onChange={(val) => onChange(val.value)}
                />
              )}
            />
            {errors["user_role"] && <FormFeedback>{'Role is a required field'}</FormFeedback>}
          </div>
          
          <div className='mb-1'>
            <Label className='form-label' for='name'>
              Name
            </Label>
            <InputGroup>
              
              <Controller
                id='name'
                name='name'
                defaultValue=''
                control={control}
                render={({ field }) => <Input type="text"{...field} placeholder='Name' invalid={errors.name && true} />}
              />
              {errors.name && <FormFeedback>{"Name is a required field"}</FormFeedback>}
            </InputGroup>
          </div>

          <div className='mb-1'>
            <Label className='form-label' for='email'>
              Email
            </Label>
            <InputGroup>
              
              <Controller
                id='email'
                name='email'
                defaultValue=''
                control={control}
                render={({ field }) => <Input type="text"{...field} placeholder='Email' invalid={errors.email && true} />}
              />
              <Controller
                id='id'
                name='id'
                defaultValue=''
                control={control}
                render={({ field }) => <Input type="hidden"{...field} placeholder='id' invalid={errors.id && true} />}
              />
              {errors.email && <FormFeedback>{"Email is a required field"}</FormFeedback>}
            </InputGroup>
          </div>

          <div className='mb-1'>
            <Label className='form-label' for='emp_id'>
              Employee ID
            </Label>
            <InputGroup>
              
              <Controller
                id='emp_id'
                name='emp_id'
                defaultValue=''
                control={control}
                render={({ field }) => <Input type="text"{...field} placeholder='Employee ID' invalid={errors.emp_id && true} />}
              />
              {errors.emp_id && <FormFeedback>{"Employee ID is a required & must be 8 Digit"}</FormFeedback>}
            </InputGroup>
          </div>

          <div className='mb-1'>
            <Label className='form-label' for='user_type'>
              User type
            </Label>
            <Controller
              name="user_type"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  options={user_typeOptions}
                  className='is-invalid'
                  value={user_typeOptions.find((c) => c.value === value)}
                  onChange={(val) => onChange(val.value)}
                />
              )}
            />
            {errors["user_type"] && <FormFeedback>{'User type is a required field'}</FormFeedback>}
          </div>
          
          <Button className='me-1' color='primary' type='submit'>
            Submit
          </Button>
          <Button color='secondary' onClick={handleModal} outline>
            Cancel
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default AddNewModal

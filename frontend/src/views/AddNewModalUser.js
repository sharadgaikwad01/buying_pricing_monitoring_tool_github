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

import { useState, useEffect } from 'react'
const MySwal = withReactContent(Swal)


const AddNewModalUser = ({ open, handleModal, rowData, setUsersInputsData }) => {
  // const [UserData, setUsersData] = useState({user_name:'', email:'', user_id:'', emp_id:'', row_id:''})
  const [NameValue, setNameValue] = useState('')
  const [EmailValue, setEmailValue] = useState('')
  const [UserTypeValue, setUserTypeValue] = useState('')
  const [UserRoleValue, setUserRoleValue] = useState('')
  const [UserEmpIdValue, setUserEmpIdValue] = useState('')
  const [UserIdValue, setUserIdValue] = useState(0)

  const validationSchema = yup.object().shape({
    user_name: yup.string().required(),
    email: yup.string().required().email(),
    // emp_id: yup.string().required().test('len', 'Must be exactly 8 characters', val => val.length === 8),
    emp_id: yup.string().required(),
    user_role: yup.string().required(),
    user_type: yup.string().required()
  })

  const {
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ mode: 'onChange', resolver: yupResolver(validationSchema) })
  // console.log(rowData)

  useEffect(async () => {
    // setUsersData(rowData)
    if (rowData.user_name) {
      await setNameValue(rowData.user_name)
      setValue('user_name', rowData.user_name, { shouldValidate:true })
    }

    if (rowData.email) {
      await setEmailValue(rowData.email)
      setValue('email', rowData.email)
    }

    if (rowData.user_type) {
      await setUserTypeValue(rowData.user_type)
      setValue('user_type', rowData.user_type)
    }
    if (rowData.user_role) {
      await setUserRoleValue(rowData.user_role)
      setValue('user_role', rowData.user_role)
    } 
    if (rowData.metro_id) {
      await setUserEmpIdValue(rowData.metro_id)
      setValue('emp_id', rowData.metro_id)
    }
    if (rowData.row_id) {
      await setUserIdValue(rowData.row_id)
      setValue('user_id', rowData.row_id)
    }
    // setEmailValue(rowData.email)
  }, [rowData])
  const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />

  const onSubmit = data => {
    const user_name = data.user_name
    const email = data.email
    const emp_id = data.emp_id
    const user_role = data.user_role
    const user_type = data.user_type
    const user_id = data.user_id

    handleModal(false)
    axios({
      method: "post",
      url: "http://10.16.148.18:81/add_user_input",
      data: { user_name, email, emp_id, user_role, user_type, user_id }
    })
      .then(async function (success) {
        //handle success        
        if (success.status) {
          await setUsersInputsData(success.data.data.users)
          if (user_id) {
            return MySwal.fire({
              title: 'Done!',
              text: 'User Updated Successfully!',
              icon: 'success',
              customClass: {
                confirmButton: 'btn btn-primary'
              },
              buttonsStyling: false
            })
          } else {
            return MySwal.fire({
              title: 'Done!',
              text: 'User Created Successfully!',
              icon: 'success',
              customClass: {
                confirmButton: 'btn btn-primary'
              },
              buttonsStyling: false
            })
          }
          
          
          // // axios.get(`http://10.16.148.18:81/users`, { params: { searchName, searchStatus, searchRole } }).then((res) => {
          // //   console.log(res.data.data)
          // setUsersInputsData(res.data.data.users)  
          // })
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
        <Form onSubmit={handleSubmit(onSubmit)} onReset={reset}>
          <div className='mb-1'>
            <Label className='form-label' for='user_role'>
              Role
            </Label>
            <Controller  className="select-custom-wrap"
              name="user_role"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  options={RoleOptions}
                  className='is-invalid select-custom'
                  classNamePrefix="react-select"
                  value={RoleOptions.find((c) => c.value === value)}
                  onChange={(val) => { onChange(val.value); setValue('user_role', val.value) } }
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
                id='user_name'
                name='user_name'
                defaultValue=''
                control={control}
                render={({ field }) => <Input type="text"{...field} placeholder='user_name' value={NameValue} onChange={(e) => { setNameValue(e.target.value); setValue('user_name', e.target.value) } }  invalid={errors.user_name && true} />}
              />
              {errors.user_name && <FormFeedback>{"Name is a required field"}</FormFeedback>}
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
                render={({ field }) => <Input type="text"{...field} placeholder='Email' value={EmailValue} onChange={(e) => { setEmailValue(e.target.value); setValue('email', e.target.value) } }  invalid={errors.email && true} />}
              />
              <Controller
                id='user_id'
                name='user_id'
                defaultValue='0'
                control={control}
                render={({ field }) => <Input type="hidden"{...field} placeholder='user_id' value={UserIdValue}  invalid={errors.user_id && true}/>}
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
                render={({ field }) => <Input type="text"{...field} placeholder='Employee ID' value={UserEmpIdValue} invalid={errors.emp_id && true} />}
              />
              {errors.emp_id && <FormFeedback>{"Employee ID is a required & must be 8 Digit"}</FormFeedback>}
            </InputGroup>
          </div>

          <div className='mb-1'>
            <Label className='form-label' for='user_type'>
              User type
            </Label>
            <Controller className="select-custom-wrap"
              name="user_type"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  options={user_typeOptions}
                  className='is-invalid select-custom'
                  classNamePrefix="react-select"
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
          <Button color='danger' onClick={handleModal} outline>
            Cancel
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default AddNewModalUser

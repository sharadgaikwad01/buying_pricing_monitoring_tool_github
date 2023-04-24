// ** React Imports
// ** Third Party Components
import { User, Briefcase, Mail, Calendar, DollarSign, X } from 'react-feather'

import axios from 'axios'
import Select, { ActionMeta, OnChangeValue, StylesConfig } from 'react-select'
import { nodeBackend } from '@utils'
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

const AddNewModalBuyer = ({ open, handleModal, rowData, articalNumberOptions, countryOptions, deptOptions, setUsersInputsData }) => {

  const [DepartmentValue, setDepartmentValue] = useState('')
  const [FNameValue, setFNameValue] = useState('')
  const [LNameValue, setLNameValue] = useState('')
  const [UserValue, setUserValue] = useState(0)
  const [EmailValue, setEmailValue] = useState('')
  const [selectedOptions, setselectedOptions] = useState('')
  
 
  const [CountryValue, setCountryValue] = useState('')

  const validationSchema = yup.object().shape({
    first_name: yup.string().required(),
    last_name: yup.string().required(),
    buyer_emailid: yup.string().required().email(),
    // emp_id: yup.string().required().test('len', 'Must be exactly 8 characters', val => val.length === 8),
    dept_name: yup.string().required(),
    country_name: yup.string().required()
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
      console.log(rowData)
      if (rowData.first_name) {
        await setFNameValue(rowData.first_name)
        setValue('first_name', `${rowData.first_name}`, { shouldValidate:true })
  
        await setLNameValue(rowData.last_name)
        setValue('last_name', `${rowData.last_name}`, { shouldValidate:true })
      
        await setDepartmentValue(rowData.dept_name)
        setValue('dept_name', rowData.dept_name, { shouldValidate:true })
  
        await setCountryValue(rowData.country_name)
        setValue('country_name', rowData.country_name)
      
        await setEmailValue(rowData.buyer_emailid)
        setValue('buyer_emailid', rowData.buyer_emailid)
      } else {
        setFNameValue(rowData.first_name)
        setValue('first_name', `${rowData.first_name}`)
  
        setLNameValue(rowData.last_name)
        setValue('last_name', `${rowData.last_name}`)
      
        setDepartmentValue(rowData.dept_name)
        setValue('dept_name', rowData.dept_name)
  
        setCountryValue(rowData.country_name)
        setValue('country_name', rowData.country_name)
      
        setEmailValue(rowData.buyer_emailid)
        setValue('buyer_emailid', rowData.buyer_emailid)
      }
      
      
      await setUserValue(rowData.user_id)
   
      if (rowData.stratbuyer_name) {
          console.log(rowData.stratbuyer_name.split(','))
          const articalIDOptions = []
          rowData.stratbuyer_name.split(',').forEach(item => {
            articalIDOptions.push({ value: item, label: item })
          })
        await setselectedOptions(articalIDOptions)
        setValue('stratbuyer_name', articalIDOptions)
      } else {
        await setselectedOptions('')
        setValue('stratbuyer_name', '')
      }

    // setEmailValue(rowData.email)
  }, [rowData])

  const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />

  const onSubmit = data => {
    console.log(data)
    const first_name = data.first_name
    const last_name = data.last_name
    const dept_name = data.dept_name
    const buyer_emailid = data.buyer_emailid
    // const active_status = data.active_status
    const country_name = data.country_name
    const stratbuyer_name = data.stratbuyer_name

    handleModal(false)
    axios({
      method: "post",
      url: `${nodeBackend}/buyers_add_input`,
      data: { first_name, last_name, dept_name, buyer_emailid, stratbuyer_name, country_name }
    })
      .then(async function (success) {
        //handle success
        console.log(success)     
        if (success.status) {
          setUsersInputsData(success.data.data)
          if (UserValue) {
            return MySwal.fire({
              title: 'Done!',
              text: 'Buyer Updated Successfully!',
              icon: 'success',
              customClass: {
                confirmButton: 'btn btn-primary'
              },
              buttonsStyling: false
            })
          } else {
            return MySwal.fire({
              title: 'Done!',
              text: 'Buyer Created Successfully!',
              icon: 'success',
              customClass: {
                confirmButton: 'btn btn-primary'
              },
              buttonsStyling: false
            })
          }
      
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

  // const active_statusOptions = [
  //   { value: 'active', label: 'Active' },
  //   { value: 'inactive', label: 'InActive' }
  // ]

  const handleChange = async (val) => {
    await setselectedOptions(val)
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
        <Form onSubmit={handleSubmit(onSubmit)} onReset={reset}>

          <div className='mb-1'>
            <Label className='form-label' for='first_name'>
              First Name
            </Label>
            <InputGroup>
              <Controller
                id='first_name'
                name='first_name'
                defaultValue=''
                control={control}
                render={({ field }) => <Input type="text"{...field} placeholder='First name' value={FNameValue} onChange={(e) => { setFNameValue(e.target.value); setValue('first_name', e.target.value, { shouldValidate: true }) } }  invalid={errors.first_name && true} />}
              />
              {errors.first_name && <FormFeedback>{"First Name is a required field"}</FormFeedback>}
            </InputGroup>
          </div>

          <div className='mb-1'>
            <Label className='form-label' for='last_name'>
              Last Name
            </Label>
            <InputGroup>
              <Controller
                id='last_name'
                name='last_name'
                defaultValue=''
                control={control}
                render={({ field }) => <Input type="text"{...field} placeholder='Last name' value={LNameValue} onChange={(e) => { setLNameValue(e.target.value); setValue('last_name', e.target.value, { shouldValidate: true }) } }  invalid={errors.last_name && true} />}
              />
              {errors.last_name && <FormFeedback>{"Last Name is a required field"}</FormFeedback>}
            </InputGroup>
          </div>

          <div className='mb-1'>
            <Label className='form-label' for='buyer_emailid'>
              Email
            </Label>
            <InputGroup>
              
              <Controller
                id='buyer_emailid'
                name='buyer_emailid'
                defaultValue=''
                control={control}
                render={({ field }) => <Input type="text"{...field} placeholder='Email' value={EmailValue} onChange={(e) => { setEmailValue(e.target.value); setValue('buyer_emailid', e.target.value) } }  invalid={errors.buyer_emailid && true} />}
              />
              
              {errors.buyer_emailid && <FormFeedback>{"Email is a required field"}</FormFeedback>}
            </InputGroup>
          </div>
          
          <div className='mb-1'>
            <Label className='form-label' for='dept_name'>
              Department
            </Label>
            <Controller
              name="dept_name"
              id="dept_name"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  options={deptOptions}
                  value={deptOptions.find((c) => c.value === value)}
                  // isSearchable={true}
                  onChange={(val) => onChange(val.value)}
                  // onChange={(val) => onChange(val, handleChange(val))}
                />
              )}
            />
            {errors["dept_name"] && <FormFeedback>{'Department is a required field'}</FormFeedback>}
          </div>

          <div className='mb-1'>
            <Label className='form-label' for='country_name'>
              Country
            </Label>
            <Controller
              name="country_name"
              id="country_name"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  options={countryOptions}
                  value={countryOptions.find((c) => c.value === value)}
                  // isSearchable={true}
                  onChange={(val) => onChange(val.value)}
                  // onChange={(val) => onChange(val, handleChange(val))}
                />
              )}
            />
            {errors["country_name"] && <FormFeedback>{'countryName is a required field'}</FormFeedback>}
          </div>

          <div className='mb-1'>
            <Label className='form-label' for='stratbuyer_name'>
              Article Name
            </Label>
            <Controller
              name="stratbuyer_name"
              id="stratbuyer_name"
              control={control}
              render={({ field: { onChange } }) => (
                <Select
                  options={articalNumberOptions}
                  // defaultValue = { selectedOptions }           
                  value={selectedOptions}
                  isMulti={true}
                  isSearchable={true}
                  onChange={(val) => onChange(val, handleChange(val))}
                />
              )}
            />
            {errors["stratbuyer_name"] && <FormFeedback>{'Article number is a required field'}</FormFeedback>}
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

export default AddNewModalBuyer

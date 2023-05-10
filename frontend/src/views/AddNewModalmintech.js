// ** React Imports
// ** Third Party Components
import { User, Briefcase, Mail, Calendar, DollarSign, X } from 'react-feather'

import axios from 'axios'
import Select from 'react-select'
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

const AddNewModalUser = ({open, handleModal, rowData, CategoryOptions, CountryOptions, setUsersInputsData, searchName, searchCategory, searchCountry}) => {
  // const [UserData, setUsersData] = useState({user_name:'', email:'', user_id:'', emp_id:'', row_id:''})
  // const [NameValue, setNameValue] = useState('')
  // const [EmailValue, setEmailValue] = useState('')
  // const [UserTypeValue, setUserTypeValue] = useState('')
  // const [UserRoleValue, setUserRoleValue] = useState('')
  // const [UserEmpIdValue, setUserEmpIdValue] = useState('')
  // const [UserIdValue, setUserIdValue] = useState(0)

  const [Region, setRegion] = useState('')
  const [dashboard_nameValue, setdashboard_nameValue] = useState('')
  const [dashboard_urlValue, setdashboard_urlValue] = useState('')
  const [CountryValue, setCountryValue] = useState('')
  const [CategoryValue, setCategoryValue] = useState('')
  const [SubCategoryValue, setSubCategoryValue] = useState('')
  // const [lastName, setLastName] = useState('')

  const validationSchema = yup.object().shape({
    country_name: yup.string().required(),
    // last_name: yup.string().required(),
    // user_name: yup.string().required(),
    // email: yup.string().required().email(),
    // emp_id: yup.string().required().test('len', 'Must be exactly 8 characters', val => val.length === 8),
    // emp_id: yup.string().required(),
    region: yup.string().required(),
    dashboard_name: yup.string().required(),
    categroy: yup.string().required(),
    sub_categroy: yup.string().required()
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
      await setCountryValue(rowData.country_name)
      setValue('country_name', rowData.country_name)
      
      await setRegion(rowData.region)
      setValue('region', rowData.region)

      await setdashboard_urlValue(rowData.dashboard_name)
      setValue('dashboard_name', rowData.dashboard_name)
      
      await setdashboard_urlValue(rowData.dashboard_url)
      setValue('dashboard_url', rowData.dashboard_url)

      await setCategoryValue(rowData.categroy)
      setValue('categroy', rowData.categroy)
      
      await setSubCategoryValue(rowData.sub_categroy)
      setValue('sub_categroy', rowData.sub_categroy)

      // await setEmailValue(rowData.email)
      // setValue('email', rowData.email)

      // await setUserTypeValue(rowData.user_type)
      // setValue('user_type', rowData.user_type)

      // await setUserRoleValue(rowData.user_role)
      // setValue('user_role', rowData.user_role)

      // await setUserEmpIdValue(rowData.metro_id)
      // setValue('emp_id', rowData.metro_id)

      // await setUserIdValue(rowData.row_id)
      // setValue('user_id', rowData.row_id)
    // setEmailValue(rowData.email)
  }, [rowData])

  const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />

  const onSubmit = data => {
    const region = data.region
    const country_name = data.country_name
    const dashboard_url = data.dashboard_url
    const dashboard_name = data.dashboard_name
    const categroy = data.categroy
    const sub_categroy = data.sub_categroy
    const created_by = localStorage.getItem('email')

    handleModal(false)
    axios({
      method: "post",
      url: `${nodeBackend}/add_mintech_input`,
      data: { region, dashboard_url, dashboard_name, categroy, sub_categroy, country_name, created_by, searchName, searchCountry, searchCategory }
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
            <Label className='form-label' for='country_name'>
              Country
            </Label>
            <Controller
              name="country_name"
              id="country_name"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  options={CountryOptions}
                  value={CountryOptions.find((c) => c.value === value)}
                  // isSearchable={true}
                  onChange={(val) => onChange(val.value)}
                  // onChange={(val) => onChange(val, handleChange(val))}
                />
              )}
            />
            {errors["country_name"] && <FormFeedback>{'countryName is a required field'}</FormFeedback>}
          </div>


          <div className='mb-1'>
            <Label className='form-label' for='region'>
              Region
            </Label>
            <InputGroup>
              <Controller
                id='region'
                name='region'
                defaultValue=''
                control={control}
                render={({ field }) => <Input type="text"{...field} placeholder='Region' value={Region} onChange={(e) => { setRegion(e.target.value); setValue('region', e.target.value, { shouldValidate: true }) } }  invalid={errors.region && true} />}
              />
              {errors.first_name && <FormFeedback>{"Region is a required field"}</FormFeedback>}
            </InputGroup>
          </div>
          
          <div className='mb-1'>
            <Label className='form-label' for='dashboard_name'>
            Dashboard Name
            </Label>
            <InputGroup>
              <Controller
                id='dashboard_name'
                name='dashboard_name'
                defaultValue=''
                control={control}
                render={({ field }) => <Input type="text"{...field} placeholder='Dashboard name' value={dashboard_nameValue} onChange={(e) => { setdashboard_nameValue(e.target.value); setValue('dashboard_name', e.target.value, { shouldValidate: true }) } }  invalid={errors.dashboard_name && true} />}
              />
              {errors.dashboard_name && <FormFeedback>{"Dashboard name is a required field"}</FormFeedback>}
            </InputGroup>
          </div>
          
          <div className='mb-1'>
            <Label className='form-label' for='dashboard_url'>
            Dashboard URL
            </Label>
            <InputGroup>
              <Controller
                id='dashboard_url'
                name='dashboard_url'
                defaultValue=''
                control={control}
                render={({ field }) => <Input type="text"{...field} placeholder='Dashboard URL' value={dashboard_urlValue} onChange={(e) => { setdashboard_urlValue(e.target.value); setValue('dashboard_url', e.target.value, { shouldValidate: true }) } }  invalid={errors.dashboard_url && true} />}
              />
              {errors.dashboard_url && <FormFeedback>{"Dashboard URL is a required field"}</FormFeedback>}
            </InputGroup>
          </div>

          <div className='mb-1'>
            <Label className='form-label' for='category'>
             Category
            </Label>
            <Controller category="select-custom-wrap"
              name="categroy"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  options={CategoryOptions}
                  className='is-invalid select-custom'
                  classNamePrefix="react-select"
                  value={CategoryOptions.find((c) => c.value === value)}
                  onChange={(val) => onChange(val.value)}
                  
                />
              )}
            />
            {errors["categroy"] && <FormFeedback>{'Category is a required field'}</FormFeedback>}
          </div>

          <div className='mb-1'>
            <Label className='form-label' for='sub_category'>
             Sub Category
            </Label>
            <Controller category="select-custom-wrap"
              name="sub_category"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  options={CategoryOptions}
                  className='is-invalid select-custom'
                  classNamePrefix="react-select"
                  value={CategoryOptions.find((c) => c.value === value)}
                  onChange={(val) => onChange(val.value)}
                  
                />
              )}
            />
            {errors["sub_category"] && <FormFeedback>{'sub_category is a required field'}</FormFeedback>}
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

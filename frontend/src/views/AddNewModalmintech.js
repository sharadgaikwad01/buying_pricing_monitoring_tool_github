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
import  secureLocalStorage  from  "react-secure-storage"

const MySwal = withReactContent(Swal)

const AddNewModalUser =  ({open, handleModal, rowData, CategoryOptions, setUsersInputsData, searchName, searchCategory}) => {
  // const [UserData, setUsersData] = useState({user_name:'', email:'', user_id:'', emp_id:'', row_id:''})
  // const [NameValue, setNameValue] = useState('')
  // const [EmailValue, setEmailValue] = useState('')
  // const [UserTypeValue, setUserTypeValue] = useState('')
  // const [UserRoleValue, setUserRoleValue] = useState('')
  // const [UserEmpIdValue, setUserEmpIdValue] = useState('')
  const [UserIdValue, setUserIdValue] = useState(0)

  // const [Region, setRegion] = useState('')
  const [dashboard_nameValue, setdashboard_nameValue] = useState('')
  const [dashboard_urlValue, setdashboard_urlValue] = useState('')
  // const [CountryValue, setCountryValue] = useState('')
  const [CategoryValue, setCategoryValue] = useState('')
  const [SubCategoryValue, setSubCategoryValue] = useState('')
  // const [lastName, setLastName] = useState('')
  const URL = /^((https?|ftp):\/\/)?(www.)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i

  // Yup.string().matches(URL, 'Enter a valid url')
  const validationSchema = yup.object().shape({
    // country_name: yup.string().required(),
    // last_name: yup.string().required(),
    // user_name: yup.string().required(),
    // email: yup.string().required().email(),
    // emp_id: yup.string().required().test('len', 'Must be exactly 8 characters', val => val.length === 8),
    // emp_id: yup.string().required(),
    // region: yup.string().required(),
    dashboard_name: yup.string().required(),
    stratbuyer_category: yup.string().required(),
    dashboard_url: yup.string().required().matches(URL, 'Enter a valid url')
    // mintec_sub_category: yup.string().required()
  })

  const {
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ mode: 'onChange', resolver: yupResolver(validationSchema) })

  useEffect(async () => {
    // console.log(rowData.stratbuyer_id)
    
    // setUsersData(rowData)
      // await setCountryValue(rowData.country_name)
      // setValue('country_name', rowData.country_name)
      // await setRegion(rowData.region)
      // setValue('region', rowData.region)
      if (rowData.dashboard_name) {

      // console.log(rowData.stratbuyer_category.trim())
      // console.log(rowData)
      setdashboard_nameValue(rowData.dashboard_name)
      setValue('dashboard_name', rowData.dashboard_name, { shouldValidate:true })
      
      setdashboard_urlValue(rowData.dashboard_url)
      setValue('dashboard_url', rowData.dashboard_url, { shouldValidate:true })

      setCategoryValue(rowData.stratbuyer_category.trim())
      setValue('stratbuyer_category', rowData.stratbuyer_category.trim(), { shouldValidate:true })
      // setValue('stratbuyer_category', rowData.stratbuyer_category.trim(), { shouldValidate: true })
      
      setSubCategoryValue(rowData.mintec_sub_category)
      setValue('mintec_sub_category', rowData.mintec_sub_category)

      setUserIdValue(rowData.id)
      } else {

      setdashboard_nameValue(rowData.dashboard_name)
      setValue('dashboard_name', rowData.dashboard_name)
      
      setdashboard_urlValue(rowData.dashboard_url)
      setValue('dashboard_url', rowData.dashboard_url)

      setCategoryValue(rowData.stratbuyer_category)
      setValue('stratbuyer_category', rowData.stratbuyer_category)
      
      setSubCategoryValue(rowData.mintec_sub_category)
      setValue('mintec_sub_category', rowData.mintec_sub_category)

      setUserIdValue(rowData.id)
      }
      //setValue('user_id', rowData.row_id)
    // setEmailValue(rowData.email)
  }, [rowData])

  const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />

  const onSubmit = data => {
    // const region = data.region
    // const country_name = data.country_name
    const user_id = UserIdValue
    const dashboard_url = data.dashboard_url
    const dashboard_name = data.dashboard_name
    const stratbuyer_category = data.stratbuyer_category
    const mintec_sub_category = data.mintec_sub_category
    const created_by = secureLocalStorage.getItem('email')
    const is_deleted = '0'

    handleModal(false)
    axios({
      method: "post",
      url: `${nodeBackend}/add_mintech_input`,
      data: { user_id, dashboard_url, dashboard_name, stratbuyer_category, mintec_sub_category, created_by, searchName, searchCategory, is_deleted }
    })
      .then(async function (success) {
        //handle success        
        if (success.status) {
          await setUsersInputsData(success.data.data.users)
          if (user_id) {
            return MySwal.fire({
              title: 'Done!',
              text: 'Mintech data Updated Successfully!',
              icon: 'success',
              customClass: {
                confirmButton: 'btn btn-primary'
              },
              buttonsStyling: false
            })
          } else {
            return MySwal.fire({
              title: 'Done!',
              text: 'Mintech data Created Successfully!',
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

          {/* <div className='mb-1'>
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
          </div> */}

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
            <Label className='form-label' for='stratbuyer_category'>
             Category
            </Label>
            <Controller
              name="stratbuyer_category"
              id="stratbuyer_category"
              defaultValue={CategoryValue}
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  options={CategoryOptions}
                  // value={CategoryValue}
                  value={CategoryOptions.find((c) => c.value.trim() === value.trim())}
                  // isSearchable={true}
                  // onChange={(val) => onChange(val.value)}
                  onChange={(val) => { setCategoryValue(val.value); onChange(val.value); setValue('stratbuyer_category', val.value, { shouldValidate: true }) }}
                />
              )}
            />
            {errors["stratbuyer_category"] && <FormFeedback>{'Category is a required field'}</FormFeedback>}
          </div>

          <div className='mb-1'>
            <Label className='form-label' for='mintec_sub_category'>
            Sub Category
            </Label>
            <InputGroup>
              <Controller
                id='mintec_sub_category'
                name='mintec_sub_category'
                defaultValue=''
                control={control}
                render={({ field }) => <Input type="text"{...field} placeholder='Sub Category' value={SubCategoryValue} onChange={(e) => { setSubCategoryValue(e.target.value); setValue('mintec_sub_category', e.target.value, { shouldValidate: true }) } }  invalid={errors.mintec_sub_category && true} />}
              />
              {errors.mintec_sub_category && <FormFeedback>{"Sub Category is a required field"}</FormFeedback>}
            </InputGroup>
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

// ** Table Data & Columns
// import { columns } from './dataUsers'
import { Fragment, useState, forwardRef, useEffect } from 'react'
import Select from 'react-select'

import { nodeBackend } from '@utils'
import axios from 'axios'

// ** Add New Modal Component
import Flatpickr from 'react-flatpickr'
import AddNewModalBuyer from './AddNewModalBuyer'
// import DownloadArticliesModal from './DownloadArticlesModal'
// import UploadArticliesModal from './UploadArticliesModal'
import ReactPaginate from 'react-paginate'
import DataTable from 'react-data-table-component'
import { Download, Search, ChevronDown, Share, Printer, FileText, File, Grid, Copy, Plus, Upload, Edit, Trash} from 'react-feather'

import '@styles/react/libs/tables/react-dataTable-component.scss'
import '@styles/react/libs/flatpickr/flatpickr.scss'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

// ** Reactstrap Imports
import {
  Row,
  Badge,
  Col,
  Card,
  Input,
  Label,
  Button,
  CardTitle,
  CardBody,
  CardHeader,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  UncontrolledButtonDropdown
} from 'reactstrap'

const MySwal = withReactContent(Swal)

// const user_statusOptions = [
//   { value: 'active', label: 'Active' },
//   { value: 'inactive', label: 'InActive' }
// ]

const BootstrapCheckbox = forwardRef((props, ref) => (
  <div className='form-check'>
    <Input type='checkbox' ref={ref} {...props} />
  </div>
))

const Buyerslog = props => {
  // ** States

  const [UsersInputsData, setUsersInputsData] = useState([])
  
  const [searchEmail, setsearchEmail] = useState('')
 
  // const [searchRequestedDate, setSearchRequestedDate] = useState('')
  // const [Status, setStatus] = useState('')
  // const [searchRole, setsearchRole] = useState('')

  
  // 
  // const [supplierInputModal, setSupplierInputModal] = useState(false)
  // const [uploadArticleModal, setUploadArticleModal] = useState(false)

  const [currentPage, setCurrentPage] = useState(0)
  
  // const [countryOptions, setcountryOptions] = useState([])

  // const downloadArticleModal = () => setSupplierInputModal(!supplierInputModal)
  const [UserData] = useState({first_name:'', last_name:'', dept_name:'',  buyer_emailid:'', user_id:0, stratbuyer_name:'', country_name: ''})
  // const handleUploadArticleModal = () => setUploadArticleModal(!uploadArticleModal)
  // ** Function to handle Pagination
  const handlePagination = page => {
    setCurrentPage(page.selected)
  }
  const handlebuyers = () => {
    props.history.push('/mintech')
  }
   
  useEffect(async () => {
  const user_type = localStorage.getItem("type")
    if (user_type === '') {
      props.history.push('/buyer_login')
    }
    if (user_type === 'BUYER') {
      props.history.push('/buyer_input')
    }
    if (user_type === 'SUPPLIER') {
      props.history.push('/home')
    }
    if (user_type === 'ADMIN') {
      props.history.push('/dashboard')
    }

    await axios.get(`${nodeBackend}/buyers_log`, { params: { searchEmail } }).then((res) => {
     
      setUsersInputsData(res.data.data)  
       
      // setcountryOptions(res.data.countryoptions)  
     
    })
  }, [])

  const dataToRender = () => {
    return UsersInputsData
  }

  // ** Custom Pagination
  const CustomPagination = () => (
    <ReactPaginate
      previousLabel=''
      nextLabel=''
      forcePage={currentPage}
      onPageChange={page => handlePagination(page)}
      pageCount={Math.ceil(dataToRender().length / 10) || 1}
      breakLabel='...'
      pageRangeDisplayed={2}
      marginPagesDisplayed={2}
      activeClassName='active'
      pageClassName='page-item'
      breakClassName='page-item'
      nextLinkClassName='page-link'
      pageLinkClassName='page-link'
      breakLinkClassName='page-link'
      previousLinkClassName='page-link'
      nextClassName='page-item next-item'
      previousClassName='page-item prev-item'
      containerClassName='pagination react-paginate separated-pagination pagination-sm justify-content-end pe-1 mt-1'
    />
  )


  // ** Function to handle supplier filter
  // const handleNameFilter = async (e) => {
  //   const searchName = e.target.value
  //   setsearchName(searchName)
  //   await axios.get(`${nodeBackend}/buyers`, { params: { searchName, searchEmail } }).then((res) => {
  //     setUsersInputsData(res.data.data)
  //   })
  // } 
  const handleEmailFilter = async (e) => {
    const searchEmail = e.target.value
    setsearchEmail(searchEmail)
    await axios.get(`${nodeBackend}/buyers`, { params: { searchEmail } }).then((res) => {
      setUsersInputsData(res.data.data)
    })
  }


  // ** Function to handle status filter
  // const handleStatusFilter = async (e) => {
  //   const Status = e.value
  //   setStatus(Status)
  //   await axios.get(`${nodeBackend}/buyers`, { params: { searchName, Status } }).then((res) => {
  //     setUsersInputsData(res.data.data)
  //   })
  // }
  
  const handleAdd = async () => {
    props.history.push('/buyers')
  }

  // ** Table Common Column
  const columns = [
    {
      name: 'Sr. No',
      width: "80px",
      sortable: true,
      // cell: (row, index) => index + 1
      cell: (row, index) => (currentPage * 10) + index + 1
    },
  
    {
      name: 'Email',
      sortable: true,
      selector: row => row.email
    },
   
    {
      name: 'Country',
      sortable: true,
      selector: row => row.country_name
    },
    {
      name: 'Details',
      sortable: true,
      selector: row => row.comments
    },
    {
      name: 'Created',
      sortable: true,
      selector: row => row.created_on
    }
  ]

  return (
    <Fragment>
      <Card className='pageBox user-screen'>
        <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
          <CardTitle tag='h2'>Buyers Data</CardTitle>
          <div className='d-flex mt-md-0 mt-1 btn-row'>
            <Button.Ripple className='ms-2 btn-icon' color='primary' onClick={handleAdd}>
              <Plus size={16} />
              <span className='align-middle ms-25'>Buyers</span>
            </Button.Ripple>
            <Button.Ripple className='ms-2' outline color='warning' onClick={handlebuyers}>
              <Download size={14} />
               <span className='align-middle ms-25'>Mintech Master</span> 
            </Button.Ripple>
           
          </div>
        </CardHeader>
        <CardBody>
          <Row className='g-1 filter-row'>

            <Col className='mb-1 col-auto'>
               <Label className='form-label' for='email'>
                Email:
              </Label>
              <Input className='form-control' type='text' id='email' placeholder='Email' value={searchEmail} onChange={handleEmailFilter} /> 
            </Col>

             {/* <Col className='mb-1 col-auto'>
              <Label className='form-label' for='user_type'>
                Status:
              </Label>
              <Select
                theme={selectThemeColors}
                className='react-select'
                classNamePrefix='select'
                defaultValue={user_statusOptions[1]}
                name='user_type'
                options={user_statusOptions}
                value={user_statusOptions.filter(function(option) {
                  return option.value === Status
                })}
                onChange={handleStatusFilter}
              />
            </Col> */}
          </Row>
          <Row className='mt-1 mb-50 mx-auto'>
            <div className='react-dataTable my-1'>
              <DataTable
                noHeader
                pagination
                selectableRowsNoSelectAll
                columns={columns}
                paginationPerPage={10}
                className='react-dataTable'
                sortIcon={<ChevronDown size={10} />}
                paginationDefaultPage={currentPage + 1}
                paginationComponent={CustomPagination}
                // data={searchValue.length ? filteredData : data}
                data={dataToRender()}
              />
            </div>
          </Row>
        </CardBody>       
      </Card>
     </Fragment>
  )
} 
export default Buyerslog

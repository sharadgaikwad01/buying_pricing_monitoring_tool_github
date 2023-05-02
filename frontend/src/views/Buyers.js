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

const Buyers = props => {
  // ** States

  const [UsersInputsData, setUsersInputsData] = useState([])
  const [searchName, setsearchName] = useState('')
  const [rowData, setRowData] = useState([])
  // const [searchRequestedDate, setSearchRequestedDate] = useState('')
  // const [Status, setStatus] = useState('')
  // const [searchRole, setsearchRole] = useState('')

  const [modal, setModal] = useState(false)
  // 
  // const [supplierInputModal, setSupplierInputModal] = useState(false)
  // const [uploadArticleModal, setUploadArticleModal] = useState(false)

  const [currentPage, setCurrentPage] = useState(0)
  const [articalNumberOptions, setarticalNumberOptions] = useState([])
  const [countryOptions, setcountryOptions] = useState([])
  const [deptOptions, setdeptOptions] = useState([])
  // const [rowData, setrowData] = useState([])
  // ** Function to handle Modal toggle
  const handleModal = () => setModal(!modal)
  // const downloadArticleModal = () => setSupplierInputModal(!supplierInputModal)
  const [UserData] = useState({first_name:'', last_name:'', dept_name:'',  buyer_emailid:'', user_id:0, stratbuyer_name:'', country_name: ''})
  // const handleUploadArticleModal = () => setUploadArticleModal(!uploadArticleModal)
  // ** Function to handle Pagination
  const handlePagination = page => {
    setCurrentPage(page.selected)
  }
  // const handlebuyers = () => {
  //   props.history.push('/users')
  // }
   
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

    await axios.get(`${nodeBackend}/buyers`, { params: { searchName } }).then((res) => {
     
      setUsersInputsData(res.data.data)  
      setarticalNumberOptions(res.data.options)  
      setcountryOptions(res.data.countryoptions)  
      setdeptOptions(res.data.deptOptions)  
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
  const handleNameFilter = async (e) => {
    const searchName = e.target.value
    setsearchName(searchName)
    await axios.get(`${nodeBackend}/buyers`, { params: { searchName } }).then((res) => {
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

  const handleEdit = async (e, row) => {
    e.preventDefault()
    handleModal()
    row.user_id = 1
    setRowData(row)
  }
  
  const handleAdd = async (e) => {
    e.preventDefault()
    handleModal()
    UserData.user_id = 0
    setRowData(UserData)
  }
  
  const handleDelete = (e, row) => {
    const row_id = row.row_id
    e.preventDefault()
    MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-danger ms-1'
      },
      buttonsStyling: false
    }).then(function (result) {
      if (result.value) {
        axios({
          method: "post",
          url: `${nodeBackend}/delete_buyer_input`,
          data: { row_id, searchName}
        }) 
          .then(function (success) {
            console.log(success.data.status)
            //handle success        
            if (success.data.status) {
              setUsersInputsData(success.data.data)
              return MySwal.fire({
                title: 'Done!',
                text: 'Record has been deleted successfully',
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
    })
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
      name: 'Actions',
      width: "80px",
      allowOverflow: true,
      cell: (row) => {
        return (
          <div className='d-flex'>
            <Edit size={15} onClick={(e) => handleEdit(e, row)} />
            <Trash size={15} onClick={(e) => handleDelete(e, row)} />
          </div>
        )
      }
    },
    {
      name: 'Full name',
      sortable: true,
      selector: row => `${row.first_name} ${row.last_name}`
    },
    {
      name: 'Email',
      sortable: true,
      selector: row => row.buyer_emailid
    },
    {
      name: 'Department',
      sortable: true,
      selector: row => row.dept_name
    },
    {
      name: 'Category',
      sortable: true,
      selector: row => row.stratbuyer_name
    },
    {
      name: 'Country',
      sortable: true,
      selector: row => row.country_name
    },
    {
      name: 'Status',
      sortable: true,
      // selector: row => row.active_status,
      cell: row => {
         return (
          row.active_status === 'Active' ? <Badge color='success' pill>Active</Badge> : <Badge color='success' pill>Active</Badge>
          // row.active_status === 'Active' ? <Badge color='success' pill>{row.active_status}</Badge> : <Badge color='primary' pill>{row.active_status}</Badge>
         )
      }
    }
  ]

  return (
    <Fragment>
      <Card className='pageBox user-screen'>
        <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
          <CardTitle tag='h2'>Buyers Data</CardTitle>
          <div className='d-flex mt-md-0 mt-1'>
            <Button.Ripple className='ms-2 btn-icon' color='primary' onClick={handleAdd}>
              <Plus size={16} />
              <span className='align-middle ms-25'>Add New Buyer</span>
            </Button.Ripple>
            {/* <Button.Ripple className='ms-2' outline color='warning' onClick={handlebuyers}> */}
              {/* <Download size={14} /> */}
              {/* <span className='align-middle ms-25'>All Users</span> */}
            {/* </Button.Ripple> */}
           
          </div>
        </CardHeader>
        <CardBody>
          <Row className='g-1 filter-row'>
            <Col className='mb-1 col-auto'>
               <Label className='form-label' for='name'>
                Buyer Name:
              </Label>
              <Input className='form-control' type='text' id='name' placeholder='Buyer Name' value={searchName} onChange={handleNameFilter} /> 
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
      <AddNewModalBuyer open={modal} handleModal={handleModal} rowData={rowData} articalNumberOptions={articalNumberOptions} countryOptions={countryOptions} deptOptions={deptOptions} setUsersInputsData={setUsersInputsData} searchName={searchName} />
    </Fragment>
  )
} 
export default Buyers

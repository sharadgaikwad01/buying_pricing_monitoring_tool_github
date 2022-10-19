// ** Table Data & Columns
// import { columns } from './dataUsers'
import { Fragment, useState, forwardRef, useEffect } from 'react'
import Select from 'react-select'

import { selectThemeColors } from '@utils'
import axios from 'axios'

// ** Add New Modal Component
import Flatpickr from 'react-flatpickr'
import AddNewModalUser from './AddNewModalUser'
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

const RoleOptions = [
  { value: 'Admin', label: 'Admin' },
  { value: 'User', label: 'User' }
]

const user_typeOptions = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'supplier', label: 'Supplier' }
]

const BootstrapCheckbox = forwardRef((props, ref) => (
  <div className='form-check'>
    <Input type='checkbox' ref={ref} {...props} />
  </div>
))

const Home = () => {
  // ** States

  const [UsersInputsData, setUsersInputsData] = useState([])
  const [searchName, setsearchName] = useState('')
  const [rowData, setRowData] = useState([])
  // const [searchRequestedDate, setSearchRequestedDate] = useState('')
  const [UserType, setUserType] = useState('')
  const [searchRole, setsearchRole] = useState('')

  const [modal, setModal] = useState(false)
  // 
  const [supplierInputModal, setSupplierInputModal] = useState(false)
  // const [uploadArticleModal, setUploadArticleModal] = useState(false)

  const [currentPage, setCurrentPage] = useState(0)
  // const [rowData, setrowData] = useState([])
  // ** Function to handle Modal toggle
  const handleModal = () => setModal(!modal)
  const downloadArticleModal = () => setSupplierInputModal(!supplierInputModal)
  const [UserData] = useState({user_name:'', email:'',  emp_id:'', row_id:'', user_type:'', user_role: ''})
  // const handleUploadArticleModal = () => setUploadArticleModal(!uploadArticleModal)

  // ** Function to handle Pagination
  const handlePagination = page => {
    setCurrentPage(page.selected)
  }
   

  useEffect(async () => {
    await axios.get(`http://localhost:8080/users`, { params: { searchName, UserType, searchRole } }).then((res) => {
      console.log(res.data.data.users)
      setUsersInputsData(res.data.data.users)  
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
      pageCount={Math.ceil(dataToRender().length / 7) || 1}
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

  // ** Converts table to CSV
  function convertArrayOfObjectsToCSV(array) {
    let result

    const columnDelimiter = ','
    const lineDelimiter = '\n'
    const keys = Object.keys(data[0])

    result = ''
    result += keys.join(columnDelimiter)
    result += lineDelimiter

    array.forEach(item => {
      let ctr = 0
      keys.forEach(key => {
        if (ctr > 0) result += columnDelimiter
        result += item[key]
        ctr++
      })
      result += lineDelimiter
    })
    return result
  }

  // ** Downloads CSV
  function downloadCSV(array) {
    const link = document.createElement('a')
    let csv = convertArrayOfObjectsToCSV(array)
    if (csv === null) return

    const filename = 'export.csv'

    if (!csv.match(/^data:text\/csv/i)) {
      csv = `data:text/csv;charset=utf-8,${csv}`
    }

    link.setAttribute('href', encodeURI(csv))
    link.setAttribute('download', filename)
    link.click()
  }

  // ** Function to handle supplier filter
  const handleNameFilter = async (e) => {
    const search_Name = e.value
    setsearchName(search_Name)
    await axios.get(`http://localhost:8080/users`, { params: { searchName, UserType, searchRole } }).then((res) => {
      setUsersInputsData(res.data.data.users)
    })
  }


  // ** Function to handle status filter
  const handleUserTypeFilter = async (e) => {
    const UserType = e.value
    setUserType(UserType)
    await axios.get(`http://localhost:8080/users`, { params: { searchName, UserType, searchRole } }).then((res) => {
      setUsersInputsData(res.data.data.users)
    })
  }
  
  const handleRoleFilter = async (e) => {
    const searchRole = e.value
    setsearchRole(searchRole)
    await axios.get(`http://localhost:8080/users`, { params: { searchName, UserType, searchRole } }).then((res) => {
      setUsersInputsData(res.data.data.users)
    })
  }

  const handleEdit = async (e, row) => {
    e.preventDefault()
    console.log(`tttttttttttttttttt${row}`)
    console.log(`tttttttttttttttttt${row.row_id}`)
    handleModal()
    setRowData(row)
  }
  
  const handleAdd = async (e) => {
    e.preventDefault()
    // console.log(`tttttttttttttttttt${row}`)
    // console.log(`tttttttttttttttttt${row.row_id}`)
    handleModal()
    setRowData(UserData)
  }
  
  const handleDelete = (e, row) => {
    const id = row.row_id
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
          url: "http://localhost:8080/delete_user_input",
          data: { id }
        })
          .then(function (success) {
            //handle success        
            if (success.data.status) {
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
      selector: row => row.row_id
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
      name: 'User name',
      // width: "10",
      sortable: true,
      selector: row => row.user_name
    },
    {
      name: 'Email',
      // width: "auto",
      sortable: true,
      selector: row => row.email
    },
    {
      name: 'Emp. ID',
      // width: "auto",
      sortable: true,
      selector: row => row.metro_id
    },
    {
      name: 'User Type',
      sortable: true,
      selector: row => row.user_type,
      cell: row => {
         return (
          row.user_type === 'BUYER' ? <Badge color='success' pill>{row.user_type}</Badge> : <Badge color='primary' pill>{row.user_type}</Badge>
            // row.user_type === 'BUYER' ? `<span class="badge badge-success">${row.user_type}</span>` : `<span class="badge badge-success">${row.user_type}</span>`
         )
      }
    },
    {
      name: 'User Role',
      sortable: true,
      selector: row => row.user_role,
      cell: row => {
         return (
          row.user_role === 'Admin' ? <Badge color='success' pill>{row.user_role}</Badge> : <Badge color='warning' pill>{row.user_role}</Badge>
            // row.user_type === 'BUYER' ? `<span class="badge badge-success">${row.user_type}</span>` : `<span class="badge badge-success">${row.user_type}</span>`
         )
      }
    },
    {
      name: 'country',
      sortable: true,
      selector: row => row.country
    }  
  ]

  return (
    <Fragment>
      <Card className='pageBox user-screen'>
        <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
          <CardTitle tag='h2'>Users Data</CardTitle>
          <div className='d-flex mt-md-0 mt-1'>
            <Button.Ripple className='ms-2 btn-icon' color='primary' onClick={handleAdd}>
              <Plus size={16} />
              <span className='align-middle ms-25'>Add New User</span>
            </Button.Ripple>
            <Button.Ripple className='ms-2' outline color='warning' onClick={downloadArticleModal}>
              <Download size={14} />
              <span className='align-middle ms-25'>All Users</span>
            </Button.Ripple>
            <UncontrolledButtonDropdown className='ms-2'>
              <DropdownToggle color='primary' caret outline>
                <Download size={15} />
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem className='w-100' onClick={() => downloadCSV(data)}>
                  <FileText size={15} />
                  <span className='align-middle ms-50'>CSV</span>
                </DropdownItem>                
              </DropdownMenu>
            </UncontrolledButtonDropdown>
          </div>
        </CardHeader>
        <CardBody>
          <Row className='g-1 filter-row'>
            <Col className='mb-1 col-auto'>
               <Label className='form-label' for='name'>
                User Name:
              </Label>
              <Input className='form-control' type='text' id='name' placeholder='User Name' value={searchName} onChange={handleNameFilter} /> 
            </Col>
            
            <Col className='mb-1 col-auto'>
              <Label className='form-label' for='user_role'>
                Role:
              </Label>
              <Select
                theme={selectThemeColors}
                className='react-select'
                classNamePrefix='select'
                defaultValue={RoleOptions[1]}
                name='user_role'
                options={RoleOptions}
                value={RoleOptions.filter(function(option) {
                  return option.value === searchRole
                })}
                onChange={handleRoleFilter}
              />
            </Col>

             <Col className='mb-1 col-auto'>
              <Label className='form-label' for='user_type'>
                User Type:
              </Label>
              <Select
                theme={selectThemeColors}
                className='react-select'
                classNamePrefix='select'
                defaultValue={user_typeOptions[1]}
                name='user_type'
                options={user_typeOptions}
                value={user_typeOptions.filter(function(option) {
                  return option.value === UserType
                })}
                onChange={handleUserTypeFilter}
              />
            </Col>
          </Row>
          <Row className='mt-1 mb-50 mx-auto'>
            <div className='react-dataTable my-1'>
              <DataTable
                noHeader
                pagination
                selectableRowsNoSelectAll
                columns={columns}
                paginationPerPage={50}
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
      <AddNewModalUser open={modal} handleModal={handleModal} rowData={rowData} setUsersInputsData={setUsersInputsData} />
    </Fragment>
  )
}
export default Home

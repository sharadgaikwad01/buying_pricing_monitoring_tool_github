// ** Table Data & Columns
import { columns } from './dataUsers'
import { Fragment, useState, forwardRef, useEffect } from 'react'
import Select from 'react-select'

import { selectThemeColors } from '@utils'
import axios from 'axios'

// ** Add New Modal Component
import Flatpickr from 'react-flatpickr'
import AddNewModal from './AddNewModalUser'
// import DownloadArticliesModal from './DownloadArticlesModal'
// import UploadArticliesModal from './UploadArticliesModal'
import ReactPaginate from 'react-paginate'
import DataTable from 'react-data-table-component'
import { Download, Search, ChevronDown, Share, Printer, FileText, File, Grid, Copy, Plus, Upload } from 'react-feather'

import '@styles/react/libs/tables/react-dataTable-component.scss'
import '@styles/react/libs/flatpickr/flatpickr.scss'

// ** Reactstrap Imports
import {
  Row,
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

const statusOptions = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'supplier', label: 'Supplier' }
]

const RoleOptions = [
  { value: 'Admin', label: 'Admin' },
  { value: 'User', label: 'User' }
]

const BootstrapCheckbox = forwardRef((props, ref) => (
  <div className='form-check'>
    <Input type='checkbox' ref={ref} {...props} />
  </div>
))

const Home = () => {
  // ** States

  const [UsersInputsData, setUsersInputsData] = useState([])
  const [searchName, setsearchname] = useState('')

  // const [searchRequestedDate, setSearchRequestedDate] = useState('')
  const [searchStatus, setSearchStatus] = useState('')
  const [searchRole, setsearchRole] = useState('')

  const [modal, setModal] = useState(false)
  const [supplierInputModal, setSupplierInputModal] = useState(false)
  // const [uploadArticleModal, setUploadArticleModal] = useState(false)

  const [currentPage, setCurrentPage] = useState(0)
 

  // ** Function to handle Modal toggle
  const handleModal = () => setModal(!modal)
  const downloadArticleModal = () => setSupplierInputModal(!supplierInputModal)
  // const handleUploadArticleModal = () => setUploadArticleModal(!uploadArticleModal)

  // ** Function to handle Pagination
  const handlePagination = page => {
    setCurrentPage(page.selected)
  }

  useEffect(async () => {
    await axios.get(`http://localhost:8080/users`, { params: { searchName, searchStatus, searchRole } }).then((res) => {
      console.log(res.data.data)
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
  const handleNameFilter = async(e) => {
    const searchname = e.value
    setsearchname(searchname)

    await axios.get(`http://localhost:8080/users`, { params: { searchName, searchStatus, searchRole } }).then((res) => {
      setUsersInputsData(res.data.data.supplierInputs)
      
    })

  }


  // ** Function to handle status filter
  const handleStatusFilter = async (e) => {
    const searchStatus = e.value
    setSearchStatus(searchStatus)

    await axios.get(`http://localhost:8080/users`, { params: { searchName, searchStatus, searchRole } }).then((res) => {
      setUsersInputsData(res.data.data.supplierInputs)
      
    })
  }
  
  const handleRoleFilter = async (e) => {
    const searchRole = e.value
    setsearchRole(searchRole)

    await axios.get(`http://localhost:8080/users`, { params: { searchName, searchStatus, searchRole } }).then((res) => {
      setUsersInputsData(res.data.data.supplierInputs)
      
    })
  }

  return (
    <Fragment>
      <Card>
        <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
          <CardTitle tag='h2'>Users Data</CardTitle>
          <div className='d-flex mt-md-0 mt-1'>
            <Button.Ripple className='ms-2 btn-icon' color='primary' onClick={handleModal}>
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
          <Row className='mt-1 mb-50'>
            <Col lg='3' md='6' className='mb-1'>
               <Label className='form-label' for='name'>
                User Name:
              </Label>
              <Input id='name' placeholder='User Name' value={searchName} onChange={handleNameFilter} /> 
            </Col>
            
            <Col lg='3' md='6' className='mb-1'>
              <Label className='form-label' for='salary'>
                Role:
              </Label>
              <Select
                theme={selectThemeColors}
                className='react-select'
                classNamePrefix='select'
                defaultValue={RoleOptions[1]}
                name='status'
                options={RoleOptions}
                value={RoleOptions.filter(function(option) {
                  return option.value === searchStatus
                })}
                onChange={handleRoleFilter}
              />
            </Col>

             <Col lg='3' md='6' className='mb-1'>
              <Label className='form-label' for='salary'>
                User Type:
              </Label>
              <Select
                theme={selectThemeColors}
                className='react-select'
                classNamePrefix='select'
                defaultValue={statusOptions[1]}
                name='status'
                options={statusOptions}
                value={statusOptions.filter(function(option) {
                  return option.value === searchStatus
                })}
                onChange={handleStatusFilter}
              />
            </Col>
          </Row>
          <Row className='mt-1 mb-50'>
            <div className='react-dataTable'>
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
      <AddNewModal open={modal} handleModal={handleModal} />
    </Fragment>
  )
}
export default Home

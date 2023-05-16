// ** Table Data & Columns
// import { columns } from './dataUsers'
import { Fragment, useState, forwardRef, useEffect } from 'react'
import Select from 'react-select'

import { selectThemeColors, nodeBackend } from '@utils'
import axios from 'axios'

// ** Add New Modal Component
import Flatpickr from 'react-flatpickr'
import AddNewModalUser from './AddNewModalmintech'
// import DownloadArticliesModal from './DownloadArticlesModal'
import UploadmintechModal from './UploadmintechModal'
import ReactPaginate from 'react-paginate'
import DataTable from 'react-data-table-component'
import { Download, Search, ChevronDown, Share, Printer, FileText, File, Grid, Copy, Plus, Upload, Edit, Trash, Users} from 'react-feather'

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

const BootstrapCheckbox = forwardRef((props, ref) => (
  <div className='form-check'>
    <Input type='checkbox' ref={ref} {...props} />
  </div>
))


const Home = props => {
  // ** States

  const [UsersInputsData, setUsersInputsData] = useState([])
  const [CategoryOptions, setCategoryoptions] = useState([])
  // const [CountryOptions, setCountryOptions] = useState([])
  const [searchName, setsearchName] = useState('')
  const [rowData, setRowData] = useState([])
  // const [searchRequestedDate, setSearchRequestedDate] = useState('')
  const [searchCategory, setsearchCategory] = useState('')
  // const [searchCountry, setsearchCountry] = useState('')

  const [modal, setModal] = useState(false)

  const [mintechModal, setmintechModal] = useState(false)

  const [currentPage, setCurrentPage] = useState(0)

  // ** Function to handle Modal toggle
  const handleModal = () => setModal(!modal)
  
  const [UserData] = useState({dashboard_name :'', id:'0', stratbuyer_id:'', stratbuyer_category:'', mintec_sub_category: '', dashboard_url:'', created_by:''})

  const handlemintechModal = () => setmintechModal(!mintechModal)

  // ** Function to handle Pagination
  const handlePagination = page => {
    setCurrentPage(page.selected)
  }
  const handlebuyers = () => {
    props.history.push('/buyers')
  }

  useEffect(async () => {
    await axios.get(`${nodeBackend}/mintech`, { params: { searchName, searchCategory } }).then((res) => {
      console.log(res.data.data)
      setUsersInputsData(res.data.data.users)  
      setCategoryoptions(res.data.data.CategoryOptions)  
      // setCountryOptions(res.data.data.CountryOptions)  
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

  // ** Converts table to CSV
  

  // ** Downloads CSV
  // function downloadCSV(array) {
  //   const link = document.createElement('a')
  //   let csv = convertArrayOfObjectsToCSV(array)
  //   if (csv === null) return
  //   const filename = 'export.csv'

  //   if (!csv.match(/^data:text\/csv/i)) {
  //     csv = `data:text/csv;charset=utf-8,${csv}`
  //   }

  //   link.setAttribute('href', encodeURI(csv))
  //   link.setAttribute('download', filename)
  //   link.click()
  // }

  // ** Function to handle supplier filter
  const handleNameFilter = async (e) => {
    const searchNames = e.target.value
    setsearchName(searchNames)
    await axios.get(`${nodeBackend}/mintech`, { params: { searchName, searchCategory } }).then((res) => {
      setUsersInputsData(res.data.data.users)
    })
  }


  // ** Function to handle status filter
  const handleCategoryFilter = async (e) => {
    const Category = e.value
    setsearchCategory(Category)
    await axios.get(`${nodeBackend}/mintech`, { params: { searchName, searchCategory } }).then((res) => {
      setUsersInputsData(res.data.data.users)
    })
  }
  
  // const handleCountryFilter = async (e) => {
  //   const searchCountry = e.value
  //   setsearchCountry(searchCountry)
  //   await axios.get(`${nodeBackend}/mintech`, { params: { searchName, searchCategory, searchCountry } }).then((res) => {
  //     setUsersInputsData(res.data.data.users)
  //   })
  // }

  const handleEdit = async (e, row) => {
    e.preventDefault()
    setRowData(row)
    handleModal()
  }
  
  const handleAdd = async (e) => {
    e.preventDefault()
    setRowData(UserData)
    handleModal()
  }
  
  const handleDelete = (e, row) => {
    const id = row.id
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
          url: `${nodeBackend}/delete_mintech_input`,
          data: { id, searchCategory, searchName }
        })
          .then(function (success) {
            //handle success 
            console.log(res.data)  
            setUsersInputsData(res.data.data.users)     
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
      name: 'Category',
      // width: "10",
      sortable: true,
      selector: row => row.stratbuyer_category
    },
    {
      name: 'Sub Category',
      // width: "10",
      sortable: true,
      selector: row => row.mintec_sub_category
    },
    {
      name: 'Dashboard Name',
      // width: "auto",
      sortable: true,
      selector: row => row.dashboard_name
    },
    {
      name: 'Dashboard url',
      // width: "auto",
      sortable: true,
      selector: row => row.dashboard_url
    },
    {
      name: 'Created By',
      sortable: true,
      selector: row => row.created_by
    }
  ]

  return (
    <Fragment>
      <Card className='pageBox user-screen'>
        <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
          <CardTitle tag='h2'>Mintech Master</CardTitle>
          <div className='d-flex mt-md-0 mt-1 btn-row'>
          <a href='/mintech_sample.xlsx' download>
            <Button.Ripple className='ms-1' color='primary' >
                <Download size={14} />
                <span className='align-middle ms-25'>Sample File</span>
              </Button.Ripple>
          </a>
          <Button.Ripple className='ms-1' outline color='info' onClick={handlemintechModal}>
              <Upload size={14} />
              <span className='align-middle ms-25'>Upload Mintech Inputs</span>
            </Button.Ripple>
            <Button.Ripple className='ms-2 btn-icon' color='primary' onClick={handleAdd}>
              <Plus size={16} />
              <span className='align-middle ms-25'>Add New Data</span>
            </Button.Ripple>
            <Button.Ripple className='ms-2' outline color='warning' onClick={handlebuyers}>
              <Users size={14} />
              <span className='align-middle ms-25'>All Buyers</span>
            </Button.Ripple>
         
          </div>
        </CardHeader>
        <CardBody>
          <Row className='g-1 filter-row'>
            <Col className='mb-1 col-auto'>
               <Label className='form-label' for='name'>
                Dashboard Name:
              </Label>
              <Input className='form-control' type='text' id='name' placeholder='Dashboard Name' value={searchName} onChange={handleNameFilter} /> 
            </Col>
            
            {/* <Col className='mb-1 col-auto'>
              <Label className='form-label' for='user_country'>
                Country:
              </Label>
              <Select
                theme={selectThemeColors}
                className='react-select'
                classNamePrefix='select'
                defaultValue={CountryOptions[1]}
                name='user_country'
                options={CountryOptions}
                value={CountryOptions.filter(function(option) {
                  return option.value === searchCountry
                })}
                onChange={handleCountryFilter}
              />
            </Col> */}

             <Col className='mb-1 col-auto'>
              <Label className='form-label' for='user_type'>
               Category:
              </Label>
              <Select
                theme={selectThemeColors}
                className='react-select'
                classNamePrefix='select'
                defaultValue={CategoryOptions[1]}
                name='user_type'
                options={CategoryOptions}
                value={CategoryOptions.filter(function(option) {
                  return option.value === searchCategory
                })}
                onChange={handleCategoryFilter}
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
      <AddNewModalUser open={modal} handleModal={handleModal} rowData={rowData} CategoryOptions={CategoryOptions} setUsersInputsData={setUsersInputsData} searchName={searchName} searchCategory={searchCategory}/>
      <UploadmintechModal open={mintechModal} handleModal={handlemintechModal} setUsersInputsData={setUsersInputsData} searchName={searchName} searchCategory={searchCategory}/>
    </Fragment>
  )
}
export default Home

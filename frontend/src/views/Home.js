// ** Table Data & Columns
// import { columns } from './data'
import { Fragment, useState, forwardRef, useEffect } from 'react'
import Select from 'react-select'

import { selectThemeColors } from '@utils'
import axios from 'axios'

// ** Add New Modal Component
import Flatpickr from 'react-flatpickr'
import AddNewModal from './AddNewModal'
import DownloadArticliesModal from './DownloadArticlesModal'
import EditSupplierRequestModal from './EditSupplierRequestModal'
import UploadArticliesModal from './UploadArticliesModal'
import ReactPaginate from 'react-paginate'
import DataTable from 'react-data-table-component'
import { Download, Search, ChevronDown, Share, Printer, FileText, File, Grid, Copy, Plus, Upload, Edit, Trash } from 'react-feather'

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
  UncontrolledButtonDropdown,
  Badge
} from 'reactstrap'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)

const statusOptions = [
  { value: 'Open', label: 'Open' },
  { value: 'Closed', label: 'Closed' }
]

const BootstrapCheckbox = forwardRef((props, ref) => (
  <div className='form-check'>
    <Input type='checkbox' ref={ref} {...props} />
  </div>
))

const Home = props => {
  // ** States
  const country = localStorage.getItem('country')
  const vat_number = localStorage.getItem('vat')

  const [supplierInputsData, setsupplierInputsData] = useState([])

  const [searchSupplierNumber, setSupplierNumber] = useState('')
  const [searchArticleNumber, setArticleNumber] = useState('')
  const [searchRequestedDate, setSearchRequestedDate] = useState('')
  const [searchStatus, setSearchStatus] = useState('')

  const [modal, setModal] = useState(false)
  const [supplierInputModal, setSupplierInputModal] = useState(false)
  const [uploadArticleModal, setUploadArticleModal] = useState(false)
  const [editSupplierModal, setEditSupplierModal] = useState(false)

  const [currentPage, setCurrentPage] = useState(0)


  // ** Function to handle Modal toggle
  // const handleModal = () => setModal(!modal)

  const handleModal = async () => {
    setSupplierNumber("")
    setArticleNumber("")
    setSearchRequestedDate("")
    setSearchStatus("")
    setModal(!modal)
  }

  const downloadArticleModal = () => setSupplierInputModal(!supplierInputModal)
  const handleUploadArticleModal = () => setUploadArticleModal(!uploadArticleModal)

  // ** Function to handle Pagination
  const handlePagination = page => {
    setCurrentPage(page.selected)
  }

  const [supllierNumberOptions, setsupllierNumberOptions] = useState([])
  const [rowData, setRowData] = useState([])
  const [articleOptions, setarticleOptions] = useState([])

  useEffect(async () => {
    const user_type = localStorage.getItem("type")
    if (user_type === 'BUYER') {
      props.history.push('/buyer_input')
    }
    await axios.get(`http://10.16.148.18:81/supplier_input`, { params: { searchSupplierNumber, searchArticleNumber, searchRequestedDate, searchStatus, country, vat_number } }).then((res) => {
      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
      setarticleOptions(res.data.data.articleOptions)
    })
  }, [])

  const dataToRender = () => {
    return supplierInputsData
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
    const keys = Object.keys(array[0])

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
  const handleSupplierNumberFilter = async (e) => {
    const searchSupplierNumber = e.value
    setSupplierNumber(searchSupplierNumber)
    await axios.get(`http://10.16.148.18:81/supplier_input`, { params: { searchSupplierNumber, searchArticleNumber, searchRequestedDate, searchStatus, country, vat_number } }).then((res) => {
      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
      setarticleOptions(res.data.data.articleOptions)
    })

  }

  // ** Function to handle article filter
  const handleArticleFilter = async (e) => {
    const searchArticleNumber = e.value
    setArticleNumber(searchArticleNumber)
    await axios.get(`http://10.16.148.18:81/supplier_input`, { params: { searchSupplierNumber, searchArticleNumber, searchRequestedDate, searchStatus, country, vat_number } }).then((res) => {
      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
      setarticleOptions(res.data.data.articleOptions)
    })

  }

  // ** Function to handle date filter
  const handleRequestedDateFilter = async (date) => {
    const arr = []
    date.map(i => {
      const date = new Date(i)

      const year = date.getFullYear()

      let month = (1 + date.getMonth()).toString()
      month = month.length > 1 ? month : `0${month}`

      let day = date.getDate().toString()
      day = day.length > 1 ? day : `0${day}`

      arr.push(`${year}-${month}-${day}`)
      return true
    })
    const searchRequestedDate = arr[0]
    setSearchRequestedDate(searchRequestedDate)
    await axios.get(`http://10.16.148.18:81/supplier_input`, { params: { searchSupplierNumber, searchArticleNumber, searchRequestedDate, searchStatus, country, vat_number } }).then((res) => {
      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
      setarticleOptions(res.data.data.articleOptions)
    })
  }

  // ** Function to handle status filter
  const handleStatusFilter = async (e) => {
    const searchStatus = e.value
    setSearchStatus(searchStatus)
    await axios.get(`http://10.16.148.18:81/supplier_input`, { params: { searchSupplierNumber, searchArticleNumber, searchRequestedDate, searchStatus, country, vat_number } }).then((res) => {
      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
      setarticleOptions(res.data.data.articleOptions)
    })
  }

  // ** Function to handle edit
  const handleEdit = async (row) => {
    setRowData(row)
    setEditSupplierModal(!editSupplierModal)
  }

  // ** Function to handle delete
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
          url: "http://10.16.148.18:81/delete_supplier_input",
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

  const handleDownloadCSV = async () => {
    downloadCSV(supplierInputsData)
  }

  const columns = [
    {
      name: '#',
      cell: (row, index) => index + 1,
      width: '50px',
      maxWidth: '60px',
      center: 'yes',
      style: {
        align: 'center'
      }
    },
    {
      name: 'Actions',
      allowOverflow: true,
      center: 'yes',
      width: '100px',
      cell: (row) => {
        return (
          <div className='d-flex'>
            <Edit size={15} onClick={(e) => handleEdit(e, row)} className="editTableIcon text-info" />
            <Trash size={15} onClick={(e) => handleDelete(e, row)} className="deleteTableIcon text-danger ms-1" />
          </div>
        )
      }
    },
    {
      name: 'Row Id',
      omit:true,
      selector: row => row.row_id
    },
    {
      name: 'Supplier Number',
      sortable: true,
      width: '150px',
      selector: row => row.suppl_no
    },
    {
      name: 'Article Number',
      sortable: true,
      width: '130px',
      selector: row => row.art_no
    },
    {
      name: 'Article Description',
      sortable: true,
      width: 'auto',
      selector: row => row.art_name
    },
    {
      name: 'New Price',
      sortable: true,
      width: '100px',
      selector: row => row.new_price
    },
    {
      name: 'Request Date',
      sortable: true,
      width: 'auto',
      selector: row => row.request_date
    },
    {
      name: 'Final Price',
      sortable: true,
      width: '120px',
      selector: row => row.negotiate_final_price,
      cell: row => {
        return (
          row.negotiate_final_price ? row.negotiate_final_price : "-"
        )
      }
    },
    {
      name: 'Price Finalize Date',
      sortable: true,
      width: 'auto',
      selector: row => row.price_increase_communicated_date,
      cell: row => {
        return (
          row.price_increase_communicated_date ? row.price_increase_communicated_date : "-"
        )
      }
    },
    {
      name: 'Price Effective Date',
      sortable: true,
      width: 'auto',
      selector: row => row.price_increase_effective_date,
      cell: row => {
        return (
          row.price_increase_effective_date ? row.price_increase_effective_date : "-"
        )
      }
    },
    {
      name: 'Status',
      sortable: true,
      minWidth: '100px',
      selector: row => row.action_status,
      cell: row => {
        return (
          row.action_status === 'open' ? <Badge color='primary' pill>{row.action_status}</Badge> : <Badge color='success' pill>{row.action_status}</Badge>
        )
      }
    }
  ]
  return (
    <Fragment>
      <Card className='pageBox supplier-screen'>
        <CardHeader className='flex-md-row flex-column align-items-center align-items-start border-bottom'>
          <CardTitle tag='h2'>Inflation Price Data</CardTitle>
          <div className='d-flex mt-md-0 mt-1'>
            <Button.Ripple className='ms-1 btn-icon' color='primary' onClick={handleModal}>
              <Plus size={16} />
              <span className='align-middle ms-25'>Add New Input</span>
            </Button.Ripple>
            <Button.Ripple className='ms-1' outline color='warning' onClick={downloadArticleModal}>
              <Download size={14} />
              <span className='align-middle ms-25'>Articles</span>
            </Button.Ripple>
            <Button.Ripple className='ms-1' outline color='info' onClick={handleUploadArticleModal}>
              <Upload size={14} />
              <span className='align-middle ms-25'>Upload Articles</span>
            </Button.Ripple>
            <UncontrolledButtonDropdown className='ms-1'>
              <DropdownToggle color='primary' caret outline>
                <Download size={15} />
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem className='w-100' onClick={() => handleDownloadCSV()}>
                  <FileText size={15} />
                  <span className='align-middle ms-50'>CSV</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledButtonDropdown>
          </div>
        </CardHeader>
        <CardBody>
          <Row className='g-1 filter-row'>
            <Col className='col-auto'>
              {/* <Label className='form-label' for='name'>
                Supplier Name:
              </Label>
              <Input id='name' placeholder='Bruce Wayne' value={searchName} onChange={handleNameFilter} /> */}
              <Label className='form-label'>Supplier Number</Label>
              <Select
                theme={selectThemeColors}
                className='react-select'
                classNamePrefix='select'
                defaultValue={supllierNumberOptions[1]}
                name='supplier_number'
                options={supllierNumberOptions}
                value={supllierNumberOptions.filter(function (option) {
                  return option.value === searchSupplierNumber
                })}
                onChange={handleSupplierNumberFilter}
              />
            </Col>
            <Col className='col-auto'>
              <Label className='form-label' for='city'>
                Article Number:
              </Label>
              {/* <Input id='city' placeholder='San Diego' value={searchCity} onChange={handleCityFilter} /> */}
              <Select
                theme={selectThemeColors}
                className='react-select'
                classNamePrefix='select'
                defaultValue={articleOptions[1]}
                name='article_number'
                options={articleOptions}
                value={articleOptions.filter(function (option) {
                  return option.value === searchArticleNumber
                })}
                onChange={handleArticleFilter}
              />
            </Col>
            <Col className='col-auto'>
              <Label className='form-label' for='date'>
                Requested Date:
              </Label>
              <Flatpickr
                className='form-control'
                value={searchRequestedDate}
                onChange={date => handleRequestedDateFilter(date)}
                id='default-picker' placeholder='DD/MM/YYYY'
                options={{
                  dateFormat: 'Y-m-d'
                }}
              />
            </Col>
            <Col className='col-auto'>
              <Label className='form-label' for='salary'>
                Status:
              </Label>
              <Select
                theme={selectThemeColors}
                className='react-select'
                classNamePrefix='select'
                defaultValue={statusOptions[1]}
                name='status'
                options={statusOptions}
                value={statusOptions.filter(function (option) {
                  return option.value === searchStatus
                })}
                onChange={handleStatusFilter}
              />
            </Col>
          </Row>

          <div className='react-dataTable my-1'>
            <DataTable
              noHeader
              pagination
              selectableRowsNoSelectAll
              columns={columns}
              paginationPerPage={7}
              className='react-dataTable'
              sortIcon={<ChevronDown size={10} />}
              paginationDefaultPage={currentPage + 1}
              paginationComponent={CustomPagination}
              // data={searchValue.length ? filteredData : data}
              data={dataToRender()}
            />
          </div>


        </CardBody>

      </Card>
      <AddNewModal open={modal} handleModal={handleModal} supllierNumberOptions={supllierNumberOptions} setsupplierInputsData={setsupplierInputsData} />
      <UploadArticliesModal open={uploadArticleModal} handleModal={handleUploadArticleModal} setsupplierInputsData={setsupplierInputsData} />
      <DownloadArticliesModal open={supplierInputModal} handleModal={downloadArticleModal} supllierNumberOptions={supllierNumberOptions} />
      <EditSupplierRequestModal open={editSupplierModal} handleModal={handleEdit} rowData={rowData} supllierNumberOptions={supllierNumberOptions} />
    </Fragment>
  )
}
export default Home

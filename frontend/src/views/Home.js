// ** Table Data & Columns
// import { columns } from './data'
import { Fragment, useState, forwardRef, useEffect } from 'react'
import Select from 'react-select'

import { selectThemeColors, nodeBackend } from '@utils'
import axios from 'axios'
// ** Add New Modal Component
import Flatpickr from 'react-flatpickr'
import AddNewModal from './AddNewModal'
import DownloadArticliesModal from './DownloadArticlesModal'
import EditSupplierRequestModal from './EditSupplierRequestModal'
import UploadArticliesModal from './UploadArticliesModal'
import ReactPaginate from 'react-paginate'
import DataTable from 'react-data-table-component'
import { Download, Search, ChevronDown, Share, Printer, FileText, File, Grid, Copy, Plus, Upload, Edit, Trash, RefreshCcw } from 'react-feather'

import '@styles/react/libs/tables/react-dataTable-component.scss'
import '@styles/react/libs/flatpickr/flatpickr.scss'
import LoadingSpinner from '@src/@core/components/spinner/Loading-spinner.js'

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
import { utils, writeFile } from 'xlsx'
const MySwal = withReactContent(Swal)

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' }
]

const BootstrapCheckbox = forwardRef((props, ref) => (
  <div className='form-check'>
    <Input type='checkbox' ref={ref} {...props} />
  </div>
))

const Home = props => {
  // ** States

  const [Picker, setPicker] = useState('')
  const [searchRequestedDate, setSearchRequestedDate] = useState('')

  const country = localStorage.getItem('country')
  const vat_number = localStorage.getItem('vat')

  const [supplierInputsData, setsupplierInputsData] = useState([])
  const [supplierInputCount, setSupplierInputCount] = useState([])
  

  const [searchSupplierNumber, setSupplierNumber] = useState('')
  const [searchArticleNumber, setArticleNumber] = useState('')
  
  const [searchStatus, setSearchStatus] = useState('')

  const [modal, setModal] = useState(false)
  const [supplierInputModal, setSupplierInputModal] = useState(false)
  const [uploadArticleModal, setUploadArticleModal] = useState(false)
  const [editSupplierModal, setEditSupplierModal] = useState(false)

  const [currentPage, setCurrentPage] = useState(0)
  const [fileName] = useState('export')
  const [fileFormat] = useState('xlsx')
  const [isLoading, setIsLoading] = useState(false)

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

    const auth_token = localStorage.getItem('token')
    if (!auth_token) {
      window.location.replace(`${nodeBackend}/api/v1/login`)
    }
    setIsLoading(true)
    await axios.get(`${nodeBackend}/supplier_input`, { params: { searchSupplierNumber, searchArticleNumber, searchRequestedDate, searchStatus, country, vat_number } }).then((res) => {
      if (res.data.data) {
        setIsLoading(false)
        setsupplierInputsData(res.data.data.supplierInputs)
        setsupllierNumberOptions(res.data.data.supplierIDOptions)
        setarticleOptions(res.data.data.articleOptions)
        setSupplierInputCount(res.data.data.supplierInputCount)
      }
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
    setIsLoading(true)
    await axios.get(`${nodeBackend}/supplier_input`, { params: { searchSupplierNumber, searchArticleNumber, searchRequestedDate, searchStatus, country, vat_number } }).then((res) => {
      setIsLoading(false)
      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
      setarticleOptions(res.data.data.articleOptions)
      setSupplierInputCount(res.data.data.supplierInputCount)
    })

  }

  // ** Function to handle article filter
  const handleArticleFilter = async (e) => {
    const searchArticleNumber = e.value
    setArticleNumber(searchArticleNumber)
    setIsLoading(true)
    await axios.get(`${nodeBackend}/supplier_input`, { params: { searchSupplierNumber, searchArticleNumber, searchRequestedDate, searchStatus, country, vat_number } }).then((res) => {
      setIsLoading(false)
      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
      setarticleOptions(res.data.data.articleOptions)
      setSupplierInputCount(res.data.data.supplierInputCount)
    })

  }

  // ** Function to handle date filter  
  const handleDateFilter = async (range) => {
    const arr = []
    range.map(i => {
      const date = new Date(i)

      const year = date.getFullYear()

      let month = (1 + date.getMonth()).toString()
      month = month.length > 1 ? month : `0${month}`

      let day = date.getDate().toString()
      day = day.length > 1 ? day : `0${day}`

      arr.push(`${year}-${month}-${day}`)
      return true
    })

    const searchRequestedDate = `${arr[0]} to ${arr[1]}`
    setPicker(range)

    setSearchRequestedDate(searchRequestedDate)
    setIsLoading(true)
    await axios.get(`${nodeBackend}/supplier_input`, { params: { searchSupplierNumber, searchArticleNumber, searchRequestedDate, searchStatus, country, vat_number } }).then((res) => {
      if (res.data.data) {
        setIsLoading(false)
        setsupplierInputsData(res.data.data.supplierInputs) 
        setsupllierNumberOptions(res.data.data.supplierIDOptions)
        setarticleOptions(res.data.data.articleOptions)
        setSupplierInputCount(res.data.data.supplierInputCount)
      }      
    })
  }

  // ** Function to handle status filter
  const handleStatusFilter = async (e) => {
    const searchStatus = e.value
    setSearchStatus(searchStatus)
    setIsLoading(true)
    await axios.get(`${nodeBackend}/supplier_input`, { params: { searchSupplierNumber, searchArticleNumber, searchRequestedDate, searchStatus, country, vat_number } }).then((res) => {
      setIsLoading(false)
      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
      setarticleOptions(res.data.data.articleOptions)
      setSupplierInputCount(res.data.data.supplierInputCount)
    })
  }

  // ** Function to handle edit
  const handleEdit = async (row) => {
    console.log(row)
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
          url: `${nodeBackend}/delete_supplier_input`,
          data: { id, country, vat_number, searchSupplierNumber, searchArticleNumber, searchRequestedDate, searchStatus}
        })
          .then(function (success) {
            //handle success        
            if (success.data.status) {
              setsupplierInputsData(success.data.data.supplierInputs) 
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

  const assortmentDownload = async (flag) => {
    const csvdata = supplierInputsData
    csvdata.forEach(function (item) {
      delete item.row_id
      delete item.frmt_new_price
    })
    const finalcsvdata = csvdata.map(item => ({
      "Supplier Number": item.suppl_no ? item.suppl_no.replace(",", ".") : item.suppl_no,
      "Article Number": item.art_no ? item.art_no.replace(",", ".") : item.art_no,
      "EAN Number": item.ean_no ? item.ean_no.replace(",", ".") : item.ean_no,
      "Article Description": item.art_name ? item.art_name.replace(",", ".") : item.art_name,
      "Requested Price": item.new_price ? item.new_price.replace(",", ".") : item.new_price,
      "Requested Date": item.request_date ? item.request_date.replace(",", ".") : item.request_date,
      "Final Price": item.negotiate_final_price ? item.negotiate_final_price.replace(",", ".") : item.negotiate_final_price,
      "Price Finalize Date": item.price_increase_communicated_date ? item.price_increase_communicated_date.replace(",", ".") : item.price_increase_communicated_date,
      "Price Effective Date": item.price_increase_effective_date ? item.price_increase_effective_date.replace(",", ".") : item.price_increase_effective_date,
      "Article Status": item.action_status ? item.action_status.replace(",", ".") : item.action_status,
      "Price change Reason": item.price_change_reason ? item.price_change_reason.replace(",", ".") : item.price_change_reason
    }))
    if (finalcsvdata.length > 0) {
      if (flag === 1) {
        downloadCSV(finalcsvdata)
      } else {
        const name = fileName.length ? `${fileName}.${fileFormat}` : `excel-sheet.${fileFormat}`
        const wb = utils.json_to_sheet(finalcsvdata)
        const wbout = utils.book_new()
        utils.book_append_sheet(wbout, wb, fileName)
        writeFile(wbout, name)
      }
    }        
  }

  const handleRefresh = async () => {
    await setSupplierNumber("")
    await setArticleNumber("")
    await setSearchRequestedDate("")
    await setSearchStatus("")
    await setPicker("")
    // document.querySelector(this).classList.toggle("down")
    const searchSupplierNumber = ''
    const searchArticleNumber = ''
    const searchRequestedDate = ''
    const searchStatus = ''
    setIsLoading(true)
    await axios.get(`${nodeBackend}/supplier_input`, { params: { searchSupplierNumber, searchArticleNumber, searchRequestedDate, searchStatus, country, vat_number } }).then((res) => {
      setIsLoading(false)
      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
      setarticleOptions(res.data.data.articleOptions)
      setSupplierInputCount(res.data.data.supplierInputCount)
    })
  }

  const columns = [
    {
      name: 'Row Id',
      omit:true,
      selector: row => row.row_id
    },
    {
      name: 'Supplier No.',
      sortable: true,
      width: 'auto',
      selector: row => row.suppl_no
    },
    {
      name: 'Article No.',
      sortable: true,
      width: 'auto',
      selector: row => row.art_no
    },
    {
      name: 'EAN No.',
      sortable: true,
      width: 'auto',
      selector: row => row.ean_no,
      cell: row => {
        return (
          row.ean_no ? row.ean_no : "-"
        )
      }
    },
    {
      name: 'Article Description',
      sortable: true,
      width: 'auto',
      selector: row => row.art_name
    },
    {
      name: 'Requested Price',
      sortable: true,
      width: 'auto',
      selector: row => row.frmt_new_price,
      cell: row => {
        return (
          row.frmt_new_price ? `${row.frmt_new_price}` : "-"
        )
      }
    },
    {
      name: 'Reason',
      sortable: true,
      width: 'auto',
      selector: row => row.price_change_reason,
      cell: row => {
        return (
          row.price_change_reason ? row.price_change_reason : "-"
        )
      }
    },
    {
      name: 'Request Date',
      sortable: true,
      width: 'auto',
      selector: row => row.request_date
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
      name: 'Final Price',
      sortable: true,
      width: 'auto',
      selector: row => row.frmt_negotiate_final_price,
      cell: row => {
        return (
          row.frmt_negotiate_final_price ? `${row.frmt_negotiate_final_price}` : "-"
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
      name: 'Status',
      sortable: true,
      width: 'auto',
      selector: row => row.action_status,
      cell: row => {
        return (
          row.action_status === 'open' ? <div><Badge color="primary" pill>Open</Badge><br /><span className='text-muted font-small-2'>{ row.previous_request_days > 0 ? row.previous_request_days > 1 ? `${row.previous_request_days} Days Ago` : `${row.previous_request_days} Day Ago` : ''}  </span></div> : <div><Badge color='success' pill>Closed</Badge><br /><span className='text-muted font-small-2'>{ row.previous_request_days > 0 ? row.previous_request_days > 1 ? `${row.previous_request_days} Days Ago` : `${row.previous_request_days} Day Ago` : ''}  </span></div>
        )
      }
    },
    {
      name: 'Actions',
      allowOverflow: true,
      center: 'yes',
      width: 'auto',
      cell: (row) => {
        return (
          !row.negotiate_final_price && !row.price_increase_communicated_date && row.action_status === 'open' ? <div className='d-flex'> <Edit size={15} onClick={() => handleEdit(row)} className="editTableIcon text-info" /> <Trash size={15} onClick={(e) => handleDelete(e, row)} className="deleteTableIcon text-danger ms-1" /> </div> : "-"
        )
      }
    }
  ]
  return (
    <Fragment>
       {isLoading ? <LoadingSpinner /> : <Card className='pageBox supplier-screen'>
        <CardHeader className='flex-md-row flex-column align-items-center align-items-start border-bottom'>
          <CardTitle tag='h2'>List of Assortment</CardTitle>
          <div className='d-md-flex mt-md-0 mt-1  btn-row document-btn-row'>
            <Button.Ripple className='ms-1 btn-icon' color='primary' onClick={handleModal}>
              <Plus size={16} />
              <span className='align-middle ms-25'>Add Single Article Input</span>
            </Button.Ripple>
            <Button.Ripple className='ms-1' outline color='warning' onClick={downloadArticleModal}>
              <Download size={14} />
              <span className='align-middle ms-25'>Multiple Article Inputs</span>
            </Button.Ripple>
            <Button.Ripple className='ms-1' outline color='info' onClick={handleUploadArticleModal}>
              <Upload size={14} />
              <span className='align-middle ms-25'>Upload Multiple Article Inputs</span>
            </Button.Ripple>
            <UncontrolledButtonDropdown className=''>
              <DropdownToggle color='primary' caret outline>
                <Download size={15} />
                <span className='align-middle ms-25'>Assortment Download</span>
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem className='w-100' onClick={() => assortmentDownload(1)}>
                  <FileText size={15} />
                  <span className='align-middle ms7'> CSV</span>
                </DropdownItem>
                <DropdownItem className='w-100' onClick={() => assortmentDownload(2)}>
                  <Grid size={15} />
                  <span className='align-middle ms7'> Excel</span>
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
              <Label className='form-label'>Supplier Number <Badge color='primary' pill>{supplierInputCount}</Badge></Label>
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
                className='form-control date-range-select'
                id='date'
                value={Picker}
                placeholder='d-m-Y to d-m-Y'
                options={{ mode: 'range', dateFormat: 'd-m-Y' }}
                onChange={date => handleDateFilter(date)}
              />
            </Col>
            <Col className='col-auto'>
              <Label className='form-label' for='status'>
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
            <Col className='col-auto d-flex align-items-end'>

            <Button.Ripple className='ms-1 btn-icon' color='primary' onClick={handleRefresh}>
              <RefreshCcw size={16} />
            </Button.Ripple>
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
      </Card> }
      <AddNewModal open={modal} handleModal={handleModal} supllierNumberOptions={supllierNumberOptions} setsupplierInputsData={setsupplierInputsData} />
      <UploadArticliesModal open={uploadArticleModal} handleModal={handleUploadArticleModal} setsupplierInputsData={setsupplierInputsData} />
      <DownloadArticliesModal open={supplierInputModal} handleModal={downloadArticleModal} supllierNumberOptions={supllierNumberOptions} />
      <EditSupplierRequestModal open={editSupplierModal} handleModal={handleEdit} rowData={rowData} supllierNumberOptions={supllierNumberOptions} setsupplierInputsData={setsupplierInputsData} searchSupplierNumber = {searchSupplierNumber} searchArticleNumber = {searchArticleNumber} searchRequestedDate = {searchRequestedDate} searchStatus = {searchStatus} />
    </Fragment>
  )
}
export default Home

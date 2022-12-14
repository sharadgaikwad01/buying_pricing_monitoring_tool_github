import { Fragment, useState, useEffect } from 'react'
import Select from 'react-select'
import { Link } from 'react-router-dom'

import { selectThemeColors, nodeBackend } from '@utils'
import axios from 'axios'

// ** Add New Modal Component
import Flatpickr from 'react-flatpickr'
import AddBuyerInputModal from './AddBuyerInputModal'
import ReactPaginate from 'react-paginate'
import DataTable from 'react-data-table-component'
import DownloadSupplierAssortmentsModal from './DownloadSupplierAssortmentsModal'
import { Download, Search, ChevronDown, Share, Printer, FileText, File, Grid, Copy, Plus, Upload, Edit, Trash, Check, RefreshCcw} from 'react-feather'

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
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' }
]

const BuyerInput = props => {
  const country = localStorage.getItem('country')
  const email = localStorage.getItem('email')

  const [Picker, setPicker] = useState('')
  const [supplierInputsData, setsupplierInputsData] = useState([])
  const [searchSupplierNumber, setSupplierNumber] = useState('')
  const [searchRequestedDate, setSearchRequestedDate] = useState('')
  const [searchStatus, setSearchStatus] = useState('')
  const [searchCategory, setSearchCategory] = useState('')
  const [editBuyerModal, setBuyerInputModal] = useState(false)

  const [currentPage, setCurrentPage] = useState(0)

  const [supplierInputModal, setSupplierInputModal] = useState(false)
  

  // ** Function to handle Pagination
  const handlePagination = page => {
    setCurrentPage(page.selected)
  }
  const downloadArticleModal = () => setSupplierInputModal(!supplierInputModal)

  const [supllierNumberOptions, setsupllierNumberOptions] = useState([])
  const [categoryOptions, setCategoryOptions] = useState([])
  const [rowData, setRowData] = useState([])

  useEffect(async () => {
    const user_type = localStorage.getItem("type")
    if (user_type === 'SUPPLIER') {
      props.history.push('/home')
    }

    await axios.get(`${nodeBackend}/buyer_input`, { params: { searchSupplierNumber, searchRequestedDate, searchStatus, searchCategory, country, email } }).then((res) => {
      if (res.data.data) {
        setsupplierInputsData(res.data.data.supplierInputs)
        setsupllierNumberOptions(res.data.data.supplierIDOptions)
        setCategoryOptions(res.data.data.categoryOptions)
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

  const handleDownloadCSV = async () => {
    await axios.get(`${nodeBackend}/buyer_article_details`, { params: { country, email} }).then((res) => {
      const csvdata = res.data.data
      csvdata.forEach(function (item) {
        delete item.row_id
        delete item.frmt_new_price
      })
      const finalcsvdata = csvdata.map(item => ({
        "Supplier Number": item.suppl_no ? item.suppl_no.replace(",", ".") : item.suppl_no,
        "Supplier Name":item.suppl_name ? item.suppl_name.replace(",", ".") : item.suppl_name,
        "Article Number": item.art_no ? item.art_no.replace(",", ".") : item.art_no,
        "EAN Number": item.ean_no ? item.ean_no.replace(",", ".") : item.ean_no,
        "Article Description": item.art_name_tl ? item.art_name_tl.replace(",", ".") : item.art_name_tl,
        "Current Price":item.current_price ? item.current_price.replace(",", ".") : item.current_price,
        "Requested Price": item.new_price ? item.new_price.replace(",", ".") : item.new_price,
        "Price Increase in %":item.price_difference_perc ? item.price_difference_perc.replace(",", ".") : item.price_difference_perc,
        "Requested Date": item.request_date ? item.request_date.replace(",", ".") : item.request_date,
        "Price change Reason": item.price_change_reason ? item.price_change_reason.replace(",", ".") : item.price_change_reason,
        "Article Status": item.action_status ? item.action_status.replace(",", ".") : item.action_status,
        "Final Price": item.negotiate_final_price ? item.negotiate_final_price.replace(",", ".") : item.negotiate_final_price,
        "Price Finalize Date": item.price_increase_communicated_date ? item.price_increase_communicated_date.replace(",", ".") : item.price_increase_communicated_date,
        "Price Effective Date": item.price_increase_effective_date ? item.price_increase_effective_date.replace(",", ".") : item.price_increase_effective_date,
        "Category Name":item.stratbuyer_name ? item.stratbuyer_name.replace(",", ".") : item.stratbuyer_name
      }))
      downloadCSV(finalcsvdata)
    })
  }

  // ** Function to handle supplier filter
  const handleSupplierNumberFilter = async (e) => {
    const searchSupplierNumber = e.value
    setSupplierNumber(searchSupplierNumber)

    await axios.get(`${nodeBackend}/buyer_input`, { params: { searchSupplierNumber, searchRequestedDate, searchStatus, searchCategory, country, email } }).then((res) => {
      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
      setCategoryOptions(res.data.data.categoryOptions)
    })
  }

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
    await axios.get(`${nodeBackend}/buyer_input`, { params: { searchSupplierNumber, searchRequestedDate, searchStatus, searchCategory, country, email } }).then((res) => {
      if (res.data.data) {
        setsupplierInputsData(res.data.data.supplierInputs)
        setsupllierNumberOptions(res.data.data.supplierIDOptions)
        setCategoryOptions(res.data.data.categoryOptions)
      }      
    })
  }

  // ** Function to handle status filter
  const handleStatusFilter = async (e) => {
    const searchStatus = e.value
    setSearchStatus(searchStatus)
    await axios.get(`${nodeBackend}/buyer_input`, { params: { searchSupplierNumber, searchRequestedDate, searchStatus, searchCategory, country, email } }).then((res) => {
      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
      setCategoryOptions(res.data.data.categoryOptions)
    })
  }

  const handleCategoryFilter = async (e) => {
    const searchCategory = e.value
    setSearchCategory(searchCategory)
    await axios.get(`${nodeBackend}/buyer_input`, { params: { searchSupplierNumber, searchRequestedDate, searchStatus, searchCategory, country, email } }).then((res) => {
      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
      setCategoryOptions(res.data.data.categoryOptions)
    })
  }

  // ** Function to handle edit
  const handleEdit = async (e, row) => {
    setRowData(row)
    setBuyerInputModal(!editBuyerModal)
  }

  const handleClosedAction = (e, row) => {
    const id = row.row_id
    e.preventDefault()
    MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Close it!',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-danger ms-1'
      },
      buttonsStyling: false
    }).then(function (result) {
      if (result.value) {
        axios({
          method: "post",
          url: `${nodeBackend}/closed_supplier_input`,
          data: { id, country, email}
        })
          .then(function (success) {
            //handle success        
            if (success.data.status) { 
              setsupplierInputsData(success.data.data.supplierInputs) 
              return MySwal.fire({
                title: 'Done!',
                text: 'Request has been closed successfully',
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

  const handleRefresh = async () => {
    await setSupplierNumber("")
    await setSearchRequestedDate("")
    await setSearchStatus("")
    await setPicker("")
    await setSearchCategory("")

    const searchSupplierNumber = ''
    const searchRequestedDate = ''
    const searchStatus = ''
    const searchCategory = ''

    await axios.get(`${nodeBackend}/buyer_input`, { params: { searchSupplierNumber, searchRequestedDate, searchStatus, searchCategory, country, email } }).then((res) => {
      if (res.data.data) {
        setsupplierInputsData(res.data.data.supplierInputs)
        setsupllierNumberOptions(res.data.data.supplierIDOptions)
        setCategoryOptions(res.data.data.categoryOptions)
      }
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
      selector: row => row.suppl_no,
      cell: row => {
        return (
          row.suppl_no ? <Link to={`/view/${row.suppl_no}`}>{`${row.suppl_no}`}</Link> : "-"
        )
      }
    },
    {
      name: 'Supplier Name',
      sortable: true,
      minWidth: 'auto',
      selector: row => row.suppl_name,
      cell: row => {
        return (
          row.suppl_name ? row.suppl_name : "-"
        )
      }
    },
    {
      name: 'Article No.',
      sortable: true,
      minWidth: 'auto',
      selector: row => row.art_no,
      cell: row => {
        return (
          row.art_no ? row.art_no : "-"
        )
      }
    },
    {
      name: 'EAN No.',
      sortable: true,
      minWidth: 'auto',
      selector: row => row.ean_no,
      cell: row => {
        return (
          row.ean_no ? row.ean_no : "-"
        )
      }
    },
    {
      name: 'Art. Desc.',
      sortable: true,
      minWidth: 'auto',
      selector: row => row.art_name_tl,
      cell: row => {
        return (
          row.art_name_tl ? row.art_name_tl : "-"
        )
      }
    },
    {
      name: 'Current Price',
      sortable: true,
      minWidth: 'auto',
      selector: row => row.current_price,
      cell: row => {
        return (
          row.current_price ? `${row.current_price}` : "-"
        )
      }
    },
    {
      name: 'Requested Price',
      sortable: true,
      minWidth: 'auto',
      selector: row => row.frmt_new_price,
      cell: row => {
        return (
          row.frmt_new_price ? `${row.frmt_new_price}` : "-"
        )
      }
    },
    {
      name: 'Price Increase in %',
      sortable: true,
      minWidth: 'auto',
      selector: row => row.price_difference_perc,
      cell: row => {
        return (
          row.price_difference_perc ? `${row.price_difference_perc}%` : "-"
        )
      }
    },
    {
      name: 'Request Creation Date',
      sortable: true,
      minWidth: 'auto',
      selector: row => row.request_date,
      cell: row => {
        return (
          row.request_date ? row.request_date : "-"
        )
      }
    },
    {
      name: 'Reason For Price Change',
      sortable: true,
      minWidth: 'auto',
      selector: row => row.price_change_reason,
      cell: row => {
        return (
          row.price_change_reason ? row.price_change_reason : "-"
        )
      }
    },    
    {
      name: 'Price Effective Date',
      sortable: true,
      minWidth: 'auto',
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
          row.frmt_negotiate_final_price ? row.frmt_negotiate_final_price : "-"
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
      width: 'auto',
      sortable: row => row.action_status,
      cell: row => {
        return (
          row.action_status === 'open' ? <Badge color='primary' pill>{row.action_status}</Badge> : <Badge color='success' pill>{row.action_status}</Badge>
        )
      }
    },
    {
      name: 'Actions',
      center: 'yes',
      width: '80px',
      allowOverflow: true,
      cell: (row) => {
        return (
          row.negotiate_final_price && row.price_increase_communicated_date && row.action_status === 'open' ? <div className='d-flex'><Edit size={15} onClick={(e) => handleEdit(e, row)} className="editTableIcon text-info" /><Check size={15} onClick={(e) => handleClosedAction(e, row)} className="deleteTableIcon text-success ms-1" /></div> : row.action_status === 'open' ? <div className='d-flex'><Edit size={15} onClick={(e) => handleEdit(e, row)} className="editTableIcon text-info" /></div> : "-" 
        )
      }
    }
  ]
  return (
    <Fragment>
      <Card className='pageBox buyer-screen'>
        <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
          <CardTitle tag='h2'>List of Assortments</CardTitle>
          <Button.Ripple className='ms-1' outline color='warning' onClick={downloadArticleModal}>
              <Download size={14} />
              <span className='align-middle ms-25'>Download Assortment PDF</span>
            </Button.Ripple>
          <UncontrolledButtonDropdown className='ms-2'>
            <DropdownToggle color='primary' caret outline>
              <Download size={15} />
              <span className='align-middle ms-25'>Assortment Download</span>
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem className='w-100' onClick={() => handleDownloadCSV()}>
                <FileText size={15} />
                <span className='align-middle ms-50'>CSV</span>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledButtonDropdown>
        </CardHeader>
        <CardBody>
          <Row className='mb-50 g-1 filter-row filter-buyer'>
            <Col className='col-auto'>
              <Label className='form-label'>Supplier Number</Label>
              <Select
                theme={selectThemeColors}
                className='react-select'
                classNamePrefix='select'
                defaultValue={supllierNumberOptions ? supllierNumberOptions[1] : supllierNumberOptions}
                name='supplier_number'
                options={supllierNumberOptions}
                value={supllierNumberOptions ? supllierNumberOptions.filter(function (option) {
                  return option.value === searchSupplierNumber
                }) : ''}
                onChange={handleSupplierNumberFilter}
              />
            </Col>
            <Col className='col-auto'>
              <Label className='form-label ' for='date'>
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
            <Col className='col-auto'>
              <Label className='form-label' for='status'>
                Category:
              </Label>
              <Select
                theme={selectThemeColors}
                className='react-select category-Select'
                classNamePrefix='select'
                defaultValue={categoryOptions ? categoryOptions[1] : categoryOptions}
                name='status'
                options={categoryOptions}
                value={categoryOptions ? categoryOptions.filter(function (option) {
                  return option.value === searchCategory
                }) : ''}
                onChange={handleCategoryFilter}
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
      </Card>
      <DownloadSupplierAssortmentsModal open={supplierInputModal} handleModal={downloadArticleModal} supllierNumberOptions={supllierNumberOptions} />
      <AddBuyerInputModal open={editBuyerModal} handleModal={handleEdit} rowData={rowData} setsupplierInputsData={setsupplierInputsData} />
    </Fragment>
  )
}
export default BuyerInput

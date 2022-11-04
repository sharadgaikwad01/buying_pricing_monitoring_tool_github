import { Fragment, useState, useEffect } from 'react'
import Select from 'react-select'

import { selectThemeColors, nodeBackend } from '@utils'
import axios from 'axios'

// ** Add New Modal Component
import Flatpickr from 'react-flatpickr'
import AddBuyerInputModal from './AddBuyerInputModal'
import ReactPaginate from 'react-paginate'
import DataTable from 'react-data-table-component'
import { Download, Search, ChevronDown, Share, Printer, FileText, File, Grid, Copy, Plus, Upload, Edit, Trash, Check } from 'react-feather'

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

  const [supplierInputsData, setsupplierInputsData] = useState([])
  const [searchSupplierNumber, setSupplierNumber] = useState('')
  const [searchRequestedDate, setSearchRequestedDate] = useState('')
  const [searchStatus, setSearchStatus] = useState('')

  const [editBuyerModal, setBuyerInputModal] = useState(false)

  const [currentPage, setCurrentPage] = useState(0)

  // ** Function to handle Pagination
  const handlePagination = page => {
    setCurrentPage(page.selected)
  }

  const [supllierNumberOptions, setsupllierNumberOptions] = useState([])
  const [rowData, setRowData] = useState([])

  useEffect(async () => {
    const user_type = localStorage.getItem("type")
    if (user_type === 'SUPPLIER') {
      props.history.push('/home')
    }

    await axios.get(`${nodeBackend}/buyer_input`, { params: { searchSupplierNumber, searchRequestedDate, country } }).then((res) => {

      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
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

  const handleDownloadCSV = async () => {

    await axios.get(`${nodeBackend}/buyer_article_details`, { params: { country } }).then((res) => {

      downloadCSV(res.data.data)
    })
  }

  // ** Function to handle supplier filter
  const handleSupplierNumberFilter = async (e) => {
    const searchSupplierNumber = e.value
    setSupplierNumber(searchSupplierNumber)

    await axios.get(`${nodeBackend}/buyer_input`, { params: { searchSupplierNumber, searchRequestedDate, country } }).then((res) => {
      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
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
    await axios.get(`${nodeBackend}/buyer_input`, { params: { searchSupplierNumber, searchRequestedDate, country } }).then((res) => {
      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
    })
  }

  // ** Function to handle status filter
  const handleStatusFilter = async (e) => {
    const searchStatus = e.value
    setSearchStatus(searchStatus)
    await axios.get(`${nodeBackend}/buyer_input`, { params: { searchSupplierNumber, searchRequestedDate, searchStatus, country } }).then((res) => {
      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
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
          data: { id, country}
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

  const columns = [
    {
      name: '#',
      center: 'yes',
      width: '50px',
      cell: (row, index) => index + 1
    },
    {
      name: 'Actions',
      center: 'yes',
      width: '80px',
      allowOverflow: true,
      cell: (row) => {
        return (
          row.action_status === 'open' ? <div className='d-flex'><Edit size={15} onClick={(e) => handleEdit(e, row)} className="editTableIcon text-info" /><Check size={15} onClick={(e) => handleClosedAction(e, row)} className="deleteTableIcon text-success ms-1" /></div> : "-"
        )
      }
    },
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
          row.suppl_no ? row.suppl_no : "-"
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
      name: 'Art. Desp',
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
          row.current_price ? row.current_price : "-"
        )
      }
    },
    {
      name: 'New Price',
      sortable: true,
      minWidth: 'auto',
      selector: row => row.new_price,
      cell: row => {
        return (
          row.new_price ? row.new_price : "-"
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
          row.price_difference_perc ? row.price_difference_perc : "-"
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
      name: 'Final Price',
      sortable: true,
      width: 'auto',
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
      minWidth: 'auto',
      selector: row => row.price_increase_effective_date,
      cell: row => {
        return (
          row.price_increase_effective_date ? row.price_increase_effective_date : "-"
        )
      }
    }
  ]
  return (
    <Fragment>
      <Card className='pageBox buyer-screen'>
        <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
          <CardTitle tag='h2'>Inflation Price Data</CardTitle>
          <UncontrolledButtonDropdown className='ms-2'>
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
        </CardHeader>
        <CardBody>
          <Row className='mb-50 g-1 filter-row filter-buyer'>
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
              <Label className='form-label' for='date'>
                Requested Date:
              </Label>
              <Flatpickr
                className='form-control'
                value={searchRequestedDate}
                onChange={date => handleRequestedDateFilter(date)}
                id='default-picker'
                options={{
                  dateFormat: 'Y-m-d'
                }}
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
          </Row>
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
        </CardBody>
      </Card>
      <AddBuyerInputModal open={editBuyerModal} handleModal={handleEdit} rowData={rowData} />
    </Fragment>
  )
}
export default BuyerInput

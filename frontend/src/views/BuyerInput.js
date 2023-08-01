import { Fragment, useState, useEffect, forwardRef } from 'react'
import Select from 'react-select'
import { Link } from 'react-router-dom'

import { selectThemeColors, nodeBackend } from '@utils'
import axios from 'axios'
import { utils, writeFile } from 'xlsx'

import LoadingSpinner from '@src/@core/components/spinner/Loading-spinner.js'

// ** Add New Modal Component
import Flatpickr from 'react-flatpickr'
import AddBuyerInputModal from './AddBuyerInputModal'
import AddNewModal from './AddNewModal'
import EditSupplierRequestModal from './EditSupplierRequestModal'
import ReactPaginate from 'react-paginate'
import DataTable from 'react-data-table-component'
import DownloadSupplierAssortmentsModal from './DownloadSupplierAssortmentsModal'
import { Download, Search, ChevronDown, Share, Printer, FileText, File, Grid, Copy, Plus, Upload, Edit, Trash, Check, RefreshCcw, ArrowLeftCircle, Repeat, Edit3 } from 'react-feather'
import UploadBuyerArticliesModal from './UploadBuyerArticliesModal'
import DownloadArticliesModal from './DownloadArticlesModal'

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
  Badge,
  Tooltip
} from 'reactstrap'


import Swal from 'sweetalert2'
import moment from 'moment'
import withReactContent from 'sweetalert2-react-content'
import  secureLocalStorage  from  "react-secure-storage"

const MySwal = withReactContent(Swal)

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'yet_to_approve', label: 'Yet to Approve' }
]

const BootstrapCheckbox = () => forwardRef((props, ref) => (
  <div className='form-check'>
    <Input type='checkbox' ref={ref} {...props} />
  </div>
))

const BuyerInput = props => {
  const country = secureLocalStorage.getItem('country')
  const email = secureLocalStorage.getItem('email')
  const [isLoading, setIsLoading] = useState(false)

  const [Picker, setPicker] = useState('')
  const [supplierInputsData, setsupplierInputsData] = useState([])
  const [searchSupplierNumber, setSupplierNumber] = useState('')
  const [searchRequestedDate, setSearchRequestedDate] = useState('')
  const [searchStatus, setSearchStatus] = useState('')
  const [searchCategory, setSearchCategory] = useState('')
  const [editBuyerModal, setBuyerInputModal] = useState(false)
  const [rosIds, setRosIds] = useState([])

  const [editSupplierModal, setEditSupplierModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  const [pdfDownload, setPDFDownload] = useState(false)
  const [supplierInputModal, setSupplierInputModal] = useState(false)
  const [uploadArticleModal, setUploadArticleModal] = useState(false)
  const [downloadArticles, setDownloadArticles] = useState(false)

  const [refreshButton, setrefreshButton] = useState(false)
  const [addButton, setAddButton] = useState(false)
  const [closedStatusButton, setClosedStatusButton] = useState(false)
  const [editButton, setEditButton] = useState(false)
  const [editButtonb, setEditButtonb] = useState(false)
  const [statusButton, setStatusButton] = useState(false)
  const [revokeButton, setRevokeButton] = useState(false)
  const [supplierListOption, setSupplierListOption] = useState([])
  const [pageCount, setpageCount] = useState([])
  const downloadArticlePDFModal = () => setPDFDownload(!pdfDownload)
  const handleUploadArticleModal = () => setUploadArticleModal(!uploadArticleModal)
  const downloadArticleModal = () => setDownloadArticles(!downloadArticles)
  const supplierInputNewModal = () => setSupplierInputModal(!supplierInputModal)

  const [supllierNumberOptions, setsupllierNumberOptions] = useState([])
  const [categoryOptions, setCategoryOptions] = useState([])
  const [rowData, setRowData] = useState([])

  const fileName = `buyer_input_${moment().format('DD-MM-YYYY')}`
  const [fileFormat] = useState('xlsx')

  // ** Function to handle Pagination
  
  useEffect(async () => {
    const user_type = secureLocalStorage.getItem("type")
    console.log("user_type")
    console.log(user_type)
    if (user_type === '' || user_type === null) {
      props.history.push('/buyer_login')
    }
    if (user_type === 'SUPPLIER') {
      props.history.push('/home')
    }
    setIsLoading(true)
    await axios.get(`${nodeBackend}/buyer_input`, { params: { searchSupplierNumber, searchRequestedDate, searchStatus, searchCategory, country, email, currentPage } }).then((res) => {
      if (res.data.data) {
        setsupplierInputsData(res.data.data.supplierInputs)
        setsupllierNumberOptions(res.data.data.supplierIDOptions)
        setCategoryOptions(res.data.data.categoryOptions)
        setSupplierListOption(res.data.data.supplierListOption)
        setpageCount(res.data.data.pageCount)
        setIsLoading(false)
      } else {
        setIsLoading(false)
      }
    })
    
  }, [])

  const dataToRender = () => {
    return supplierInputsData
  }

  // const handleUploadArticleModalclick = () => {
  //   setIsLoading(true)
  //   handleUploadArticleModal()
  //   setTimeout(function() { setIsLoading(false) }, 1000)
  // }
  const handlePagination = async page => {
    setCurrentPage(page.selected)
    console.log(++page.selected)
    // setIsLoading(true)
    // await axios.get(`${nodeBackend}/buyer_input`, { params: { searchSupplierNumber, searchRequestedDate, searchStatus, searchCategory, country, email, currentPage } }).then((res) => {
    //   if (res.data.data) {
    //     setsupplierInputsData(res.data.data.supplierInputs)
    //     setsupllierNumberOptions(res.data.data.supplierIDOptions)
    //     setCategoryOptions(res.data.data.categoryOptions)
    //     setSupplierListOption(res.data.data.supplierListOption)
    //     setpageCount(res.data.data.pageCount)
    //     setIsLoading(false)
    //   } else {
    //     setIsLoading(false)
    //   }
    // })
  }

  // ** Custom Pagination
  const CustomPagination = () => (
    <ReactPaginate
      previousLabel=''
      nextLabel=''
      forcePage={currentPage}
      onPageChange={page => handlePagination(page)}
      // pageCount={Math.ceil(dataToRender().length / 7) || 1}
      pageCount={pageCount}
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

  const assortmentDownload = async (flag) => {
    setIsLoading(true)
    await axios.get(`${nodeBackend}/buyer_article_details`, { params: { country, email, searchSupplierNumber, searchRequestedDate, searchStatus, searchCategory } }).then((res) => {
      const csvdata = res.data.data
      
      csvdata.forEach(function (item) {
        delete item.row_id
        delete item.frmt_new_price
      })
      const finalcsvdata = csvdata.map(item => ({
        "Supplier Number": item.suppl_no ? item.suppl_no.replace(",", ".") : item.suppl_no,
        "Supplier Name": item.suppl_name ? item.suppl_name.replace(",", ".") : item.suppl_name,
        "Article Number": item.art_no ? item.art_no.replace(",", ".") : item.art_no,
        "Subsystem Number": item.mikg_art_no ? item.mikg_art_no.replace(",", ".") : item.mikg_art_no,
        "EAN Number": item.ean_no ? item.ean_no.replace(",", ".") : item.ean_no,
        "Article Description": item.art_name_tl ? item.art_name_tl.replace(",", ".") : item.art_name_tl,
        "Current Price": item.frmt_current_price ? item.frmt_current_price.replace("€", "").replace(",", ".") : item.frmt_current_price,
        "Requested Price": item.new_price ? item.new_price.replace(",", ".") : item.new_price,
        "Price Increase in %": item.price_increase_perc ? item.price_increase_perc.replace(",", ".") : item.price_increase_perc,
        "Requested Date": item.request_date ? item.request_date.replace(",", ".") : item.request_date,
        "Price change Reason": item.price_change_reason ? item.price_change_reason.replace(",", ".") : item.price_change_reason,
        "Article Status": item.action_status ? item.action_status.replace(",", ".") : item.action_status,
        "Final Price": item.negotiate_final_price ? item.negotiate_final_price.replace(",", ".") : item.negotiate_final_price,
        "Price Finalize Date": item.price_increase_communicated_date ? item.price_increase_communicated_date.replace(",", ".") : item.price_increase_communicated_date,
        "Price Effective Date": item.price_increase_effective_date ? item.price_increase_effective_date.replace(",", ".") : item.price_increase_effective_date,
        "Category Name": item.stratbuyer_name ? item.stratbuyer_name.replace(",", ".") : item.stratbuyer_name
      }))
      if (flag === 1) {
        setIsLoading(false)
        downloadCSV(finalcsvdata)
      } else {
        const name = fileName.length ? `${fileName}.${fileFormat}` : `buyer_input_${moment().format('DD-MM-YYYY')}.xlsx`
        const wb = utils.json_to_sheet(finalcsvdata)
        const wbout = utils.book_new()
        utils.book_append_sheet(wbout, wb, fileName)
        setIsLoading(false)
        writeFile(wbout, name)
        setIsLoading(false)
      }
    })
  }

  // ** Function to handle supplier filter
  const handleSupplierNumberFilter = async (e) => {
    const searchSupplierNumber = e.value
    setSupplierNumber(searchSupplierNumber)
    setIsLoading(true)
    await axios.get(`${nodeBackend}/buyer_input`, { params: { searchSupplierNumber, searchRequestedDate, searchStatus, searchCategory, country, email, currentPage } }).then((res) => {
      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
      setCategoryOptions(res.data.data.categoryOptions)
      setpageCount(res.data.data.pageCount)
      setIsLoading(false)
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
    setIsLoading(true)
    await axios.get(`${nodeBackend}/buyer_input`, { params: { searchSupplierNumber, searchRequestedDate, searchStatus, searchCategory, country, email, currentPage } }).then((res) => {
      if (res.data.data) {
        setIsLoading(false)
        setsupplierInputsData(res.data.data.supplierInputs)
        setsupllierNumberOptions(res.data.data.supplierIDOptions)
        setCategoryOptions(res.data.data.categoryOptions)
        setpageCount(res.data.data.pageCount)
       
      } else {
        setIsLoading(false)
      }
    })
  }

  // ** Function to handle status filter
  const handleStatusFilter = async (e) => {
    const searchStatus = e.value
    setSearchStatus(searchStatus)
    setIsLoading(true)
    await axios.get(`${nodeBackend}/buyer_input`, { params: { searchSupplierNumber, searchRequestedDate, searchStatus, searchCategory, country, email, currentPage } }).then((res) => {
      setIsLoading(false)
      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
      setCategoryOptions(res.data.data.categoryOptions)
      setpageCount(res.data.data.pageCount)
      
    })
  }

  const handleCategoryFilter = async (e) => {
    const searchCategory = e.value
    setSearchCategory(searchCategory)
    setIsLoading(true)
    await axios.get(`${nodeBackend}/buyer_input`, { params: { searchSupplierNumber, searchRequestedDate, searchStatus, searchCategory, country, email, currentPage } }).then((res) => {
      setIsLoading(false)
      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
      setCategoryOptions(res.data.data.categoryOptions)
      setpageCount(res.data.data.pageCount)
    })
  }

  // ** Function to handle edit
  const handleEdit = async (e, row) => {
    setRowData(row)
    setBuyerInputModal(!editBuyerModal)
  }

  const handleEditSupplierInput = async (e, row) => {
    setRowData(row)
    setEditSupplierModal(!editSupplierModal)
  }

  const handleClosedAction = (e, row, flag) => {
    const id = row.row_id
    let confirmButtonText = ''
    let text = ''
    e.preventDefault()
    if (flag === 1) {
      confirmButtonText = 'Yes, Close it'
      text = 'Request has been closed successfully'
    } else {
      confirmButtonText = 'Yes, Revoke it'
      text = 'Request closed status has been revoke successfully'
    }
    MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `${confirmButtonText}`,
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-danger ms-1'
      },
      buttonsStyling: false
    }).then(function (result) {
      if (result.value) {
        axios({
          method: "post",
          url: `${nodeBackend}/closed_and_revoke_input`,
          data: { id, country, email, flag }
        })
          .then(function (success) {
            //handle success        
            if (success.data.status) {
              setsupplierInputsData(success.data.data.supplierInputs)
              return MySwal.fire({
                title: 'Done!',
                text: `${text}`,
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
    setIsLoading(true)
    await axios.get(`${nodeBackend}/buyer_input`, { params: { searchSupplierNumber, searchRequestedDate, searchStatus, searchCategory, country, email, currentPage } }).then((res) => {
      if (res.data.data) {
        setsupplierInputsData(res.data.data.supplierInputs)
        setsupllierNumberOptions(res.data.data.supplierIDOptions)
        setCategoryOptions(res.data.data.categoryOptions)
        setpageCount(res.data.data.pageCount)
        setIsLoading(false)
      } else {
        setIsLoading(false)
      }
    })
  }

  const handleChange = (state) => {
    const row_ids = []
    state.selectedRows.map(i => {
      row_ids.push(i.row_id)
    })
    setRosIds(row_ids)
  }

  const handleMultipleStatus = () => {
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
          url: `${nodeBackend}/bulk_closed_supplier_input`,
          data: { rosIds, country, email }
        })
          .then(function (success) {
            //handle success        
            if (success.data.status) {
              setsupplierInputsData(success.data.data.buyerInputs)
              return MySwal.fire({
                title: 'Done!',
                text: `Selected ${success.data.sucess_count} Request has been closed successfully`,
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

  const rowDisabledCriteria = row => {
    if (row.negotiate_final_price !== null && row.price_increase_communicated_date !== null && row.action_status === 'open') {
      return false
    } else {
      return true
    }
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
        const searchArticleNumber = ''
        axios({
          method: "post",
          url: `${nodeBackend}/delete_supplier_input_behalf_of_supplier`,
          data: { id, country, email, searchSupplierNumber, searchArticleNumber, searchRequestedDate, searchStatus }
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
  const tableCustomStyles = {
    headCells: {
      style: {
        // fontSize: '20px',
        // fontWeight: 'bold',
        paddingLeft: '0px',
        justifyContent: 'center',
        width: '140px'
        // textAlign:'left'
        // backgroundColor: '#FFA500'
      }
    },
    bodyCells: {
      style: {
        // fontSize: '20px',
        // fontWeight: 'bold',
        paddingLeft: '0px',
        justifyContent: 'center',
        width: '140px'
        // textAlign:'left'
        // backgroundColor: '#FFA500'
      }
    }
  }

  const columns = [
    {
      name: 'Row Id',
      omit: true,
      // maxWidth: 400,
      // minWidth: 140,
      // size: 200,
      // width: 200,
      selector: row => row.row_id
    },
    {
      name: 'Supplier No.',
      sortable: true,
      // width: 'auto',
      // maxWidth: 400,
      // minWidth: 140,
      // width: 200,
      // size: 200,
      center: 'yes',
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
      // minWidth: 'auto',
      // maxWidth: 400,
      // minWidth: 140,
      // width: 200,
      // width: 200,
      // center: 'yes',
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
      // maxWidth: 400,
      // minWidth: 140,
      // width: 200,
      center: 'yes',
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
      // minWidth: 'auto',
      // width: 200,
      // center: 'yes',
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
      // minWidth: 'auto',
      //   maxWidth: 400,
      // minWidth: 140,
      // width: 200,
      // center: 'yes',
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
      // maxWidth: 400,
      // minWidth: 140,
      // width: 200,
      // center: 'yes',
      width: 'auto',
      center: 'yes',
      selector: row => row.frmt_current_price,
      cell: row => {
        return (
          row.frmt_current_price ? `${row.frmt_current_price}` : "-"
        )
      }
    },
    {
      name: 'Requested Price',
      sortable: true,
      // maxWidth: 400,
      // minWidth: 140,
      // width: 200,
      // center: 'yes',
      selector: row => row.frmt_new_price,
      cell: row => {
        return (
          row.frmt_new_price ? `${row.frmt_new_price}` : "-"
        )
      }
    },
    {
      name: 'Price Increase(%)',
      sortable: true,
      // minWidth: 'auto',
      // center: 'yes',
      selector: row => row.price_increase_perc,
      cell: row => {
        return (
          `${row.price_increase_perc}%`
          // row.negotiate_final_price ? `${(((row.new_price - row.current_price) / row.current_price) * 100).toFixed(2)}%` : `${(((row.negotiate_final_price - row.current_price) / row.current_price).toFixed(2) * 100).toFixed(2)}%`
        )
      }
    },
    {
      name: 'Request Creation_Date',
      sortable: true,
      // minWidth: 'auto',
      // center: 'yes',
      selector: row => row.request_date,
      cell: row => {
        return (
          row.request_date ? row.request_date : "-"
        )
      }
    },
    {
      name: 'Reason For Price_Change',
      sortable: true,
      // minWidth: 'auto',
      // center: 'yes',
      selector: row => row.price_change_reason,
      cell: row => {
        return (
          row.price_change_reason ? row.price_change_reason : "-"
        )
      }
    },
    {
      name: 'Price Effective_Date',
      sortable: true,
      // minWidth: 'auto',
      // center: 'yes',
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
      center: 'yes',
      selector: row => row.frmt_negotiate_final_price,
      cell: row => {
        return (
          row.frmt_negotiate_final_price ? row.frmt_negotiate_final_price : "-"
        )
      }
    },
    {
      name: 'Price Finalize_Date',
      sortable: true,
      // width: 'auto',
      // center: 'yes',
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
      center: 'yes',
      sortable: true,
      selector: row => row.action_status,
      cell: row => {
        return (
          row.action_status === 'open' ? <div><Badge color="primary" pill>Open</Badge><br /><span className='text-muted font-small-2'>{row.previous_request_days > 0 ? row.previous_request_days > 1 ? `${row.previous_request_days} Days Ago` : `${row.previous_request_days} Day Ago` : ''}  </span></div> : <div><Badge color="success" pill>Closed</Badge><br /><span className='text-muted font-small-2'>{row.previous_request_days > 0 ? row.previous_request_days > 1 ? `${row.previous_request_days} Days Ago` : `${row.previous_request_days} Day Ago` : ''}  </span></div>
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
          row.negotiate_final_price && row.price_increase_communicated_date && row.action_status === 'open' ? <div className='d-flex'><Edit size={15} onClick={(e) => handleEdit(e, row)} className="editTableIcon text-info" id='editButton' /><Tooltip placement='top' isOpen={editButton} target='editButton' toggle={() => setEditButton(!editButton)} >Edit</Tooltip><Check size={15} onClick={(e) => handleClosedAction(e, row, 1)} className="deleteTableIcon text-success ms-1" id='statusButton' /><Tooltip placement='top' isOpen={statusButton} target='statusButton' toggle={() => setStatusButton(!statusButton)}>Closed</Tooltip></div> : row.action_status === 'open' ? row.created_by === email ? <div className='d-flex'>
            <a onClick={(e) => handleEditSupplierInput(e, row)} className="editTableIcon text-info" id="editButtonb">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H322.8c-3.1-8.8-3.7-18.4-1.4-27.8l15-60.1c2.8-11.3 8.6-21.5 16.8-29.7l40.3-40.3c-32.1-31-75.7-50.1-123.9-50.1H178.3zm435.5-68.3c-15.6-15.6-40.9-15.6-56.6 0l-29.4 29.4 71 71 29.4-29.4c15.6-15.6 15.6-40.9 0-56.6l-14.4-14.4zM375.9 417c-4.1 4.1-7 9.2-8.4 14.9l-15 60.1c-1.4 5.5 .2 11.2 4.2 15.2s9.7 5.6 15.2 4.2l60.1-15c5.6-1.4 10.8-4.3 14.9-8.4L576.1 358.7l-71-71L375.9 417z" />
              </svg>
              <Tooltip placement='top' isOpen={editButtonb} target='editButtonb' toggle={() => setEditButtonb(!editButtonb)} >Edit behalf of supplier</Tooltip>
            </a>
            
            <Trash size={15} onClick={(e) => handleDelete(e, row)} className="deleteTableIcon text-danger ms-1" /> 
            <Edit size={15} onClick={(e) => handleEdit(e, row)} className="editTableIcon text-info ms-1" id='editButton' />
            <Tooltip placement='top' isOpen={editButton} target='editButton' toggle={() => setEditButton(!editButton)} >Edit</Tooltip>
            </div> : <div className='d-flex'><Edit size={15} onClick={(e) => handleEdit(e, row)} className="editTableIcon text-info" id='editButton' /><Tooltip placement='top' isOpen={editButton} target='editButton' toggle={() => setEditButton(!editButton)} >Edit</Tooltip></div> : row.is_revoke === 'false' ? "" : <div className='d-flex'><Repeat size={15} onClick={(e) => handleClosedAction(e, row, 2)} className="editTableIcon text-warning" id='revokeButton' /><Tooltip placement='top' isOpen={revokeButton} target='revokeButton' toggle={() => setRevokeButton(!revokeButton)} >Revoke Closed Status</Tooltip></div>
        )
      }
    }
  ]
  return (
    <Fragment>
      {isLoading ? <LoadingSpinner /> : <Card className='pageBox buyer-screen'>
        <CardHeader className='align-items-center align-items-start border-bottom'>
          <CardTitle tag='h2'>List of Assortment</CardTitle>
          <div className='d-md-flex mt-md-0 mt-1 btn-row document-btn-row'>
            <Button.Ripple className='ms-1 btn-icon' color='primary' onClick={downloadArticlePDFModal}>
              <Download size={16} />
              <span className='align-middle ms-25'>Download Assortment PDF</span>
            </Button.Ripple>
            <Button.Ripple className='ms-1' outline color='warning' onClick={downloadArticleModal}>
              <Download size={14} />
              <span className='align-middle ms-25'>Multiple Assortment Inputs</span>
            </Button.Ripple>
            <Button.Ripple className='ms-1' outline color='info' onClick={handleUploadArticleModal}>
              <Upload size={14} />
              <span className='align-middle ms-25'>Upload Multiple Assortment Inputs</span>
            </Button.Ripple>
            <UncontrolledButtonDropdown className=''>
              <DropdownToggle color='primary' caret outline>
                <Download size={15} />
                <span className='align-middle ms-25'>Assortment Download</span>
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem className='w-100' onClick={() => assortmentDownload(1)}>
                  <FileText size={15} />
                  <span className='align-middle ms-50'>CSV</span>
                </DropdownItem>
                <DropdownItem className='w-100' onClick={() => assortmentDownload(2)}>
                  <Grid size={15} />
                  <span className='align-middle ms-50'>Excel</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledButtonDropdown>
            <Button.Ripple className='ms-1 btn-icon' id='addButton' color='primary' onClick={supplierInputNewModal}>
              <Plus size={16} />
            </Button.Ripple>
            <Tooltip
              placement='top'
              isOpen={addButton}
              target='addButton'
              toggle={() => setAddButton(!addButton)}
            >
              Add Supplier input
            </Tooltip>
          </div>
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
              <Button.Ripple className='btn-icon me-1' id='refreshButton' color='primary' onClick={handleRefresh}>
                <RefreshCcw size={16} />
              </Button.Ripple>
              <Tooltip
                placement='top'
                isOpen={refreshButton}
                target='refreshButton'
                toggle={() => setrefreshButton(false)}
              >
                Refresh Filter
              </Tooltip>
              <Button.Ripple className='btn-icon me-1' id='closedStatusButton' color='success' onClick={handleMultipleStatus}>
                <Check size={16} />
              </Button.Ripple>
              <Tooltip
                placement='top'
                isOpen={closedStatusButton}
                target='closedStatusButton'
                toggle={() => setClosedStatusButton(!closedStatusButton)}
              >
                Close Multiple records
              </Tooltip>
            </Col>
          </Row>
          <div className='react-dataTable my-1'>
            <DataTable
              noHeader
              pagination
              selectableRows
              columns={columns}
              paginationPerPage={7}
              className='react-dataTable'
              sortIcon={<ChevronDown size={10} />}
              paginationDefaultPage={currentPage + 1}
              paginationComponent={CustomPagination}
              selectableRowsComponent={BootstrapCheckbox()}
              onSelectedRowsChange={handleChange}
              selectableRowDisabled={rowDisabledCriteria}
              customStyles={tableCustomStyles}
              // data={searchValue.length ? filteredData : data}
              data={dataToRender()}
            />
          </div>
        </CardBody>
      </Card>
      }
      <DownloadSupplierAssortmentsModal open={pdfDownload} handleModal={downloadArticlePDFModal} supllierNumberOptions={supllierNumberOptions} />

      <AddBuyerInputModal open={editBuyerModal} handleModal={handleEdit} rowData={rowData} setsupplierInputsData={setsupplierInputsData} />

      <UploadBuyerArticliesModal open={uploadArticleModal} handleModal={handleUploadArticleModal} setsupplierInputsData={setsupplierInputsData} />

      <DownloadArticliesModal open={downloadArticles} handleModal={downloadArticleModal} supllierNumberOptions={supllierNumberOptions} flag={2} />

      <AddNewModal open={supplierInputModal} handleModal={supplierInputNewModal} supllierNumberOptions={supplierListOption} setsupplierInputsData={setsupplierInputsData} type={'behalf_of_supplier'} />

      <EditSupplierRequestModal open={editSupplierModal} handleModal={handleEditSupplierInput} rowData={rowData} supllierNumberOptions={supllierNumberOptions} setsupplierInputsData={setsupplierInputsData} searchSupplierNumber={searchSupplierNumber} searchArticleNumber={''} searchRequestedDate={searchRequestedDate} searchStatus={searchStatus} type={'behalf_of_supplier'} />

    </Fragment>
  )
}
export default BuyerInput

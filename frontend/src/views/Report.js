import { Fragment, useState, useEffect } from 'react'
import Select from 'react-select'
import { selectThemeColors, nodeBackend } from '@utils'
import axios from 'axios'
import { utils, writeFile } from 'xlsx'

import LoadingSpinner from '@src/@core/components/spinner/Loading-spinner.js'
// ** Add New Modal Component
import Flatpickr from 'react-flatpickr'
import ReactPaginate from 'react-paginate'
import DataTable from 'react-data-table-component'
import { Download, Search, ChevronDown, Share, Printer, FileText, File, Grid, Copy, Plus, Upload, Edit, Trash, Check, RefreshCcw, ArrowLeftCircle, Repeat, Edit3 } from 'react-feather'

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
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)

const Report = props => {
  const country = localStorage.getItem('country')
  const email = localStorage.getItem('email')
  const [isLoading, setIsLoading] = useState(false)

  const [Picker, setPicker] = useState('')
  const [supplierInputsData, setsupplierInputsData] = useState([])
  const [searchSupplierNumber, setSupplierNumber] = useState('')
  const [searchRequestedDate, setSearchRequestedDate] = useState('')
  
  const [searchCategory, setSearchCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  const [refreshButton, setrefreshButton] = useState(false)
  const [BPAcount, setBPAcount] = useState(false)
  
  // ** Function to handle Pagination
  const handlePagination = page => {
    setCurrentPage(page.selected)
  }
  
  const [supllierNumberOptions, setsupllierNumberOptions] = useState([])
  const [categoryOptions, setCategoryOptions] = useState([])

  const [fileName] = useState('export')
  const [fileFormat] = useState('xlsx')

  useEffect(async () => {
    const user_type = localStorage.getItem("type")
    if (user_type === 'SUPPLIER') {
      props.history.push('/home')
    }
    setIsLoading(true)
    await axios.get(`${nodeBackend}/reports`, { params: { searchSupplierNumber, searchRequestedDate, searchCategory, country, email } }).then((res) => {
      if (res.data.data) {
        setsupplierInputsData(res.data.data.supplierInputs)
        setsupllierNumberOptions(res.data.data.supplierIDOptions)
        setCategoryOptions(res.data.data.categoryOptions)
        setBPAcount(res.data.data.BPAcount)
        setIsLoading(false)
      } else {
        setIsLoading(false)
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

  const assortmentDownload = async (flag) => {
    await axios.get(`${nodeBackend}/reports`, { params: { country, email, searchSupplierNumber, searchRequestedDate, searchCategory } }).then((res) => {
      const csvdata = res.data.data.supplierInputs
      console.log(csvdata)
      const finalcsvdata = csvdata.map(item => ({
        "Supplier Number": item.supplier_no ? item.supplier_no : item.supplier_no,
        "Supplier Name": item.supplier_name ? item.supplier_name : item.supplier_name,
        "Article Number": item.art_no ? item.art_no : item.art_no,
        "Price Updated": item.price_updated ? item.price_updated : item.price_updated,
        "Requested Date": item.price_updated_date ? item.price_updated_date : item.price_updated_date,
        " Source": item.source_name ? item.source_name : item.source_name,
        " Country": item.country_code ? item.country_code : item.country_code,
        " Category Name": item.stratbuyer_name ? item.stratbuyer_name : item.stratbuyer_name,
        "BPA Tool": item.bpa_updated_status ? item.bpa_updated_status : item.bpa_updated_status
      }))
      if (flag === 1) {
        downloadCSV(finalcsvdata)
      } else {
        const name = fileName.length ? `${fileName}.${fileFormat}` : `excel-sheet.${fileFormat}`
        const wb = utils.json_to_sheet(finalcsvdata)
        const wbout = utils.book_new()
        utils.book_append_sheet(wbout, wb, fileName)
        writeFile(wbout, name)
      }
    })
  }

  // ** Function to handle supplier filter
  const handleSupplierNumberFilter = async (e) => {
    const searchSupplierNumber = e.value
    setSupplierNumber(searchSupplierNumber)
    setIsLoading(true)
    await axios.get(`${nodeBackend}/reports`, { params: { searchSupplierNumber, searchRequestedDate, searchCategory, country, email } }).then((res) => {
      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
      setCategoryOptions(res.data.data.categoryOptions)
      setBPAcount(res.data.data.BPAcount)
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
    await axios.get(`${nodeBackend}/reports`, { params: { searchSupplierNumber, searchRequestedDate, searchCategory, country, email } }).then((res) => {
      if (res.data.data) {
        setIsLoading(false)
        setsupplierInputsData(res.data.data.supplierInputs)
        setsupllierNumberOptions(res.data.data.supplierIDOptions)
        setCategoryOptions(res.data.data.categoryOptions)
        setBPAcount(res.data.data.BPAcount)
       
      } else {
        setIsLoading(false)
      }
    })
  }

  const handleCategoryFilter = async (e) => {
    const searchCategory = e.value
    setSearchCategory(searchCategory)
    setIsLoading(true)
    await axios.get(`${nodeBackend}/reports`, { params: { searchSupplierNumber, searchRequestedDate, searchCategory, country, email } }).then((res) => {
      setIsLoading(false)
      setsupplierInputsData(res.data.data.supplierInputs)
      setsupllierNumberOptions(res.data.data.supplierIDOptions)
      setCategoryOptions(res.data.data.categoryOptions)
      setBPAcount(res.data.data.BPAcount)
      
    })
  }

  const handleRefresh = async () => {
    await setSupplierNumber("")
    await setSearchRequestedDate("")
    await setPicker("")
    await setSearchCategory("")

    const searchSupplierNumber = ''
    const searchRequestedDate = ''
    const searchCategory = ''
    setIsLoading(true)
    await axios.get(`${nodeBackend}/reports`, { params: { searchSupplierNumber, searchRequestedDate, searchCategory, country, email } }).then((res) => {
      if (res.data.data) {
        setsupplierInputsData(res.data.data.supplierInputs)
        setsupllierNumberOptions(res.data.data.supplierIDOptions)
        setCategoryOptions(res.data.data.categoryOptions)
        setBPAcount(res.data.data.BPAcount)
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
  }

  const rowDisabledCriteria = row => {
    if (row.negotiate_final_price !== null && row.price_increase_communicated_date !== null && row.action_status === 'open') {
      return false
    } else {
      return true
    }
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
      name: 'Supplier No.',
      sortable: true,
      // width: 'auto',
      // maxWidth: 400,
      // minWidth: 140,
      // width: 200,
      // size: 200,
      center: 'yes',
      selector: row => row.supplier_no,
      cell: row => {
        return (
          row.supplier_no ? row.supplier_no : "-"
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
      selector: row => row.supplier_name,
      cell: row => {
        return (
          row.supplier_name ? row.supplier_name : "-"
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
      name: 'Price Updated',
      sortable: true,
      // minWidth: 'auto',
      center: 'yes',
      selector: row => row.price_updated,
      cell: row => {
        return (
          row.price_updated ? `${row.price_updated}` : "-"
        )
      }
    },
    {
      name: 'Date',
      sortable: true,
      // minWidth: 'auto',
      center: 'yes',
      selector: row => row.price_updated_date,
      cell: row => {
        return (
          row.price_updated_date ? row.price_updated_date : "-"
        )
      }
    },
    {
      name: 'Source',
      sortable: true,
      // minWidth: 'auto',
      center: 'yes',
      selector: row => row.source_name,
      cell: row => {
        return (
          row.source_name ? row.source_name : "-"
        )
      }
    },
    {
      name: 'Country',
      sortable: true,
      // width: 'auto',
      center: 'yes',
      selector: row => row.country_code,
      cell: row => {
        return (
          row.country_code ? row.country_code : "ES"
        )
      }
    },
    {
      name: 'Category Name',
      width: 'auto',
      center: 'yes',
      sortable: row => row.stratbuyer_name,
      cell: row => {
        return (
          row.stratbuyer_name ? row.stratbuyer_name : ""
        )
      }
    },
    {
      name: 'BPA TOOL',
      width: 'auto',
      center: 'yes',
      sortable: row => row.bpa_updated_status,
      cell: row => {
        return (
          row.bpa_updated_status === 'Yes' ? <div><Badge color="success" pill>YES</Badge><br /></div> : <div><Badge color="danger" pill>NO</Badge></div>
        )
      }
    }
  ]
  return (
    <Fragment>
      {isLoading ? <LoadingSpinner /> : <Card className='pageBox buyer-screen'>
        <CardHeader className='align-items-center align-items-start border-bottom'>
          <CardTitle tag='h2'>Report Summary</CardTitle>
          <div className='d-md-flex mt-md-0 mt-1 btn-row document-btn-row'>
           
            <UncontrolledButtonDropdown className=''>
              <DropdownToggle color='primary' caret outline>
                <Download size={15} />
                <span className='align-middle ms-25'>Report Download</span>
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
            
          </div>
        </CardHeader>
        <CardBody>
        <Row className='mb-50 g-1 filter-row filter-buyer'>
        <Col className='col-auto'>
            <Label className='form-label'>Total request</Label> <Badge color="primary" pill> {supplierInputsData.length}</Badge>
            </Col>
            <Col className='col-auto'>
              <Label className='form-label'>Total BPA request</Label> <Badge color="primary" pill> {BPAcount}</Badge>
              </Col>
            <Col className='col-auto'>
              <Label className='form-label'>Without BPA</Label> <Badge color="primary" pill> {supplierInputsData.length - BPAcount }</Badge>
            </Col>
          </Row>
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
             
            </Col>
          </Row>
          <div className='react-dataTable my-1'>
            <DataTable
              noHeader
              pagination
              selectableRows
              columns={columns}
              paginationPerPage={10}
              className='react-dataTable'
              sortIcon={<ChevronDown size={10} />}
              paginationDefaultPage={currentPage + 1}
              paginationComponent={CustomPagination}
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

    </Fragment>
  )
}
export default Report

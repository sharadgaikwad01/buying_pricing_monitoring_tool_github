import { User, Briefcase, Mail, Calendar, DollarSign, X, ChevronDown } from 'react-feather'

import { Modal, Badge, Input, Label, Button, ModalHeader, ModalBody, InputGroup, InputGroupText, FormFeedback, Form } from 'reactstrap'

// ** Styles
import DataTable from 'react-data-table-component'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import '@styles/react/libs/flatpickr/flatpickr.scss'

import Swal from 'sweetalert2'
import ReactPaginate from 'react-paginate'
import withReactContent from 'sweetalert2-react-content'
import { useState } from 'react'
const MySwal = withReactContent(Swal)

const AddNewModalSupplier = ({ open, handleModal, rowData }) => {
  const [currentPage, setCurrentPage] = useState(0)
  // const [supplierInputsData, setsupplierInputsData] = useState([])
  const dataToRender = () => {
    return rowData
  }
  // ** Function to handle Pagination
  const handlePagination = page => {
    setCurrentPage(page.selected)
  }
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
          row.suppl_no
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
      name: 'Artical Description',
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
      name: 'Agreed Price in %',
      sortable: true,
      width: 'auto',
      selector: row => row.agreed_price_increase_perc,
      cell: row => {
        return (
          row.agreed_price_increase_perc ? `${row.agreed_price_increase_perc}%` : "-"
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
    }
  ]

  const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />
  return (
    <Modal
      isOpen={open}
      toggle={handleModal}
      className='sidebar-lg modal-lg'
      modalClassName='modal-in'
      contentClassName='pt-0 modal-lg'
    >
      <ModalHeader className='mb-1' toggle={handleModal} close={CloseBtn} tag='div'>
        <h5 className='modal-title'>All Record</h5>
      </ModalHeader>
      <ModalBody className='flex-grow-1'>
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
          <Button color='danger' onClick={handleModal} outline>
            Close
          </Button>
      </ModalBody>
    </Modal>
  )
}

export default AddNewModalSupplier

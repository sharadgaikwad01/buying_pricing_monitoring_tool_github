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

import { Link } from 'react-router-dom'

const MySwal = withReactContent(Swal)

const MintectDataModal = ({ open, handleModal, rowData }) => {
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
  
  const columns = [
    {
      name: 'Row Id',
      omit:true,
      selector: row => row.row_id
    },
    {
      name: 'Region',
      sortable: true,
      width: 'auto',
      selector: row => row.region,
      cell: row => {
        return (
          row.region
        )
      }
    },
    {
      name: 'Country Name',
      sortable: true,
      width: 'auto',
      selector: row => row.country_name,
      cell: row => {
        return (
          row.country_name
        )
      }
    },
    {
      name: 'Category',
      sortable: true,
      minWidth: 'auto',
      selector: row => row.category,
      cell: row => {
        return (
          row.category ? row.category : "-"
        )
      }
    },
    {
      name: 'Dashboard Name',
      sortable: true,
      minWidth: 'auto',
      selector: row => row.dashboard_name,
      cell: row => {
        return (
          row.dashboard_name ? row.dashboard_name : "-"
        )
      }
    },
    {
      name: 'Dashboard URL',
      sortable: true,
      minWidth: 'auto',
      selector: row => row.dashboard_url,
      cell: row => {
        return (
          row.dashboard_url ? <a target="blank" href={row.dashboard_url}>Dashboard URL</a> : "-"
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
        <h5 className='modal-title'>Mintec Dashboard Links</h5>
      </ModalHeader>
      <ModalBody className='flex-grow-1'>
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
          <Button color='danger' onClick={handleModal} outline>
            Close
          </Button>
      </ModalBody>
    </Modal>
  )
}

export default MintectDataModal

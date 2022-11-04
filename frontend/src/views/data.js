import { MoreVertical, Edit, FileText, Archive, Trash, Trash2 } from 'react-feather'

// ** Reactstrap Imports
import { Badge, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
// import axios from 'axios'
// ** Vars
// const states = ['success', 'danger', 'warning', 'info', 'dark', 'primary', 'secondary']
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)
import { nodeBackend } from '@utils'
// const status = {
//   1: { title: 'Open', color: 'light-warning' },
//   2: { title: 'Closed', color: 'light-success' },
//   3: { title: 'Rejected', color: 'light-danger' },
//   4: { title: 'In Progress', color: 'light-warning' }
// }


// ** Get initial Data


// ** Expandable table component
const ExpandableTable = ({ data }) => {
  return (
    <div className='expandable-content p-2'>
      <p>
        <span className='fw-bold'>City:</span> {data.city}
      </p>
      <p>
        <span className='fw-bold'>Experience:</span> {data.experience}
      </p>
      <p className='m-0'>
        <span className='fw-bold'>Post:</span> {data.post}
      </p>
    </div>
  )
}

// ** Table Common Column
export const columns = [
  {
    name: 'Sr. No',
    sortable: true,
    selector: row => row.art_no
  },
  {
    name: 'Supplier Number',
    sortable: true,
    selector: row => row.suppl_no
  },
  {
    name: 'Article Number',
    sortable: true,
    selector: row => row.art_no
  },
  {
    name: 'Art. Desp',
    sortable: true,
    selector: row => row.art_name_tl
  },

  {
    name: 'Category',
    sortable: true,
    selector: row => row.bdm_global_umbrella_name
  },
  {
    name: 'New Price',
    sortable: true,
    selector: row => row.new_price
  },
  {
    name: 'Request Date',
    sortable: true,
    selector: row => row.request_date
  },
  {
    name: 'Final Price',
    sortable: true,
    selector: row => row.negotiate_final_price
  },    
  {
    name: 'Status',
    sortable: row => row.action_status,
    cell: row => {
      return (
        row.action_status
      )
    }
  }
  // {
  //   name: 'Actions',
  //   allowOverflow: true,
  //   cell: () => {
  //     return (
  //       <div className='d-flex'>
  //         <UncontrolledDropdown>
  //           <DropdownToggle className='pe-1' tag='span'>
  //             <MoreVertical size={15} />
  //           </DropdownToggle>
  //           <DropdownMenu end>
  //             <DropdownItem tag='a' href='/' className='w-100' onClick={e => e.preventDefault()}>
  //               <FileText size={15} />
  //               <span className='align-middle ms-50'>Details</span>
  //             </DropdownItem>
  //             <DropdownItem tag='a' href='/' className='w-100' onClick={e => e.preventDefault()}>
  //               <Archive size={15} />
  //               <span className='align-middle ms-50'>Archive</span>
  //             </DropdownItem>
  //             <DropdownItem tag='a' href='/' className='w-100' onClick={e => e.preventDefault()}>
  //               <Trash size={15} />
  //               <span className='align-middle ms-50'>Delete</span>
  //             </DropdownItem>
  //           </DropdownMenu>
  //         </UncontrolledDropdown>
  //         <Edit size={15} />
  //       </div>
  //     )
  //   }
  // }
]

export default ExpandableTable
import { MoreVertical, Edit, FileText, Archive, Trash } from 'react-feather'

// ** Reactstrap Imports
import { Badge, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'

// ** Vars
// const states = ['success', 'danger', 'warning', 'info', 'dark', 'primary', 'secondary']

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
        <span className='fw-bold'>Name:</span> {data.user_name}
      </p>
      <p>
        <span className='fw-bold'>Employee:</span> {data.experience}
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
    selector: row => row.row_id
  },
  {
    name: 'User name',
    sortable: true,
    selector: row => row.user_name
  },
  {
    name: 'Email',
    sortable: true,
    selector: row => row.email
  },
  {
    name: 'Emp. ID',
    sortable: true,
    selector: row => row.metro_id
  },

  {
    name: 'User Type',
    sortable: true,
    selector: row => row.user_type,
    cell: row => {
       return (
        row.user_type === 'BUYER' ? <Badge color='success' pill>{row.user_type}</Badge> : <Badge color='primary' pill>{row.user_type}</Badge>
          // row.user_type === 'BUYER' ? `<span class="badge badge-success">${row.user_type}</span>` : `<span class="badge badge-success">${row.user_type}</span>`
       )
    }
    // formatter : this.formatRole
  },
  {
    name: 'country',
    sortable: true,
    selector: row => row.country
  }  
  // {
  //   name: 'Status',
  //   sortable: row => row.action_status,
  //   cell: row => {
  //     return (
  //       row.action_status
  //     )
  //   }
  // }
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
// export default ExpandableTable
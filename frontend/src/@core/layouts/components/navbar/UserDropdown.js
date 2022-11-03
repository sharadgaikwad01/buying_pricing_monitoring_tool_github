// ** React Imports
import { Link } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Utils
// import { isUserLoggedIn } from '@utils'

// ** Third Party Components
import { User, Mail, CheckSquare, MessageSquare, Settings, CreditCard, HelpCircle, Power } from 'react-feather'

// ** Reactstrap Imports
import { UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap'

// ** Default Avatar Image
//import defaultAvatar from '@src/assets/images/portrait/small/avatar-s-11.jpg'

const UserDropdown = () => {
  // ** State
  const user_email = localStorage.getItem('email')
  const user_type = localStorage.getItem('type')
  const vat_number = localStorage.getItem('vat')
  const user_name = localStorage.getItem('name')

  //** Vars
  //const userAvatar = (userData && userData.avatar) || defaultAvatar

  const handlelogout = () => {
    localStorage.clear()
    window.location.replace('http://10.16.148.18:82/login')
  }

  return (
    <UncontrolledDropdown tag='li' className='dropdown-user nav-item'>
      <DropdownToggle href='/' tag='a' className='nav-link dropdown-user-link' onClick={e => e.preventDefault()}>
        <div className='user-nav d-sm-flex d-none'>
          <span className='user-name fw-bold'>{user_email}</span>
          <span className='user-status'>{user_type}  {vat_number} {user_name}</span>
        </div>        
        <Avatar color='light-primary' content={user_name} initials />
      </DropdownToggle>
      <DropdownMenu end>
        <DropdownItem onClick={handlelogout}>
          <Power size={14} className='me-75' />
          <span className='align-middle'>Logout</span>
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  )
}

export default UserDropdown

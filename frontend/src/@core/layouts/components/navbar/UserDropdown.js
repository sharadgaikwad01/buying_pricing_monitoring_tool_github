// ** React Imports
import { Link } from 'react-router-dom'

import { useState, useEffect } from 'react'

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
  const vat_number = localStorage.getItem('vat')
  const user_name = localStorage.getItem('name')

  const [userDetails, setUserDetails] = useState([])

  //** Vars
  //const userAvatar = (userData && userData.avatar) || defaultAvatar

  const handlelogout = () => {
    localStorage.clear()
    window.location.replace('http://localhost:3000/login')
  }

  useEffect(async () => {
    const user_type = localStorage.getItem("type")
    if (user_type === 'SUPPLIER') {
      const result = `${user_type} / ${vat_number} / ${user_name}`
      setUserDetails(result)
    } else {
      setUserDetails(user_type)
    }
  }, [])

  return (
    <UncontrolledDropdown tag='li' className='dropdown-user nav-item'>
      <DropdownToggle href='/' tag='a' className='nav-link dropdown-user-link' onClick={e => e.preventDefault()}>
        <div className='user-nav d-sm-flex d-none'>
          <span className='user-name fw-bold'>{user_email}</span>
            <span className='user-status'>{userDetails}</span>
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

// ** React Imports
import { Link } from 'react-router-dom'


import { reactFrontend } from '@utils'

//import { useEffect } from 'react'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Utils
// import { isUserLoggedIn } from '@utils'

// ** Third Party Components
import { User, Mail, CheckSquare, MessageSquare, Settings, CreditCard, HelpCircle, Power } from 'react-feather'

// ** Reactstrap Imports
import { UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap'

const UserDropdown = () => {
  // ** State
  const user_email = localStorage.getItem('email')
  // const vat_number = localStorage.getItem('vat')
  const user_name = localStorage.getItem('name')

  const handlelogout = () => {    
    const user_type = localStorage.getItem("type")
    const token = localStorage.getItem("token")

    if (user_type === 'SUPPLIER') {
      localStorage.clear()
      const url = `https://idam.metrosystems.net/authorize/api/oauth2/op_session_end?id_token_hint=${token}&post_logout_redirect_uri=${reactFrontend}/logout`
      window.location.replace(url)
    }
    if (user_type === 'BUYER') {
      localStorage.clear()
      const url = `https://idam.metrosystems.net/authorize/api/oauth2/op_session_end?id_token_hint=${token}&post_logout_redirect_uri=${reactFrontend}/buyer_login`
      window.location.replace(url)
    }
    if (user_type === 'ADMIN') {
      localStorage.clear()
      const url = `https://idam.metrosystems.net/authorize/api/oauth2/op_session_end?id_token_hint=${token}&post_logout_redirect_uri=${reactFrontend}/buyer_login`
      window.location.replace(url)
    }     
  }
  return (
    <UncontrolledDropdown tag='li' className='dropdown-user nav-item'>
      {/* <span className='user-status float-left'>{userDetails}</span> */}
      <DropdownToggle href='/' tag='a' className='nav-link dropdown-user-link' onClick={e => e.preventDefault()}>
      
        <div className='user-nav d-sm-flex d-none'>
          <span className='user-name fw-bold'>{user_email}</span>
            
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

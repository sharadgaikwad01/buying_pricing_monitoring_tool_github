// ** React Imports
import { Link } from 'react-router-dom'


import { reactFrontend } from '@utils'

//import { useEffect } from 'react'

// ** Custom Components
import Avatar from '@components/avatar'
import { useState, useEffect } from 'react'

// ** Utils
// import { isUserLoggedIn } from '@utils'


// ** Third Party Components
import { User, Mail, CheckSquare, MessageSquare, Settings, CreditCard, HelpCircle, Power } from 'react-feather'

// ** Reactstrap Imports
import { UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem, Button } from 'reactstrap'

const UserDropdown = () => {
  // ** State
  // const user_email = localStorage.getItem('email')
  // const vat_number = localStorage.getItem('vat')
  const user_name = localStorage.getItem('name')
  const [reportlink, setreportlink] = useState(false)

  useEffect(async () => {

    const user_type = localStorage.getItem("type")
    if (user_type === 'SUPPLIER') {
      setreportlink(false)
    }
    if (user_type === 'BUYER') {
      setreportlink(false)
    }
    if (user_type === 'ADMIN' || user_type === 'SUPERADMIN') {
      setreportlink(true)
    }      
  })
  const handlelogout = () => {
    const user_type = localStorage.getItem("type")
    const token = localStorage.getItem("token")
    console.log(reactFrontend)
    if (user_type === 'SUPPLIER') {
      localStorage.clear()
      const url = `https://idam.metrosystems.net/authorize/api/oauth2/op_session_end?id_token_hint=${token}&post_logout_redirect_uri=${reactFrontend}/logout`
      console.log(url)
     
      window.location.replace(url)
     
    }
    if (user_type === 'BUYER') {
      localStorage.clear()
      const url = `https://idam.metrosystems.net/authorize/api/oauth2/op_session_end?id_token_hint=${token}&post_logout_redirect_uri=${reactFrontend}/buyer_login?message=Logout`
      console.log(url)
     
      window.location.replace(url)
      
    }
    if (user_type === 'ADMIN' || user_type === 'SUPERADMIN') {
      localStorage.clear()
      const url = `https://idam.metrosystems.net/authorize/api/oauth2/op_session_end?id_token_hint=${token}&post_logout_redirect_uri=${reactFrontend}/buyer_login?message=Logout`
      console.log(url)
      window.location.replace(url)
    }
  }
  return (
    <UncontrolledDropdown tag='li' className='dropdown-user nav-item'>
      {/* <span className='user-status float-left'>{userDetails}</span> */}
      <DropdownToggle href='/' tag='a' className='nav-link dropdown-user-link' onClick={e => e.preventDefault()}>
        <div className='user-nav text-end'>
          <span className='user-name fw-bold text-end'>Hello, <br /> <strong>  {user_name} </strong></span>
        </div>
        <Avatar color='light-primary' content={user_name} initials />
      </DropdownToggle>
      <DropdownMenu end>
          {reportlink ? <DropdownItem><Link to={'/report'}><span className='align-middle ms-25'>Report</span></Link></DropdownItem> : ''}
        <DropdownItem onClick={handlelogout}>
          <Power size={14} className='me-75' />
          <span className='align-middle'>Logout</span>
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  )
}

export default UserDropdown

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
  const [reportlinkadmin, setreportlinkadmin] = useState(false)

  useEffect(async () => {

    const user_type = localStorage.getItem("type")
    if (user_type === 'SUPPLIER') {
      setreportlink(false)
      setreportlinkadmin(false)
    }
    if (user_type === 'BUYER' || user_type === 'CAT_MAN') {
      setreportlink(false)
      setreportlinkadmin(false)
    }
    if (user_type === 'ADMIN') {
      setreportlink(true)
      setreportlinkadmin(false)
    } 
    if (user_type === 'SUPERADMIN') {
      setreportlink(true)
      setreportlinkadmin(true)
    }      
  })
  const handlelogout = () => {
    const user_type = localStorage.getItem("type")
    const token = localStorage.getItem("token")
    // console.log(reactFrontend)
    if (user_type === 'SUPPLIER') {
      localStorage.clear()
      const url = `https://idam.metrosystems.net/authorize/api/oauth2/op_session_end?id_token_hint=${token}&post_logout_redirect_uri=${reactFrontend}/logout`
      // console.log(url)
     
      window.location.replace(url)
     
    }
    if (user_type === 'BUYER' || user_type === 'CAT_MAN') {
      localStorage.clear()
      const url = `https://idam.metrosystems.net/authorize/api/oauth2/op_session_end?id_token_hint=${token}&post_logout_redirect_uri=${reactFrontend}/buyer_login?message=Logout`
      // console.log(url)
     
      window.location.replace(url)
      
    }
    if (user_type === 'ADMIN' || user_type === 'SUPERADMIN') {
      localStorage.clear()
      const url = `https://idam.metrosystems.net/authorize/api/oauth2/op_session_end?id_token_hint=${token}&post_logout_redirect_uri=${reactFrontend}/buyer_login?message=Logout`
      // console.log(url)
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
          {reportlink ? <DropdownItem><Link to={'/report'}><span className='align-middle ms-25'>BPA vs MMS Dashboard</span></Link></DropdownItem> : ''}
          {reportlink ? <DropdownItem><Link to={'/buyer_input'}><span className='align-middle ms-25'>Buyer Input</span></Link></DropdownItem> : ''}
          {reportlink ? <DropdownItem><Link to={'/dashboard'}><span className='align-middle ms-25'>Dashboard</span></Link></DropdownItem> : ''}
          {reportlinkadmin ? <DropdownItem><Link to={'/buyers_log'}><span className='align-middle ms-25'>User Log</span></Link></DropdownItem> : ''}
          {reportlinkadmin ? <DropdownItem><Link to={'/buyer_input_log'}><span className='align-middle ms-25'>Request Log</span></Link></DropdownItem> : ''}
          <DropdownItem><Link to={'/faq'}><span className='align-middle ms-25'>FAQ</span></Link></DropdownItem>
        <DropdownItem onClick={handlelogout}>
          <Power size={14} className='me-75' />
          <span className='align-middle'>Logout</span>
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  )
}

export default UserDropdown

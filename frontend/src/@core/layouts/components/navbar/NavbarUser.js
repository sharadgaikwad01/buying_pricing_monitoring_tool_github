// ** React Imports
import { Fragment, useState, useEffect  } from 'react'

// ** Dropdowns Imports
import UserDropdown from './UserDropdown'
import { Link } from 'react-router-dom'

// ** Third Party Components
import { Sun, Moon } from 'react-feather'

// ** Reactstrap Imports
import { Navbar, NavItem, Button } from 'reactstrap'
import themeConfig from '@configs/themeConfig'

const NavbarUser = props => {
  // ** Props
  const { skin, setSkin } = props
  const vat_number = localStorage.getItem('vat')
  const user_name = localStorage.getItem('name')
  const user_type = localStorage.getItem('type')
  const country = localStorage.getItem('country')
  
  const [userDetails, setUserDetails] = useState([])
  //const [setApplicationName] = useState('')

  // ** Function to toggle Theme (Light/Dark)
  const ThemeToggler = () => {
    if (skin === 'dark') {
      return <Sun className='ficon' onClick={() => setSkin('light')} />
    } else {
      return <Moon className='ficon' onClick={() => setSkin('dark')} />
    }
  }
  useEffect(async () => {
    if (user_type === 'SUPPLIER') {
      const result = `${user_name} / Vat ID: ${vat_number}`
      setUserDetails(result)
      //setApplicationName("Application")
    } else {
      setUserDetails('')
      //setApplicationName("Monitoring Tool")
    }
  }, [])

  return (
    <Fragment>
      <div className='navbar-header  d-xl-block d-none'>
            <ul className='nav navbar-nav'>
              <NavItem>
                <Link to='/' className='navbar-brand'>
                  <span className='brand-logo'>
                    <img src={themeConfig.app.appLogoImage} alt='logo' />
                  </span>
                  <h4 className='brand-text mb-0'>{themeConfig.app.appName}<br /></h4>
                </Link>
              </NavItem>
              <NavItem>
              <span className='user-status float-left'>{userDetails}</span>
              <span className='user-status float-left'>{country}</span>
              </NavItem>
              <NavItem>
              <ul className='nav navbar-nav align-items-center ms-auto mr-15'>
                <UserDropdown />
              </ul>
              </NavItem>
            </ul>
          </div>
    </Fragment>
  )
}
export default NavbarUser

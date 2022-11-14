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
  
  const [userDetails, setUserDetails] = useState([])

  // ** Function to toggle Theme (Light/Dark)
  const ThemeToggler = () => {
    if (skin === 'dark') {
      return <Sun className='ficon' onClick={() => setSkin('light')} />
    } else {
      return <Moon className='ficon' onClick={() => setSkin('dark')} />
    }
  }
  useEffect(async () => {
    const user_type = localStorage.getItem("type")
    if (user_type === 'SUPPLIER') {
      const result = `${user_name} / Vat ID: ${vat_number}`
      setUserDetails(result)
    } else {
      setUserDetails(user_type)
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
                  <h4 className='brand-text mb-0'>{themeConfig.app.appName}<br /><span className='text-warning'> {themeConfig.app.appName1}</span></h4>
                </Link>
              </NavItem>

              <NavItem>
                
              <span className='user-status float-left'>{userDetails}</span>
      
              </NavItem>
              <NavItem>
              <UserDropdown />
              </NavItem>
              

            </ul>
         
          </div>
{/*           
      <ul className='nav navbar-nav align-items-center ms-auto'>
       
      </ul> */}
    </Fragment>
  )
}
export default NavbarUser

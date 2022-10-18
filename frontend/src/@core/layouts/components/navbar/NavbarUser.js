// ** React Imports
import { Fragment } from 'react'

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

  // ** Function to toggle Theme (Light/Dark)
  const ThemeToggler = () => {
    if (skin === 'dark') {
      return <Sun className='ficon' onClick={() => setSkin('light')} />
    } else {
      return <Moon className='ficon' onClick={() => setSkin('dark')} />
    }
  }

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
            </ul>
          </div>
          
      <ul className='nav navbar-nav align-items-center ms-auto'>
        <UserDropdown />
      </ul>
    </Fragment>
  )
}
export default NavbarUser

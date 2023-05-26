// ** React Imports
import { Fragment, useState, useEffect } from 'react'

// ** Dropdowns Imports
import UserDropdown from './UserDropdown'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { nodeBackend } from '@utils'

// ** Third Party Components
import { Sun, Moon } from 'react-feather'
import moment from 'moment'

// ** Reactstrap Imports
import { Navbar, NavItem, Button, UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap'
import themeConfig from '@configs/themeConfig'
import { utils, writeFile } from 'xlsx'

const NavbarUser = props => {
  // ** Props

  console.log(themeConfig)
  const { skin, setSkin } = props
  const vat_number = localStorage.getItem('vat')
  const user_name = localStorage.getItem('name')
  const user_type = localStorage.getItem('type')
  const country = localStorage.getItem('country')
  const [notificationList, setnotificationList] = useState([])
 

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

    await axios.get(`${nodeBackend}/notifications`).then((res) => {
      console.log('notification-----------------------------')
      console.log(res.data.data)
      setnotificationList(res.data.data)    
    })

  }, [])

  const renderContent = () => {
    return notificationList.map((step, index) => {
      if (step.statuscol === 1) {
        return (<DropdownItem className='new-notification mark-read'>
        <a className="d-flex " href="#">
          <div className="list-item d-flex align-items-start">
            <div className="me-1">
              <div className="avatar notification-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                  <path d="M224 0c-17.7 0-32 14.3-32 32V51.2C119 66 64 130.6 64 208v18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416H416c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z" />
                </svg>
              </div>
            </div>
            <div className="list-item-body flex-grow-1">
              <p className="media-heading">
                <span className="" data-value={index}>{step.msg}</span>
              </p>
              <small className="notification-text">{moment.utc(step.created_at).local().startOf('seconds').fromNow()}</small>
            </div>
          </div>
        </a>
      </DropdownItem>)
      } else {
        return (<DropdownItem className='new-notification'>
        <a className="d-flex " href="#">
          <div className="list-item d-flex align-items-start">
            <div className="me-1">
              <div className="avatar notification-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                  <path d="M224 0c-17.7 0-32 14.3-32 32V51.2C119 66 64 130.6 64 208v18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416H416c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z" />
                </svg>
              </div>
            </div>
            <div className="list-item-body flex-grow-1">
              <p className="media-heading">
                <span className="" data-value={index}>{step.msg}</span>
              </p>
              <small className="notification-text">{moment.utc(step.created_at).local().startOf('seconds').fromNow()}</small>
            </div>
          </div>
        </a>
      </DropdownItem>)
      }
     
    })
  }

  const notificationDownload = async () => {
      console.log(notificationList)
      
      const finalcsvdata = notificationList.map((item, index) => ({
        "Sr no.": index + 1,
        "Country name": item.country_name,
        "Supplier no.": item.suppl_no,
        "Message ": item.msg
      }))
        const filename = 'export.csv'
        // downloadCSV(finalcsvdata)
        const name = `excel-sheet.xlsx`
        const wb = utils.json_to_sheet(finalcsvdata)
        const wbout = utils.book_new()
        utils.book_append_sheet(wbout, wb, filename)
        writeFile(wbout, name)
  }

  return (
    <Fragment>
      <div className='navbar-header '>
        <ul className='nav navbar-nav'>
          <NavItem>
            <Link to='/' className='navbar-brand'>
              <span className='brand-logo'>
                <img src={themeConfig.app.appLogoImage} alt='logo2' />
              </span>
              <h4 className='brand-text mb-0'>{themeConfig.app.appName}<br /></h4>
            </Link>
          </NavItem>

          <NavItem>
            <ul className='nav navbar-nav align-items-center ms-auto mr-15'>

              <UncontrolledDropdown className='notification-panel nav-item' >
                <DropdownToggle caret className='nav-link avatar  bg-light-primary' tag='a' >
                  <div className="avatar-content ">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                      <path d="M224 0c-17.7 0-32 14.3-32 32V51.2C119 66 64 130.6 64 208v18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416H416c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z" />
                    </svg>
                    <span className='new-notification-alert'>&nbsp;</span>
                  </div>
                </DropdownToggle>
                <DropdownMenu right className='dropdown-menu-media'>
                  <DropdownItem header>
                    <div className="d-flex">
                      <h4 className="notification-title mb-0 me-auto">Notifications</h4>
                      <div className="ms-auto d-flex">
                        <div className="badge rounded-pill badge-light-primary me-1">{notificationList.length} New</div>
                        <div className="">
                          <a className="d-flex mark-read-all" href="#" onClick={() => notificationDownload()}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
                              <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
                            </svg>
                          </a>
                          
                        </div>
                      </div>
                    </div>
                  </DropdownItem>
                  { renderContent()}
                 
                </DropdownMenu>
              </UncontrolledDropdown>

              <UserDropdown />
              <NavItem>
                <span className='user-status float-left'>{userDetails}</span>
                {user_type === 'SUPPLIER' ? '' : (<span className='float-left'>{country}</span>)}
                {/* {user_type === 'SUPPLIER' ? '' : (<img src={`${process.env.PUBLIC_URL}/metro-countries-flag/${country}.svg`} className="footer-logo light-mode-logo custom-size-image" />)} */}
              </NavItem>
            </ul>
          </NavItem>
        </ul>
      </div>
    </Fragment>
  )
}
export default NavbarUser 
// ** React Imports
import { Link } from 'react-router-dom'

// ** Reactstrap Imports
import { Button } from 'reactstrap'

// ** Custom Hooks
import { useSkin } from '@hooks/useSkin'
// import { nodeBackend } from '@utils'
// ** Styles
import '@styles/base/pages/page-misc.scss'

import themeConfig from '@configs/themeConfig'

const LogOut = () => {
  // ** Hooks
  const { skin } = useSkin()

  const illustration = skin === 'dark' ? 'not-authorized-dark.svg' : 'not-authorized.svg',
    source = require(`@src/assets/images/pages/${illustration}`).default
  return (
    <div className='misc-wrapper'>
      <Link className='brand-logo' to='/'>
        <img src={themeConfig.app.appLogoImage} className='custom-size-image' alt='logo' />
      </Link>
      <div className='misc-inner p-2 p-sm-3'>
        <div className='w-100 text-center'>
          <h2 className='mb-1'>Logout Successfully</h2>
          <Button tag={Link} to='/login' color='primary' className='btn-sm-block mb-1'>
            Back to Login
          </Button>
          <img className='img-fluid' src={source} alt='Not authorized page' />
        </div>
      </div>
    </div>
  )
}
export default LogOut

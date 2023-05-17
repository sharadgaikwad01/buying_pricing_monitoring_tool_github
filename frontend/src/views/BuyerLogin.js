//import { useEffect } from 'react'
import { useEffect } from 'react'
import { useSkin } from '@hooks/useSkin'
import { Link } from 'react-router-dom'
import { Facebook, Twitter, Mail, GitHub } from 'react-feather'
import InputPasswordToggle from '@components/input-password-toggle'
import { Row, Col, CardTitle, CardText, Form, Label, Input, Button } from 'reactstrap'
import '@styles/react/pages/page-authentication.scss'
import { nodeBackend, reactFrontend } from '@utils'
export const data = []

const BuyerLogin = () => {
  const { skin } = useSkin()
  
  // const handleLoginmessage = () => {
   // const Logoutmessage = searchParams.get("message")
    // if (Logout) {
    //   messagelogin =  'Logout Successful <br/>Please log-in to your account and start the adventure'
    // } else {
    //   messagelogin = 'Please log-in to your account and start the adventure'
    // }
  // }

  const illustration = skin === 'dark' ? 'login-v2-dark.svg' : 'login-v2.svg',
  source = require(`@src/assets/images/pages/${illustration}`).default

  useEffect(async () => {
    const auth_token = localStorage.getItem('token')
    const type = localStorage.getItem('type')
    if (auth_token) {
      if (type === 'BUYER') {
        window.location.replace(`${reactFrontend}/buyer_input`)
    } else if (type === 'SUPERADMIN') {
      window.location.replace(`${reactFrontend}/buyers`)
    } else if (type === 'ADMIN') {
      window.location.replace(`${reactFrontend}/dashboard`)
    } else {
      window.location.replace(`${reactFrontend}/home`)
    }
      //window.location.replace(`${reactFrontend}/home`)
    } else {
      window.location.replace(`${nodeBackend}/buyer/api/v2/login`)
    }
  }, [])

  const handleLogin = () => {
    window.location.replace(`${nodeBackend}/buyer/api/v2/login`)
  }

  return (
    <div className='auth-wrapper auth-cover'>
      <Row className='auth-inner m-0'>
        <Link className='brand-logo' to='/' onClick={e => e.preventDefault()}>
          <img src="logo/metro-logo.png" className='img-fluid' />
        </Link>
        <Col className='d-none d-lg-flex align-items-center p-5' lg='8' sm='12'>
          <div className='w-100 d-lg-flex align-items-center justify-content-center px-5'>
            <img className='img-fluid' src={source} alt='Login Cover' />
          </div>
        </Col>
        <Col className='d-flex align-items-center auth-bg px-2 p-lg-5' lg='4' sm='12'>
          <Col className='px-xl-2 mx-auto' sm='8' md='6' lg='12'>
            <CardTitle tag='h2' className='fw-bold mb-1'>
              Welcome to Metro
            </CardTitle>
            <CardText className='mb-2'>

            {/* {
            Logoutmessage ? <p>Logout Successful</p> : <p></p>
            }  */}
              Logout Successful
              
              Please log-in to your account and start the adventure
              </CardText>
            <Button className='mb-1' color='primary' block onClick={handleLogin}>
              Log in
            </Button>
            <div className='divider my-2'>
              <div className='divider-text'></div>
            </div>
          </Col>
        </Col>
      </Row>
    </div>
  )
}

export default BuyerLogin
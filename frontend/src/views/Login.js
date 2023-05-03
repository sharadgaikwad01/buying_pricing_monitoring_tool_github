import { useEffect } from 'react'
import { useSkin } from '@hooks/useSkin'
import { Link } from 'react-router-dom'
import { Facebook, Twitter, Mail, GitHub } from 'react-feather'
import InputPasswordToggle from '@components/input-password-toggle'
import { Row, Col, CardTitle, CardText, Form, Label, Input, Button } from 'reactstrap'
import '@styles/react/pages/page-authentication.scss'
import { nodeBackend, reactFrontend } from '@utils'
export const data = []

const LoginCover = () => {
  const { skin } = useSkin()

  const illustration = skin === 'dark' ? 'login-v2-dark.svg' : 'login-v2.svg',
  source = require(`@src/assets/images/pages/${illustration}`).default
  console.log(source)
  useEffect(async () => {
    const auth_token = localStorage.getItem('token')
    if (auth_token) {
      window.location.replace(`${reactFrontend}/home`)
    } else {
      window.location.replace(`${nodeBackend}/api/v1/login`)
    }
  }, [])
  
  const handleLogin = () => {
    window.location.replace(`${nodeBackend}/api/v1/login`)
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
            <CardText className='mb-2'>Please sign-in to your account and start the adventure</CardText>
            <Button className='mb-1' color='primary' block onClick={handleLogin}>
              Sign in
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

export default LoginCover

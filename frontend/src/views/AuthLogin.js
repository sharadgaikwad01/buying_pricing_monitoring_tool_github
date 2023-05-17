//import { useEffect } from 'react'
import { useSkin } from '@hooks/useSkin'
import { Link } from 'react-router-dom'
import { Facebook, Twitter, Mail, GitHub } from 'react-feather'
import InputPasswordToggle from '@components/input-password-toggle'
import { Row, Col, CardTitle, CardText, Form, Label, Input, Button } from 'reactstrap'
import '@styles/react/pages/page-authentication.scss'
export const data = []
import { useForm, Controller } from 'react-hook-form'

const AuthLogin = () => {
  const { skin } = useSkin()

  const defaultValues = {
    password: 'admin',
    loginEmail: 'admin@demo.com'
  }

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues })

  const illustration = skin === 'dark' ? 'login-v2-dark.svg' : 'login-v2.svg',
  source = require(`@src/assets/images/pages/${illustration}`)

const onSubmit = data => {
  console.log(data)
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
              Please log-in to your account and start the adventure
              </CardText>
              <Form className='auth-login-form mt-2' onSubmit={handleSubmit(onSubmit)}>
              <div className='mb-1'>
                <Label className='form-label' for='login-email'>
                  Email
                </Label>
                <Controller
                  id='loginEmail'
                  name='loginEmail'
                  control={control}
                  render={({ field }) => (
                    <Input
                      autoFocus
                      type='email'
                      placeholder='john@example.com'
                      invalid={errors.loginEmail && true}
                      {...field}
                    />
                  )}
                />
              </div>
              <div className='mb-1'>
                <div className='d-flex justify-content-between'>
                  <Label className='form-label' for='login-password'>
                    Password
                  </Label>
                  <Link to='/forgot-password'>
                    <small>Forgot Password?</small>
                  </Link>
                </div>
                <Controller
                  id='password'
                  name='password'
                  control={control}
                  render={({ field }) => (
                    <InputPasswordToggle className='input-group-merge' invalid={errors.password && true} {...field} />
                  )}
                />
              </div>
              <Button type='submit' color='primary' block>
                Sign in
              </Button>
            </Form>
            <div className='divider my-2'>
              <div className='divider-text'></div>
            </div>
          </Col>
        </Col>
      </Row>
    </div>
  )
}

export default AuthLogin
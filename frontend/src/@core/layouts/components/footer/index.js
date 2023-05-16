// ** Icons Import
//import themeConfig from '@configs/themeConfig'
const Footer = () => {
  return (
    <p className='clearfix mb-0'>
      <span className='float-md-start d-block d-md-inline-block mt-25'>
        Copyright © {new Date().getFullYear()}{' '}
        <a href='#' target='_blank' rel='noopener noreferrer'><strong>    METRO GSC</strong>
        </a>
        <span className='d-none d-sm-inline-block'>, All rights Reserved</span>
      </span>
      <span className='float-md-end d-none d-md-block fw-bolder'>
        <span className='d-none d-sm-inline-block'>Powered By: &nbsp;</span>
           
          <img src={`${process.env.PUBLIC_URL}/logo/logom.png`} className="footer-logo light-mode-logo custom-size-image" />
          {/* <img src="logo/BSC_Main_Logo_White.png" className="footer-logo dark-mode-logo" /> */}
      </span>
    </p>
  )
}

export default Footer

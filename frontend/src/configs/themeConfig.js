// You can customize the template with the help of this file

//Template config options
const themeConfig = {
  app: {
<<<<<<< HEAD
    appName: '',
    appName1: '',
    appLogoImage: require('@src/assets/images/logo/tool_logo.png').default
=======
    appName: 'Buying Price',
    appName1: 'Application',
    appLogoImage: require('@src/assets/images/logo/logobpmt.png').default,
    appLogoImagefooter: require('@src/assets/images/logo/logom.png').default
>>>>>>> ca282123257e55d675b92d684360c0e1237e13d8
  },
  layout: {
    isRTL: false,
    skin: 'bordered', // light, dark, bordered, semi-dark
    routerTransition: 'fadeIn', // fadeIn, fadeInLeft, zoomIn, none or check this for more transition https://animate.style/
    type: 'horizontal', // vertical, horizontal
    contentWidth: 'full', // full, boxed
    menu: {
      isHidden: false,
      isCollapsed: false
    },
    navbar: {
      // ? For horizontal menu, navbar type will work for navMenu type
      type: 'floating', // static , sticky , floating, hidden
      backgroundColor: 'white' // BS color options [primary, success, etc]
    },
    footer: {
      type: 'sticky' // static, sticky, hidden
    },
    customizer: false,
    scrollTop: true // Enable scroll to top button
  }
}

export default themeConfig

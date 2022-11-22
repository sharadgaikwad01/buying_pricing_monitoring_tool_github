// You can customize the template with the help of this file

//Template config options
const themeConfig = {
  app: {
    appName: 'Buying Price',
    appName1: 'Application',
    appLogoImage: require('@src/assets/images/logo/logom.png').default
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

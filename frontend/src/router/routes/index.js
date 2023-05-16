import { lazy } from 'react'

// ** Document title
const TemplateTitle = '%s - Vuexy React Admin Template'

// ** Default Route
const DefaultRoute = '/login'

const ViewDetails = lazy(() => import('../../views/View'))

// ** Merge Routes
const Routes = [
  {
    path: '/home',
    component: lazy(() => import('../../views/Home'))
  },
  {
    path: '/faq',
    component: lazy(() => import('../../views/faq'))
  },
  {
    path: '/mintech',
    component: lazy(() => import('../../views/Mintech'))
  },
  {
    path: '/buyers',
    component: lazy(() => import('../../views/Buyers'))
  },
  {
    path: '/dashboard',
    component: lazy(() => import('../../views/Dashboard'))
  },
  {
    path: '/category_dashboard',
    component: lazy(() => import('../../views/CategoryDashboard'))
  },
  {
    path: '/view/:id',
    component: lazy(() => import('../../views/View'))
  },
  {
    path: '/buyer_input',
    component: lazy(() => import('../../views/BuyerInput'))
  },
  {
    path: '/auth',
    layout: 'BlankLayout',
    component: lazy(() => import('../../views/Auth'))
  },
  {
    path: '/auth_login',
    component: lazy(() => import('../../views/AuthLogin')),
    layout: 'BlankLayout',
    meta: {
      authRoute: true
    }
  },
  {
    path: '/login',
    component: lazy(() => import('../../views/Login')),
    layout: 'BlankLayout',
    meta: {
      authRoute: true
    }
  },
  {
    path: '/buyer_login',
    component: lazy(() => import('../../views/BuyerLogin')),
    layout: 'BlankLayout',
    meta: {
      authRoute: true
    }
  },
  {
    path: '/notAuthorized',
    component: lazy(() => import('../../views/NotAuthorized')),
    layout: 'BlankLayout',
    meta: {
      authRoute: true
    }
  },
  {
    path: '/logout',
    component: lazy(() => import('../../views/LogOut')),
    layout: 'BlankLayout',
    meta: {
      authRoute: true
    }
  },
  {
    path: '/error',
    component: lazy(() => import('../../views/Error')),
    layout: 'BlankLayout'
  }
]

export { DefaultRoute, TemplateTitle, Routes }

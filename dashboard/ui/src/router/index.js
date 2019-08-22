import Vue from 'vue'
import Router from 'vue-router'

import Navbar from '@/views/navbar'
import IndexSidebar from '@/views/app/sidebar'
Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {  
      path: '/ui', 
      component: Navbar,
      redirect: '/ui/app',
      children: [
        { 
          path: '/ui/app', 
          component: IndexSidebar,
          redirect: '/ui/app/dashboard',
          children: [
            { path: '/ui/app/dashboard', component: () => import('@/views/app/dashboard')},
            { path: '/ui/app/tracing', component: () => import('@/views/app/tracing')},
            { path: '/ui/app/serviceMap', component: () => import('@/views/app/serviceMap')},
            { path: '/ui/app/apiMap', component: () => import('@/views/app/apiMap')},
            { path: '/ui/app/runtime', component: () => import('@/views/app/runtime')},
            { path: '/ui/app/api', component: () => import('@/views/app/api')},
          ]
        },
      ]
    },
    { path: '/ui/login', component: () => import('@/views/login/index')},
    { path: '/404', component: () => import('@/views/errorPage/page404')},
    { path: '*', redirect: '/404'}
  ]
})

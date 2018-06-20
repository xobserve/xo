import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/pages/index'
import ChatRoom from '@/pages/ChatRoom'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index,
      redirect: "/chatroom",
        children: [{
                path: '/chatroom',
                name: 'ChatRoom',
                component: ChatRoom
            }]
    }
  ]
})

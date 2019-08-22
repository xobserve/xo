// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import iView from 'iview';

// 全局范围加载通用样式，每个vue page里无需重复引入
import '!style-loader!css-loader!less-loader!./theme/layout.less'
import '!style-loader!css-loader!less-loader!./theme/style.less'

Vue.config.productionTip = false

import i18n from './lang' // Internationalization

Vue.use(iView);

import store from './store'

 
router.beforeEach((to, _, next) => {
    next()
})

router.afterEach(() => {
})



/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  components: { App },
  template: '<App/>'
})

<template>
  <div class="ui-nav">
      <div class="navbar">
         <a href="/ui" class="navbar-brand" style=" color: #2dafe9;text-decoration: none;font-size: 28px;">
                    Koala
          </a>
        <ul class="nav navbar-nav d-md-down-none margin-top-5" style="margin-left:34px">
            <li class="nav-item px-3">
                <a class="nav-link" href="#">{{$t('nav.dashboard')}}</a>
            </li>
            <li class="nav-item px-3">
                <a class="nav-link" href="#">APM</a>
            </li>
            <li class="nav-item px-3">
                <a class="nav-link" href="#">Alert</a>
            </li>
        </ul>
       
        <ul class="nav navbar-nav ml-auto">
            <li  class="nav-item" style="margin-right:-15px;">
                <screenfull id="screenfull" style="font-size:18px;"/>
            </li>
            <li class="nav-item">
                <span style="font-size:18px">  
                    <Dropdown @on-click="changeTheme">
                        <Icon type="ios-shirt-outline" />
                        <DropdownMenu slot="list">
                            <DropdownItem name="light">Light Theme</DropdownItem>
                            <DropdownItem name="dark">Dark Theme</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>  
                </span>
            </li>
            <li class="nav-item">
                <span style="font-size:18px" class="margin-right-30">  
                    <Dropdown @on-click="changeLang">
                        <Icon type="ios-globe-outline" />
                        <DropdownMenu slot="list">
                            <DropdownItem name="zh">Chinese</DropdownItem>
                            <DropdownItem name="en">English</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>  
                </span>
            </li>
            <li class="nav-item">
                <span style="font-size:14px" class="margin-right-30">  
                    <Dropdown>
                       <img class="img-avatar margin-top-5" src="../assets/user.jpg" alt="User">
                        <DropdownMenu slot="list">
                            <DropdownItem  @click.native="goUser">User Panel</DropdownItem>
                            <DropdownItem v-show="$store.state.user.priv!='normal'" @click.native="goAdmin">Admin Panel</DropdownItem>
                            <DropdownItem @click.native="logout">Logout</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>  
                </span>
            </li>
        </ul>
      </div>
      
      <router-view class="main-view"></router-view>
  </div>
</template> 
 
<script>
import Screenfull from '@/views/components/Screenfull'
export default {
  name: 'Nav',
  components: {
    Screenfull
  },
  data () {
    return {
         theme: this.$store.state.misc.theme
    }
  }, 
  watch: {
  }, 
  computed: {
  },
  methods: {
    changeLang(val) {
         this.$store.dispatch('setLang', val)
         this.$i18n.locale = val
    },
    changeTheme(val) {
      this.$store.dispatch('setTheme', val)
      window.location.reload()
    }, 
    loadTheme() {
      // 全局范围加载通用样式，每个vue page里无需重复引入
      if (this.theme=='light') {
        require('!style-loader!css-loader!less-loader!../theme/light/global.less')
        require('!style-loader!css-loader!less-loader!../theme/light/var.less') 
        require('!style-loader!css-loader!less-loader!../theme/light/pages.less') 
      } else {
        require('!style-loader!css-loader!less-loader!../theme/dark/global.less')
        require('!style-loader!css-loader!less-loader!../theme/dark/var.less') 
        require('!style-loader!css-loader!less-loader!../theme/dark/pages.less') 
      }
    },
    logout() {
      this.$store.dispatch('Logout').then(() => {
        this.$router.push('/ui/login') // In order to re-instantiate the vue-router object to avoid bugs
      }).catch(error => {
        // 登出错误，登陆数据已经清除，返回登陆页面 
        this.$router.push('/ui/login')
      })
    }
  },
  mounted() {
    this.loadTheme()
    console.log(this.$store)
  }
}
</script>

 
 <style lang="less">
 @import "../theme/light/var.less";
 .ui-nav {
    .navbar {
        position: fixed;
        top:0;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content:space-between;
        flex-direction:row;
        width: 100%;
        background: #fff;
        border-bottom:1px solid @secondary-color;
        z-index:100;
        .navbar-brand {
            display: -ms-inline-flexbox;
            display: inline-flex;
            -ms-flex-align: center;
            align-items: center;
            -ms-flex-pack: center;
            justify-content: center;
            width: 155px;
            height: 55px;
            padding: 0;
            margin-right: 0;
            background-color: transparent;
        }

        .navbar-nav {
            -ms-flex-direction: row;
            flex-direction: row;
            -ms-flex-align: center;
            align-items: center;
            display:flex;
            list-style: none;
            flex-wrap: wrap;
            .nav-item {
                position: relative;
                min-width: 50px;
                margin: 0;
                text-align: center;
            }
            .nav-link {
                color: @light-text-color;
            }

            .img-avatar {
                height:38px;
                border-radius: 50%;
            }
        }
    }
    
    .px-3 {
        padding-left: 2.5rem;
    }  
    .ml-auto {
        margin-left: auto;
    } 
}
</style>
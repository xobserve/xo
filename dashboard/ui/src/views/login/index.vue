<template>
  <div class="login">
    <div class="login-con">
      <Card icon="log-in" title="Koala" :bordered="false">
        <div class="form-con">
          <Form :model="form">
            <FormItem prop="userID">
                <Input v-model="form.userID" placeholder="input user id">
                    <span slot="prepend">
                    <Icon :size="16" type="person"></Icon>
                    </span>
                </Input>
            </FormItem>
            <FormItem prop="password">
                <Input type="password" v-model="form.password" placeholder="Password" @keyup.enter.native="handleSubmit">
                    <span slot="prepend">
                    <Icon :size="14" type="locked"></Icon>
                    </span>
                </Input>
            </FormItem>
            <FormItem>
                <Button @click="handleSubmit" type="primary" long>Login</Button>
            </FormItem>
        </Form>
          <p class="login-tip">default:admin/admin</p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request' 
import Cookies from 'js-cookie'

export default {
    data () {
        return {
        form: {
            userID: 'admin',
            password: ''
        }
        }
    },
  methods: {
    handleSubmit () {
       if (this.form.userID == '') {
           this.$Message.warning('username cant be empty')
           return 
       }
       request({
            url: '/dashboard/login',
            method: 'POST', 
            params: {
                user_id: this.form.userID,
                user_pw: this.form.password
            }
        }).then(res => {
            // 存在，设置用户信息
            this.$store.dispatch('SetUserInfo', res.data.data).then(() => {  
                // 获取历史路径
                var opath = Cookies.get('lastPath')
                if (opath != '' && opath != undefined) {
                    Cookies.remove('lastPath')
                    this.$router.push({ path: opath })
                } else {
                    this.$router.push('/ui')
                }
            
            })
        }).catch(error => {
            console.log(error)
            this.$router.push({ path: '/ui/login' })
        })
    }
  },
  mounted() {
        require('!style-loader!css-loader!less-loader!../../theme/light/global.less')
        require('!style-loader!css-loader!less-loader!../../theme/light/var.less') 
        require('!style-loader!css-loader!less-loader!../../theme/light/pages.less') 
  }
}
</script>

<style>
html {
    padding:0 !important;
    margin:0;
}
</style>

<style lang="less">
  .login{
    width: 100%;
    height: 100vh;
    background-image: url('../../assets/login-bg.jpg');
    background-size: cover;
    background-position: center;
    position: relative;
    &-con{
        position: absolute;
        right: 160px;
        top: 50%;
        transform: translateY(-60%);
        width: 300px;
        &-header{
            font-size: 16px;
            font-weight: 300;
            text-align: center;
            padding: 30px 0;
        }
        .form-con{
            padding: 10px 0 0;
        }
        .login-tip{
            font-size: 10px;
            text-align: center;
            color: #c3c3c3;
        }
    }
}
</style>
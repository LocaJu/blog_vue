<!-- 登录注册 -->
<template>
    <div class="login-page">
        <div class="container">
            <h1 class="loginTitle">
                欢迎回来
            </h1>
            <!-- 登录注册 -->
            <div v-show="!err2005" class="">
                <div v-if="login==1" class="loginBox">
                    <div class="lr-title">
                        <h1>登录</h1>
                        <p>
                            新用户<router-link to="/Login?login=0" class="tcolors">注册</router-link>
                        </p>
                    </div>
                    <el-alert
                        v-show="loginErr"
                        :title="loginTitle"
                        type="error"
                        show-icon  :closable="false">
                    </el-alert>
                    <el-input
                        type="text"
                        placeholder="用户名"
                        v-model="username">
                    </el-input>

                    <el-input
                            type="password"
                          placeholder="密码"
                           @keyup.enter.native="loginEnterFun"
                          v-model="password">
                    </el-input>

                    <h3><a href="">忘记密码？</a></h3>
                    <div class="lr-btn tcolors-bg" @click="gotoHome">登录</div>
                    <div class="otherLogin" >
                        <a href="javascript:void(0)"><i class="fa fa-fw fa-wechat"></i></a>
                        <a href="javascript:void(0)"><i class="fa fa-fw fa-qq"></i></a>
                        <a href="javascript:void(0)"><i class="fa fa-fw fa-weibo"></i></a>
                    </div>
                </div>
                <div v-else class="registerBox">
                    <div class="lr-title">
                        <h1>注册</h1>
                        <p>
                            已有账号<router-link to="/Login?login=1" class="tcolors">登录</router-link>
                        </p>
                    </div>
                    <el-alert
                        v-show="registerErr"
                        :title="registerTitle"
                        type="error"
                        show-icon  :closable="false">
                    </el-alert>
                    <el-input
                        type="text"
                        placeholder="用户名"
                        v-model="nusername">
                    </el-input>
                    <el-alert
                        v-show="nusernameErr"
                        title="用户名错误"
                        type="error"
                        show-icon  :closable="false">
                    </el-alert>
                    <el-input
                        type="text"
                        placeholder="昵称"
                        v-model="nnickName">
                    </el-input>
                    <el-input
                        type="email"
                        placeholder="邮箱"
                        v-model="nemail">
                    </el-input>
                    <el-alert
                        v-show="nemailErr"
                        title="邮箱错误"
                        type="error"
                        show-icon  :closable="false">
                    </el-alert>
                    <el-input
                          type="password"
                          placeholder="密码:6-12位英文、数字、下划线"
                          v-model="npassword">
                    </el-input>
                    <el-alert
                        v-show="npasswordErr"
                        title="密码错误"
                        type="error"
                        show-icon  :closable="false">
                    </el-alert>
                    <el-input
                            type="password"
                          placeholder="确认密码"
                           @keyup.enter.native="registerEnterFun"
                          v-model="npassword2">
                    </el-input>
                    <el-alert
                        v-show="npassword2Err"
                        title="重复密码有误"
                        type="error"
                        show-icon  :closable="false">
                    </el-alert>
                    <div class="lr-btn tcolors-bg" @click="newRegister" v-loading.fullscreen.lock="fullscreenLoading"  element-loading-text="提交中">注册</div>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
import {userLogin,userRegister} from '../api/user.js'
import {setToken} from '../utils/auth.js'
    export default {
        name: 'Login',
        data() { //选项 / 数据
            return {
                username: '',//用户名
                email: '',//邮箱
                password: '',//密码
                nusername: '',//新用户注册名
                nemail: '',//新用户注册邮箱
                npassword: '',//新用户注册密码
                npassword2: '',//新用户注册重复密码
                login: 0,//是否已经登录
                loginErr: false,//登录错误
                loginTitle:'用户名或密码错误',
                nusernameErr:false,//新用户注册用户名错误
                nemailErr: false,//新用户注册邮箱错误
                npasswordErr: false,//新用户注册密码错误
                npassword2Err: false,//新用户注册重复密码错误
                registerErr: false,//已注册错误
                registerTitle: '该邮箱已注册',
                step: 1,//注册进度
                fullscreenLoading: false,//全屏loading
                urlstate: 0,//重新注册
            }
        },
        methods: { //事件处理器
            routeChange:function(){
                var that = this;
                that.login = that.$route.query.login==undefined?1:parseInt(that.$route.query.login);//获取传参的login
                that.urlstate = that.$route.query.urlstate==undefined?0:that.$route.query.urlstate;//获取传参的usrlstate状态码
                // console.log(that.login,that.urlstate);

            },
            loginEnterFun: function(e){
                var keyCode = window.event? e.keyCode:e.which;
                // console.log('回车登录',keyCode,e);
                if(keyCode == 13 ){
                    this.gotoHome();
                }
            },
            gotoHome:function(){//用户登录
                if(!this.username || !this.password){
                    this.loginErr = true;
                    this.loginTitle = '请输入用户名和密码';
                    return;
                }
                this.loginErr = false;
                userLogin(this.username,this.password).then((response)=>{
                    // 登录成功记录token和用户信息，登录失败给对应提示
                    if(response && response.token){
                        setToken(response.token)
                        // 存储用户信息
                        if(response.userInfo){
                            localStorage.setItem("userInfo",JSON.stringify(response.userInfo))
                        }
                        // 获取跳转路径并清除logUrl
                        var redirectPath = '/';
                        if(localStorage.getItem('logUrl')){
                            redirectPath = localStorage.getItem('logUrl');
                            localStorage.removeItem('logUrl');
                        }
                        // 执行跳转
                        this.$router.push({path: redirectPath}).catch(err => {
                            // 如果跳转失败（比如路径不存在），跳转到首页
                            console.error('路由跳转失败:', err);
                            this.$router.push({path: '/'});
                        });
                    } else {
                        this.loginErr = true;
                        this.loginTitle = '登录失败，返回数据异常';
                    }
                }).catch((error)=>{
                    this.loginErr = true;
                    this.loginTitle = error.message || '登录失败，请检查用户名和密码';
                })
      
            },
            registerEnterFun: function(e){
                var keyCode = window.event? e.keyCode:e.which;
                // console.log('回车注册',keyCode,e);
                if(keyCode == 13 ){
                    this.newRegister();
                }
            },
            newRegister:function(){//注册提交
                var that = this;
                var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/ ;
                var preg = /^(\w){6,12}$/;
                if(that.nusername){
                    that.nusernameErr = false;
                }else{
                    that.nusernameErr = true;
                }
                if(reg.test(that.nemail)){
                    that.nemailErr = false;
                }else{
                    that.nemailErr = true;
                }
                if(that.npassword&&preg.test(that.npassword)){
                    that.npasswordErr = false;
                    if(that.npassword==that.npassword2){
                        that.npassword2Err = false;
                    }else{
                        that.npassword2Err = true;
                    }
                }else{
                    that.npasswordErr = true;
                }
                if(!that.nusernameErr&&!that.nemailErr&&!that.npasswordErr){
                    that.fullscreenLoading = true;
                    userRegister(that.nusername,that.nnickName,that.nemail,that.npassword).then((response)=>{
                         //注册成功后调整到登录
                         that.goLogin()
                    }).catch((error)=>{
                      that.fullscreenLoading = false;
                    })
                }
            },
            goLogin:function(){//去登陆
                this.$router.push({path:'/Login?login=1'});
            },
            goRegister: function(){//去注册
                this.$router.push({path:'/Login?login=0'});
            }

        },
        components: { //定义组件

        },
        watch: {
           // 如果路由有变化，会再次执行该方法
           '$route':'routeChange'
         },
        created() { //生命周期函数
            var that = this;
            that.routeChange();
        }
    }
</script>

<style>
/* 登录页面容器 */
.login-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 60px 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

/*登录注册标题*/
.loginTitle{
    text-align: center;
    font-size: 26px;
    padding-top:50px;
    margin-bottom: 20px;
    color: #fff;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.loginBox ,.registerBox{
    background: #fff;
    padding:40px;
    max-width:380px;
    margin:0 auto;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
    animation: fadeInUp 0.5s ease;
}
.loginBox:hover, .registerBox:hover {
    box-shadow: 0 15px 50px rgba(0,0,0,0.3);
    transform: translateY(-5px);
}
.loginBox{
    padding-bottom:0;
}
.lr-title{
    position: relative;
    height:32px;
    line-height: 32px;
    margin-bottom: 30px;
}
.lr-title h1{
    font-size: 28px;
    color:#333;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}
.lr-title p{
    font-size: 13px;
    color:#999;
    position: absolute;
    right:0;
    top:0;
}
.lr-title p a{
    color: #667eea;
    transition: color 0.3s ease;
}
.lr-title p a:hover{
    color: #764ba2;
}
.lr-btn{
    color:#fff;
    text-align: center;
    letter-spacing: 5px;
    padding:12px;
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;
    font-weight: 600;
}
.lr-btn:hover{
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}
.lr-btn:active{
    transform: translateY(0);
}
.loginBox .el-input,.registerBox .el-input{
    margin-bottom: 20px;
}
.loginBox .el-input__inner,.registerBox .el-input__inner{
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    transition: all 0.3s ease;
    padding: 12px 15px;
}
.loginBox .el-input__inner:focus,.registerBox .el-input__inner:focus{
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}
.loginBox .el-alert ,.registerBox .el-alert{
    top:-18px;
    border-radius: 6px;
}
.loginBox h3,.registerBox h3{
    text-align: right;
    margin-bottom: 20px;
}
.loginBox h3 a,.registerBox h3 a{
    font-size: 13px;
    color:#667eea;
    transition: color 0.3s ease;
}
.loginBox h3 a:hover,.registerBox h3 a:hover{
    color:#764ba2;
}
.loginBox .otherLogin{
    max-width:320px;
    padding:30px 40px;
    background: #f5f5f5;
    text-align: center;
    margin-left:-40px;
    margin-right: -40px;
    visibility: hidden;
    border-radius: 0 0 12px 12px;
}
.loginBox .otherLogin p{
    margin-bottom:20px;
    font-size: 16px;
}
.loginBox .otherLogin a i{
    display: inline-block;
    width: 42px;
    height: 42px;
    line-height: 42px;
    font-size: 18px;
    border-radius: 50%;
    color:#fff;
    margin: 0 10px;
    transition: transform 0.3s ease;
}
.loginBox .otherLogin a i:hover{
    transform: scale(1.1);
}
.loginBox .otherLogin a i.fa-wechat{
    background: #7bc549;
}
.loginBox .otherLogin a i.fa-qq{
    background: #56b6e7;
}
.loginBox .otherLogin a i.fa-weibo{
    background: #ff763b;
}

/*登录成功*/
.registerSuc{
    padding: 40px;
    margin: 0 auto;
}
.registerSuc .sucIcon{
    text-align: center;
    margin-bottom: 30px;
    padding-left:60px;
}
.registerSuc .sucContent{
    line-height: 1.5;
    font-size: 15px;
    text-align: center;
}
.registerSuc .sucContent p{
    margin-top: 10px;
    font-size: 13px;
    color: #999;
}
.registerSuc .sucContent .lastbtn{
    display: inline-block;
    font-size: 14px;
    padding: 3px 10px;
    border-radius: 5px;
    color:#fff;
    cursor: pointer;
}
.registerSuc .sucContent  .el-icon-close{
    font-size: 13px;
}

/* 动画效果 */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>

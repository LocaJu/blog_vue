<!-- 文章列表 -->
<template>
    <el-row class="sharelistBox">

        <el-col :span="24" class="s-item tcommonBox" v-for="(item,index) in articleList" :key="'article'+index">
            <span class="s-round-date">
                <span class="month" v-html="showInitDate(item.createTime,'month')+'月'"></span>
                <span class="day" v-html="showInitDate(item.createTime,'date')"></span>
            </span>
            <header>
                <h1>
                    <router-link :to="'/DetailArticle?aid='+item.id">
                        {{item.title}}
                    </router-link>
                </h1>
                <h2>
                    <i class="fa fa-fw fa-user"></i>发表于
                    <i class="fa fa-fw fa-clock-o"></i><span>{{showInitDate(item.createTime,'all')}}</span> •
                    <i class="fa fa-fw fa-eye"></i>{{item.viewCount}} 次围观 •

                </h2>
                <div class="ui label">
                    <router-link :to="'/Share?classId='+item.class_id">{{item.categoryName}}</router-link>
                </div>
            </header>
            <div class="article-content">
                <p style="text-indent:2em;">
                    {{item.summary}}
                </p>
                <p  style="max-height:300px;overflow:hidden;text-align:center;">
                    <img :src="item.thumbnail" alt="" class="maxW">
                </p>
            </div>
            <div class="viewdetail">
                <router-link class="tcolors-bg" :to="'/DetailArticle?aid='+item.id">
                    阅读全文>>
                </router-link>
            </div>

        </el-col>
         <el-col class="viewmore">
            <a v-show="hasMore" class="tcolors-bg" href="javascript:void(0);" @click="addMoreFun">点击加载更多</a>
            <a v-show="!hasMore" class="tcolors-bg" href="javascript:void(0);">暂无更多数据</a>
        </el-col>
    </el-row>
</template>

<script>
import {initDate} from '../utils/server.js'
import {articleList} from '../api/article'
    export default {
        name:'Share',
        data() { //选项 / 数据
            return {
                // 查询参数
                queryParams: {
                    pageNum: 1,
                    pageSize: 10,
                    categoryId: 0
                },
                articleList:[],
                hasMore:true
            }
        },

        methods: { //事件处理器
            showInitDate: function(oldDate,full){
                return initDate(oldDate,full)
            },
            getList(){
                articleList(this.queryParams).then((response)=>{
                    this.articleList = this.articleList.concat(response.rows)
                    if(response.total<=this.articleList.length){
                        this.hasMore=false
                    }else{
                        this.hasMore=true
                        this.queryParams.pageNum++
                    }
                })
            },
            showSearchShowList:function(initData){//展示数据
                if(initData){
                    this.articleList = []

                }
                this.getList()
            },
            addMoreFun:function(){//查看更多
                this.showSearchShowList(false);
            },
            routeChange:function(){
                var that = this;
                this.queryParams.categoryId = (that.$route.query.classId==undefined?0:parseInt(that.$route.query.classId));//获取传参的classId
                this.showSearchShowList(true);
            }
        },
        components: { //定义组件

        },
        watch: {
           // 如果路由有变化，会再次执行该方法
           '$route':'routeChange',
           '$store.state.keywords':'routeChange'
         },
        created() { //生命周期函数
            // console.log(this.$route);
            var that = this;
            that.routeChange();
        }
    }
</script>

<style>
/*分享标题*/
.shareTitle{
    margin-bottom: 40px;
    position: relative;
    border-radius: 12px;
    background: #fff;
    padding:20px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.shareclassTwo{
    width:100%;
}
.shareclassTwo li{
    display: inline-block;
}
.shareclassTwo li a{
    display: inline-block;
    padding:8px 16px;
    margin:5px 10px;
    color:#fff;
    border-radius: 20px;
    background: linear-gradient(135deg, #64609E 0%, #667eea 100%);
    border: none;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(100, 96, 158, 0.3);
    font-weight: 500;
}
.shareclassTwo li a:hover{
    transform: translateY(-3px);
    box-shadow: 0 4px 15px rgba(100, 96, 158, 0.4);
}
.shareclassTwo li a.active{
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color:#fff;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}
/*文章列表*/
    .sharelistBox{
        transition: all 0.5s ease-out;
        font-size: 15px;
    }
    
    .s-item {
        transition: all 0.3s ease;
    }
    
    .s-item:hover {
        transform: translateY(-5px);
    }
    
    .s-item header h1 a {
        color: #333;
        transition: color 0.3s ease;
    }
    
    .s-item header h1 a:hover {
        color: #667eea;
    }
    
    .viewdetail a {
        transition: all 0.3s ease;
    }
    
    .viewdetail a:hover {
        transform: translateY(-2px);
    }
</style>

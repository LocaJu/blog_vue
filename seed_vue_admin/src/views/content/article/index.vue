<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="文章标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入文章标题"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属分类" prop="categoryId">
        <el-select v-model="queryParams.categoryId" placeholder="请选择分类" clearable style="width: 240px">
          <el-option
            v-for="item in categoryOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="文章状态" clearable style="width: 240px">
          <el-option label="已发布" value="0" />
          <el-option label="草稿" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button 
          type="primary" 
          icon="el-icon-search" 
          size="mini" 
          :loading="loading"
          @click="handleQuery"
        >搜索</el-button>
        <el-button 
          icon="el-icon-refresh" 
          size="mini" 
          :disabled="loading"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="articleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="文章标题" align="center" prop="title" :show-overflow-tooltip="true" min-width="200" />
      <el-table-column label="摘要" align="center" prop="summary" :show-overflow-tooltip="true" min-width="150" />
      <el-table-column label="分类" align="center" prop="categoryName" width="120" />
      <el-table-column label="缩略图" align="center" prop="thumbnail" width="100">
        <template slot-scope="scope">
          <image-preview 
            :src="scope.row.thumbnail" 
            :width="50" 
            :height="50" 
            v-if="scope.row.thumbnail && scope.row.thumbnail !== 'null' && scope.row.thumbnail.trim() !== ''" 
          />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'info'">
            {{ scope.row.status === '0' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否置顶" align="center" prop="isTop" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isTop === '1' ? 'warning' : 'info'">
            {{ scope.row.isTop === '1' ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="访问量" align="center" prop="viewCount" width="100" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改文章对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1200px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="文章标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入文章标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属分类" prop="categoryId">
              <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
                <el-option
                  v-for="item in categoryOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="文章摘要" prop="summary">
              <el-input v-model="form.summary" type="textarea" :rows="3" placeholder="请输入文章摘要" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="文章内容" prop="content">
              <mavon-editor
                ref="mdEditor"
                v-model="form.content"
                :toolbars="markdownOption"
                style="height: 500px"
                @imgAdd="handleImageAdd"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="缩略图" prop="thumbnail">
              <image-upload v-model="form.thumbnail" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文章标签">
              <el-select v-model="form.tags" multiple placeholder="请选择标签" style="width: 100%">
                <el-option
                  v-for="item in tagOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="是否置顶">
              <el-radio-group v-model="form.isTop">
                <el-radio label="0">否</el-radio>
                <el-radio label="1">是</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio label="0">已发布</el-radio>
                <el-radio label="1">草稿</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="允许评论">
              <el-radio-group v-model="form.isComment">
                <el-radio label="0">否</el-radio>
                <el-radio label="1">是</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listArticle, getArticle, delArticle, addArticle, updateArticle } from "@/api/content/article";
import { listAllCategory } from "@/api/content/category";
import request from "@/utils/request";
import { getToken } from "@/utils/auth";
import ImageUpload from "@/components/ImageUpload";
import ImagePreview from "@/components/ImagePreview";
import { mavonEditor } from 'mavon-editor';
import 'mavon-editor/dist/css/index.css';

export default {
  name: "Article",
  components: {
    ImageUpload,
    ImagePreview,
    mavonEditor
  },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 文章表格数据
      articleList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 分类选项
      categoryOptions: [],
      // 标签选项
      tagOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: null,
        summary: null,
        status: null,
        categoryId: null
      },
      // 表单参数
      form: {},
      // markdown编辑器配置
      markdownOption: {
        bold: true,
        italic: true,
        header: true,
        underline: true,
        strikethrough: true,
        mark: true,
        superscript: true,
        subscript: true,
        quote: true,
        ol: true,
        ul: true,
        link: true,
        imagelink: true,
        code: true,
        table: true,
        fullscreen: true,
        readmodel: true,
        htmlcode: true,
        help: true,
        undo: true,
        redo: true,
        trash: true,
        save: true,
        navigation: true,
        alignleft: true,
        aligncenter: true,
        alignright: true,
        subfield: true,
        preview: true
      },
      // 表单校验
      rules: {
        title: [
          { required: true, message: "文章标题不能为空", trigger: "blur" }
        ],
        categoryId: [
          { required: true, message: "所属分类不能为空", trigger: "change" }
        ],
        content: [
          { required: true, message: "文章内容不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    // 加载分类选项
    this.getCategoryOptions();
    // TODO: 加载标签选项
    // this.getTagOptions();
  },
  methods: {
    /** 查询文章列表 */
    getList() {
      // 如果正在加载，直接返回，避免重复请求
      if (this.loading) {
        console.log('正在加载中，跳过本次请求');
        return;
      }
      this.loading = true;
      console.log('开始请求文章列表，参数:', this.queryParams);
      
      // 设置超时保护，确保loading状态一定会被重置
      const timeoutId = setTimeout(() => {
        if (this.loading) {
          console.warn('请求超时，重置loading状态');
          this.loading = false;
          this.articleList = [];
          this.total = 0;
          this.$message.warning('请求超时，请稍后重试');
        }
      }, 30000); // 30秒超时
      
      listArticle(this.queryParams).then(response => {
        clearTimeout(timeoutId);
        try {
          // 后端返回格式: {code, msg, data: {rows: [], total: 100}}
          // 响应拦截器已经处理，response就是res.data
          console.log('文章列表响应:', response);
          
          // 处理响应数据
          let pageData = {};
          if (response && response.data) {
            // 如果response.data存在，说明是 {code, msg, data: {...}} 格式
            pageData = response.data;
          } else if (response && (response.rows !== undefined || response.total !== undefined)) {
            // 如果response直接包含rows或total，说明response就是分页数据
            pageData = response;
          }
          
          let articleList = Array.isArray(pageData.rows) ? pageData.rows : [];
          
          // 处理缩略图URL，过滤掉null、空字符串和无效URL
          articleList = articleList.map(item => {
            if (item && item.thumbnail && typeof item.thumbnail === 'string') {
              // 如果thumbnail是"null"字符串或包含"null"，清空它
              if (item.thumbnail === 'null' || item.thumbnail.includes('null') || item.thumbnail.trim() === '') {
                item.thumbnail = null;
              }
            }
            return item;
          });
          
          this.articleList = articleList;
          // 确保total是数字类型，使用Number()进行严格转换
          const totalValue = pageData.total !== undefined ? pageData.total : 0;
          this.total = Number(totalValue) || 0;
        } catch (e) {
          console.error('处理响应数据出错:', e);
          this.articleList = [];
          this.total = 0;
        } finally {
          this.loading = false;
        }
      }).catch((error) => {
        clearTimeout(timeoutId);
        console.error('请求失败:', error);
        this.loading = false;
        this.articleList = [];
        this.total = 0;
        // 处理错误信息
        let errorMsg = '查询失败';
        if (error) {
          if (typeof error === 'object' && error.message) {
            errorMsg = error.message;
          } else if (typeof error === 'string') {
            errorMsg = error;
          }
        }
        // 如果不是重复提交的错误，显示错误信息
        if (!errorMsg.includes('重复提交') && !errorMsg.includes('数据正在处理')) {
          this.$message.error('查询失败：' + errorMsg);
        }
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        title: null,
        content: null,
        summary: null,
        categoryId: null,
        thumbnail: null,
        isTop: "0",
        status: "0",
        viewCount: 0,
        isComment: "1",
        tags: []
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加文章";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids[0];
      getArticle(id).then(response => {
        // 后端返回格式: {code, msg, data: {...}}
        this.form = response.data || response;
        // 处理标签数组
        if (this.form.tags && typeof this.form.tags === 'string') {
          try {
            this.form.tags = JSON.parse(this.form.tags);
          } catch (e) {
            this.form.tags = [];
          }
        }
        if (!Array.isArray(this.form.tags)) {
          this.form.tags = [];
        }
        this.open = true;
        this.title = "修改文章";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          // 准备提交数据，移除viewCount（访问量由系统管理）
          const submitData = { ...this.form };
          delete submitData.viewCount; // 移除viewCount，避免后端处理null值出错
          
          if (this.form.id != null) {
            updateArticle(submitData).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            }).catch(error => {
              console.error('更新文章失败:', error);
              this.$modal.msgError("修改失败");
            });
          } else {
            addArticle(submitData).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            }).catch(error => {
              console.error('新增文章失败:', error);
              this.$modal.msgError("新增失败");
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除文章编号为"' + ids + '"的数据项？').then(function() {
        return delArticle(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 图片上传处理 */
    handleImageAdd(pos, file) {
      const formData = new FormData();
      formData.append('file', file);
      
      // 检查token是否存在
      const token = getToken();
      if (!token) {
        this.$message.error('登录已过期，请重新登录');
        return;
      }
      
      // 使用request上传图片
      // 对于FormData，不要手动设置Content-Type，让浏览器自动设置（包含boundary）
      // 这样axios拦截器才能正常工作并添加token
      request({
        url: '/common/upload',
        method: 'post',
        data: formData
        // 不设置headers，让axios自动处理，拦截器会自动添加token
      }).then(response => {
        if (response && response.code === 200) {
          // 插入图片到markdown编辑器
          const imgUrl = process.env.VUE_APP_BASE_API + response.fileName;
          this.$refs.mdEditor.$img2Url(pos, imgUrl);
        } else {
          this.$message.error('图片上传失败：' + (response?.msg || '未知错误'));
        }
      }).catch((error) => {
        console.error('图片上传失败:', error);
        console.error('错误详情:', {
          status: error?.response?.status,
          data: error?.response?.data,
          message: error?.message
        });
        const errorMsg = error?.response?.data?.msg || error?.message || '网络错误';
        if (errorMsg.includes('登录') || errorMsg.includes('401') || error?.response?.status === 401) {
          this.$message.error('登录已过期，请重新登录');
          // 可以在这里触发重新登录逻辑
        } else {
          this.$message.error('图片上传失败：' + errorMsg);
        }
      });
    },
    /** 加载分类选项 */
    getCategoryOptions() {
      listAllCategory().then(response => {
        // 后端返回格式: {code, msg, data: [...]}
        if (response && response.data) {
          this.categoryOptions = Array.isArray(response.data) ? response.data : [];
        } else {
          this.categoryOptions = [];
        }
      }).catch(error => {
        console.error('加载分类选项失败:', error);
        this.categoryOptions = [];
      });
    }
  }
};
</script>

<style scoped>
::v-deep .v-note-wrapper {
  z-index: 2000;
}
</style>


<template>
  <div>
    <el-button type="primary" round icon="el-icon-plus" @click="add"
      >添加</el-button
    >
    <!-- 表格 -->
    <el-table
      :data="trademarkList"
      border
      style="width: 100%; margin: 20px 0"
      v-loading="loading"
      element-loading-text="正在加载中，请骚等"
      element-loading-spinner="el-icon-magic-stick"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <el-table-column type="index" label="序号" width="80" align="center">
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称"> </el-table-column>
      <el-table-column label="品牌LOGO">
        <template slot-scope="scope">
          <img class="trademark-img" :src="scope.row.logoUrl" alt="logo" />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template v-slot="{ row }">
          <el-button
            type="success"
            round
            class="button-put"
            icon="el-icon-s-promotion"
            @click="fixUpImg(row)"
            >修改</el-button
          >
          <el-button
            type="danger"
            round
            class="button-del"
            icon="el-icon-delete-solid"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!--   分页器 -->
    <el-pagination
      background
      class="pagination"
      @size-change="getPageList(page, $event)"
      @current-change="getPageList($event, limit)"
      :page-sizes="[3, 6, 9]"
      :page-size.sync="limit"
      :current-page="page"
      layout="prev, pager, next, jumper, sizes, total"
      :total="total"
    >
    </el-pagination>
    <!-- 对话框 -->
    <el-dialog
      :title="`${trademarkForm.id ? '添加' : '修改'}品牌`"
      :visible.sync="visible"
      width="50%"
    >
      <!-- form 表单 -->
      <el-form
        :model="trademarkForm"
        :rules="rules"
        ref="trademarkForm"
        label-width="100px"
      >
        <el-form-item label="品牌名称" prop="tmName">
          <el-input v-model="trademarkForm.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" prop="logoUrl">
          <!-- 上传 -->
          <el-upload
            class="avatar-uploader"
            :action="`${$BASE_API}/admin/product/fileUpload`"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img
              v-if="trademarkForm.logoUrl"
              :src="trademarkForm.logoUrl"
              class="avatar"
            />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <span>只能上传jpg/png文件，且不超过50kb</span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('trademarkForm')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { trademark } from "@/api";
export default {
  name: "TrademarkList",
  data() {
    return {
      loading: false,
      trademarkList: [],
      total: 0, //总数
      page: 1, //当前页码
      limit: 3, //每页显示的条数
      visible: false, //对话框显示与隐藏
      trademarkForm: {
        tmName: "",
        logoUrl: "",
      },
      rules: {
        tmName: [
          {
            required: true,
            message: "品牌名称必须填写",
            trigger: "blur", //失去焦点时触发
          },
        ],
        logoUrl: [{ required: true, message: "请上传品牌LOGO" }],
      },
    };
  },
  methods: {
    add() {
      this.$refs.trademarkForm && this.$refs.trademarkForm.clearValidata();
      this.visible = true;
      this.trademarkForm = {};
    },
    async getPageList(page, limit) {
      this.loading = true;
      const result = await this.$API.trademark.getPageList(page, limit);
      if (result.code === 200) {
        this.$message.success("获取品牌分页列表成功");
        this.limit = result.data.size;
        this.page = result.data.current;
        this.trademarkList = result.data.records;
        this.total = result.data.total;
      } else {
        this.$message("获取品牌分页列表失败");
      }
      this.loading = false;
    },
    //提交表单
    submitForm(form) {
      this.$refs[form].validate(async (valid) => {
        if (valid) {
          const { trademarkForm } = this;
          //代表是否更新
          const isUpdate = !!trademarkForm.id;
          //如果是修改需要验证
          if (isUpdate) {
            const tm = this.trademarkList.find(
              (tm) => tm.id === trademarkForm.id
            );
            if (
              tm.tmName === trademarkForm.tmName &&
              tm.logoUrl === trademarkForm.logoUrl
            ) {
              this.$message.warning("不能提交与之前一样的");
              return;
            }
          }

          let result;
          if (isUpdate) {
            result = await this.$API.trademark.updateTrademark(trademarkForm);
          }
          {
            result = await this.$API.trademark.addTrademark(trademarkForm);
          }

          if (result.code === 200) {
            this.$message.success("添加数据成功");
            this.visible = false; //隐藏对话框
            //上传之后再更新下数据
            this.getPageList(this.page, this.limit);
          } else {
            this.$message.error(result.message);
          }
        }
      });
    },
    handleAvatarSuccess(res) {
      this.trademarkForm.logoUrl = res.data;
    },
    beforeAvatarUpload(file) {
      //判断类型
      const imgtTypes = ["image/jpg", "image/png", "image/jpeg"];
      const isValidType = imgtTypes.indexOf(file.type) > -1;
      //检测文件大小
      const isLt = file.size / 1024 < 50;

      if (!isValidType) {
        this.$message.error("上传品牌LOGO只能传JPG/PNG格式");
      }
      if (!isLt) {
        this.$message.error("上传LOGO大小不能超过50kb");
      }
      //返回为true，代表可以上传
      //返回为false，代表不可以上传
      return isValidType && isLt;
    },
    fixUpImg(row) {
      this.$refs.trademarkForm && this.$refs.trademarkForm.clearValidata();
      this.visible = true;
      this.trademarkForm = { ...row };
    },
    /*   await this.$API.trademark.updateTrademark(); */
  },
  mounted() {
    this.getPageList(this.page, this.limit);
  },
};
</script>

<style lang="sass" scoped>
.trademark-img
  width: 150px
>>>.button-put
  margin-left: 50px
  margin-right: 50px

>>>.avatar-uploader .el-upload
  border: 1px dashed #d9d9d9
  border-radius: 6px
  cursor: pointer
  position: relative
  overflow: hidden

  &:hover
    border-color: #409EFF

>>>.avatar-uploader-icon
  font-size: 28px
  color: #8c939d
  width: 178px
  height: 178px
  line-height: 178px
  text-align: center
>>>.avatar
  width: 178px
  height: 178px
  display: block
</style>
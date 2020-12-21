<template>
  <el-card style="margin-top: 20px">
    <el-button
      type="primary"
      round
      icon="el-icon-plus"
      :disabled="!category.category3Id"
      @click="$emit('showUpdateList', { category3Id: category.category3Id })"
      >添加SPU</el-button
    >

    <el-table
      :data="spuList"
      v-loading="loading"
      border
      style="width: 100%; margin: 20px 0"
    >
      <el-table-column type="index" label="序号" width="80" align="center">
      </el-table-column>
      <el-table-column prop="spuName" label="SPU名称"> </el-table-column>
      <el-table-column prop="description" label="SPU描述"> </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{ row }">
          <!--  <el-input
            v-if="row.edit"
            size="mini"
            style="width: 100px"
            autofocus
            ref="input"
          ></el-input> -->
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="$emit('showSpuList', { ...row, ...category })"
          ></el-button>
          <el-button
            type="primary"
            icon="el-icon-edit"
            @click="$emit('showUpdateList', row)"
            size="mini"
          ></el-button>
          <el-button type="info" icon="el-icon-info" size="mini"></el-button>
          <el-button
            type="warning"
            icon="el-icon-delete"
            size="mini"
            @click="del(row)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
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
  </el-card>
</template>

<script>
import getPageTitle from "@/utils/get-page-title";
export default {
  name: "SpuShowList",
  data() {
    return {
      page: 1,
      limit: 3,
      total: 0,
      category: {
        category1Id: "",
        category2Id: "",
        category3Id: "",
      },
      spuList: [],
      loading: false,
    };
  },
  methods: {
    async del(row) {
      /* console.log(row); */
      const result = await this.$API.spu.deleteSpu(row.id);
      if (result.code === 200) {
        /*  this.spuList = this.spuList.filter((spu) => spu.id !== row.id); */
        this.$message.success("删除成功");
      } else {
        this.$message.error("删除失败");
      }
      this.getPageList(this.page, this.limit);
    },
    addSPU() {
      this.isShowList = true;
    },
    /*  edit(row) {
      this.$set(row, "edit", true);
      this.$nextTick(() => {
        this.$refs.input.focus();
      });
    }, */
    async getPageList(page, limit) {
      this.loading = true;
      const { category3Id } = this.category;
      const result = await this.$API.spu.getSpuList({
        page,
        limit,
        category3Id,
      });
      /*  console.log(result); */
      if (result.code === 200) {
        this.$message.success("获取SPU分页列表成功");
        this.spuList = result.data.records;
        this.total = result.data.total;
      } else {
        this.$message.error(result.message);
      }
      this.loading = false;
    },
    //全局事件总线，选中三级分类触发
    handleCategoryChange(category) {
      this.category = category;
      this.getPageList(this.page, this.limit);
    },
    //当选中1级或者2级分类触发
    clearList() {
      this.spuList = [];
      this.page = 1;
      this.limit = 3;
      this.total = 0;
      this.category.category3Id = "";
    },
  },
  mounted() {
    this.$bus.$on("change", this.handleCategoryChange);
    this.$bus.$on("clearList", this.clearList);
  },

  //清除绑定事件
  beforeDestroy() {
    this.$bus.$off("change", this.handleCategoryChange);
    this.$bus.$off("clearList", this.clearList);
  },
};
</script>

<style lang="less" scoped>
</style>

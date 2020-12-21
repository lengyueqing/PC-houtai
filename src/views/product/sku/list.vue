<template>
  <el-card>
    <el-table
      :data="skuList"
      border
      style="width: 100%; margin: 20px 0"
      v-loading="loading"
      row-key="id"
    >
      <el-table-column type="index" label="序号" width="80" align="center">
      </el-table-column>
      <el-table-column prop="skuName" label="名称"> </el-table-column>
      <el-table-column prop="skuDesc" label="描述"> </el-table-column>
      <el-table-column label="默认图片" width="150" align="center">
        <template slot-scope="{ row }">
          <div claa="info">
            <div class="pic">
              <img :src="row.skuDefaultImg" />
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="weight" label="重量(KG)"> </el-table-column>
      <el-table-column prop="price" label="价格(元)" width="80">
      </el-table-column>
      <el-table-column label="操作" width="250" align="center">
        <template slot-scope="{ row }">
          <el-button
            type="info"
            icon="el-icon-bottom"
            size="mini"
            title="上架"
            v-if="row.isSale === 0"
            @click="onSale(row.id)"
          ></el-button>
          <el-button
            type="success"
            icon="el-icon-top"
            size="mini"
            title="下架"
            v-if="row.isSale === 1"
            @click="cancelSale(row.id)"
          ></el-button>
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="toUpdateSku(row.id)"
          ></el-button>
          <el-button
            type="info"
            icon="el-icon-info"
            size="mini"
            @click="showSkuInfo(row.id)"
          ></el-button>
          <el-popconfirm
            @onConfirm="delSku(row.id)"
            :title="`确定删除 ${row.skuName} 吗？`"
          >
            <el-button
              type="warning"
              icon="el-icon-delete"
              size="mini"
              slot="reference"
            ></el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="page"
      :total="total"
      :page-size="limit"
      :page-sizes="[5, 10, 20, 30, 40, 50]"
      style="padding: 20px 0; text-align: center"
      layout="prev, pager, next, jumper, ->, sizes, total"
      @current-change="getSkuList"
      @size-change="changeSize"
    />

    <el-drawer :visible.sync="isShowSkuInfo" :with-header="false" size="50%">
      <el-row>
        <el-col :span="5">名称</el-col>
        <el-col :span="16">{{ skuInfo.skuName }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">描述</el-col>
        <el-col :span="16">{{ skuInfo.skuDesc }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">价格</el-col>
        <el-col :span="16">{{ skuInfo.price }}</el-col>
      </el-row>

      <el-row>
        <el-col :span="5">平台属性</el-col>
        <el-col :span="18">
          <el-tag
            type="success"
            style="margin-right: 5px"
            v-for="value in skuInfo.skuAttrValueList"
            :key="value.id"
          >
            {{ value.attrId + "-" + value.valueId }}
          </el-tag>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="5">销售属性</el-col>
        <el-col :span="18">
          <el-tag
            type="success"
            style="margin-right: 5px"
            v-for="value in skuInfo.skuSaleAttrValueList"
            :key="value.id"
          >
            {{ value.id + "-" + value.saleAttrValueId }}
          </el-tag>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="5">商品图片</el-col>
        <el-col :span="16">
          <el-carousel class="sku-carousel" trigger="click" height="400px">
            <el-carousel-item
              v-for="item in skuInfo.skuImageList"
              :key="item.id"
            >
              <img :src="item.imgUrl" alt="" />
            </el-carousel-item>
          </el-carousel>
        </el-col>
      </el-row>
    </el-drawer>
  </el-card>
</template>

<script>
export default {
  name: "SKuList",
  data() {
    return {
      page: 1,
      total: 0,
      limit: 10,
      skuList: [],
      loading: false,
      skuInfo: {},
      isShowSkuInfo: false,
    };
  },
  mounted() {
    this.getSkuList();
  },
  methods: {
    async getSkuList(page = 1) {
      //获取SKU列表
      this.page = page;
      this.loading = true;
      const result = await this.$API.sku.getSkuList({
        page: this.page,
        limit: this.limit,
      });
      if (result.code === 200) {
        this.$message.success("获取sku分页列表成功");
        this.skuList = result.data.records;
        this.total = result.data.total;
      } else {
        this.$message.error("获取sku分类列表失败");
      }
      this.loading = false;
    },
    changeSize(size) {
      this.limit = size;
      this.getSkuList(1);
    },
    //上架SKU
    async onSale(skuId) {
      const result = await this.$API.sku.onSale(skuId);
      if (result.code === 200) {
        this.$message.success("上架成功");
        this.getSkuList(this.page);
      } else {
        this.$message.error("上架失败");
      }
    },
    //下架
    async cancelSale(skuId) {
      const result = await this.$API.sku.cancelSale(skuId);
      if (result.code === 200) {
        this.$message.success("下架成功");
        this.getSkuList(this.page);
      } else {
        this.$message.error("下架失败");
      }
    },
    //编辑按钮
    toUpdateSku() {
      this.$message.info("正在开发中");
    },
    //删除按钮
    async delSku(skuId) {
      const result = await this.$API.sku.remove(skuId);
      if (result.code === 200) {
        this.$message.success("删除成功");
        this.getSkuList(this.page);
      } else {
        this.$message.error("删除失败");
      }
    },
    //获取某个sku id的属性
    async showSkuInfo(id) {
      this.isShowSkuInfo = true;
      const result = await this.$API.sku.get(id);
      console.log(result);
      if (result.code === 200) {
        this.$message.success("获取成功");
        this.skuInfo = result.data;
      } else {
        this.$message.error("获取失败");
      }
    },
  },
};
</script>
<style lang="sass" scoped>
img
  width: 50px
  height: 50px
</style>
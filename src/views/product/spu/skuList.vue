<template>
  <div>
    <el-card>
      <el-form label-width="100px" :model="sku" ref="skuForm" :rules="rules">
        <el-form-item label="SPU名称" prop="spuName">
          <span>{{ spu.spuName }}</span>
        </el-form-item>
        <el-form-item prop="skuName" label="SKU名称">
          <el-input
            placeholder="请输入SKU名称"
            v-model="sku.skuName"
            type="text"
          ></el-input>
        </el-form-item>
        <el-form-item prop="price" label="价格(元)">
          <el-input-number
            align="left"
            style="width: 300px"
            placeholder="请输入价格"
            controls-position="right"
            :min="0"
            :max="20000"
            v-model="sku.price"
          >
          </el-input-number>
        </el-form-item>
        <el-form-item label="重量(千克)" prop="weight">
          <el-input-number
            style="width: 300px"
            placeholder="请输入重量"
            controls-position="right"
            :min="0"
            :max="20000"
            v-model="sku.weight"
          >
          </el-input-number>
        </el-form-item>
        <el-form-item label="规格描述" prop="skuDesc">
          <el-input
            type="textarea"
            placeholder="请输入规格描述"
            v-model="sku.skuDesc"
          ></el-input>
        </el-form-item>
        <el-form-item label="平台属性" prop="skuAttrValueList">
          <div
            class="skulist-select-container"
            v-for="(attr, index) in attrList"
            :key="attr.id"
          >
            <el-form-item :label="attr.attrName" style="display: inline-block">
              <el-select
                placeholder="请选择"
                v-model="sku.skuAttrValueList[index]"
                @change="clearValidate('skuAttrValueList')"
              >
                <el-option
                  v-for="value in attr.attrValueList"
                  :key="value.id"
                  :label="value.valueName"
                  :value="`${attr.id}-${value.id}`"
                ></el-option>
              </el-select>
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item label="销售属性" prop="skuSaleAttrValueList">
          <div
            class="skulist-select-container"
            v-for="(sale, index) in spuSaleAttrList"
            :key="sale.id"
          >
            <el-form-item
              style="display: inline-block"
              :label="sale.saleAttrName"
            >
              <el-select
                placeholder="请选择"
                v-model="sku.skuSaleAttrValueList[index]"
                @change="clearValidate('skuSaleAttrValueList')"
              >
                <el-option
                  v-for="value in sale.spuSaleAttrValueList"
                  :key="value.id"
                  :label="value.saleAttrValueName"
                  :value="`${sale.id}-${value.id}`"
                ></el-option>
              </el-select>
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item label="图片列表" prop="skuImageList">
          <el-form-item>
            <el-table
              ref="multipleTable"
              border
              :data="imageList"
              style="width: 100%; margin: 20px 0"
              row-key="id"
              @selection-change="handleSelectionChange"
            >
              <el-table-column
                type="selection"
                width="55"
                prop="isCheck"
                reserve-selection
              ></el-table-column>
              <el-table-column label="图片">
                <template slot-scope="scope">
                  <img
                    :src="scope.row.imgUrl"
                    :alt="scope.row.imgName"
                    style="display: inline-block; width: 100%; height: 200px"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="imgName" label="名称"></el-table-column>
              <el-table-column label="操作">
                <template v-slot="{ row, $index }">
                  <el-button
                    type="primary"
                    size="mini"
                    v-if="!row.isDefault"
                    @click="setDefault($index, row.id)"
                    >设为默认</el-button
                  >
                  <el-tag v-else type="success">默认</el-tag>
                </template></el-table-column
              >
            </el-table>
          </el-form-item>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save">保存</el-button>
          <el-button>取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "SkuList",
  props: {
    spuItem: Object,
  },
  data() {
    return {
      spu: this.spuItem,
      imageList: [],
      spuSaleAttrList: [],
      attrList: [],
      sku: {
        skuAttrValueList: [],
        skuSaleAttrValueList: [],
        skuImageList: [],
      },
      rules: {
        skuName: [
          {
            required: true,
            message: "sku名称必须填写",
            tigger: "change",
          },
        ],
        price: [
          {
            type: "number",
            required: true,
            message: "sku价格必须填写",
            tigger: "change",
          },
        ],
        weight: [
          {
            type: "number",
            required: true,
            message: "请输入sku重量",
            tigger: "change",
          },
        ],
        skuDesc: [
          { required: true, message: "请输入sku描述", tigger: "change" },
        ],
        skuAttrValueList: [
          { required: true, validator: this.skuAttrValueListValidator },
        ],
        skuSaleAttrValueList: [
          {
            required: true,
            validator: this.skuSaleAttrValueListvalidator,
          },
        ],
        skuImageList: [
          { required: true, validator: this.skuImageListvalidator },
        ],
      },
    };
  },
  methods: {
    save() {
      this.$refs.skuForm.validate(async (valid) => {
        if (valid) {
          // console.log("校验通过~");
          const { category3Id, id: spuId, tmId } = this.spu;

          const skuAttrValueList = this.sku.skuAttrValueList.map((attr) => {
            const [attrId, valueId] = attr.split("-");
            return {
              attrId,
              valueId,
            };
          });

          const skuSaleAttrValueList = this.sku.skuSaleAttrValueList.map(
            (saleAttrValueId) => {
              return {
                saleAttrValueId,
                spuId,
              };
            }
          );

          const skuDefaultImg = this.sku.skuImageList.find(
            (img) => img.isDefault
          ).imgUrl;

          const result = await this.$API.sku.saveSku({
            ...this.sku,
            category3Id,
            spuId,
            tmId,
            skuAttrValueList,
            skuSaleAttrValueList,
            skuDefaultImg,
          });
          if (result.code === 200) {
            this.$message.success("保存sku成功~");
            this.$emit("showList");
          } else {
            this.$message.error(result.message);
          }
        }
      });
    },
    handleSelectionChange(skuImageList) {
      this.sku.skuImageList = skuImageList;
    },
    clearValidate(prop) {
      this.$refs.skuForm.clearValidate(prop);
    },
    setDefault(i, id) {
      this.clearValidate("skuImageList");
      this.imageList = this.imageList.map((img, index) => {
        return {
          ...img,
          isDefault: i === index ? true : false,
        };
      });
      this.sku.skuImageList = this.sku.skuImageList.map((img, index) => {
        return {
          ...img,
          isDefault: img.id === id ? true : false,
        };
      });
    },
    skuImageListvalidator(rule, value, callback) {
      const {
        sku: { skuImageList },
      } = this;
      if (skuImageList.length === 0) {
        callback(new Error("请选择至少一张图片"));
        return;
      }
      if (!skuImageList.some((img) => img.isDefault)) {
        callback(new Error("请设置一张默认图片"));
        return;
      }
      callback();
    },
    skuSaleAttrValueListvalidator(rule, value, callback) {
      const {
        spuSaleAttrList,
        sku: { skuSaleAttrValueList },
      } = this;
      if (
        skuSaleAttrValueList.length !== spuSaleAttrList.length ||
        skuSaleAttrValueList.some((sale) => !sale)
      ) {
        callback(new Error("请对所有销售属性进行选择"));
        return;
      }
      callback();
    },
    skuAttrValueListValidator(rule, value, callback) {
      const {
        attrList,
        sku: { skuAttrValueList },
      } = this;
      if (
        skuAttrValueList.length !== attrList.length ||
        skuAttrValueList.some((attr) => !attr)
      ) {
        callback(new Error("请对所有平台属性进行选择"));
        return;
      }
      callback();
    },
    async getSpuImageList() {
      const { id } = this.spu;
      const result = await this.$API.spu.getSpuImageList(id);
      if (result.code === 200) {
        this.$message.success("获取所有图片成功~~");
        this.imageList = result.data.map((img) => {
          return {
            ...img,
            isCheck: true,
          };
        });
      } else {
        this.$message.error(result.message);
      }
    },
    //获取所有销售属性列表
    async getSpuSaleAttrList() {
      const { id } = this.spu;
      const result = await this.$API.spu.getSpuSaleAttrList(id);
      if (result.code === 200) {
        this.$message.success("获取SPU销售属性成功~~");
        this.spuSaleAttrList = result.data;
      } else {
        this.$message.error(result.message);
      }
    },
    //获取所有平台属性列表
    async getAttrList() {
      const result = await this.$API.attrs.getAttrList({
        category1Id: this.spu.category1Id,
        category2Id: this.spu.category2Id,
        category3Id: this.spu.category3Id,
      });
      if (result.code === 200) {
        this.$message.success("获取平属性成功~~");
        this.attrList = result.data;
      } else {
        this.$message.error(result.message);
      }
    },
  },
  mounted() {
    this.getAttrList();
    this.getSpuSaleAttrList();
    this.getSpuImageList();
  },
};
</script>

<style lang="sass" scoped>
>>>.el-input-number .el-input__inner
  text-align: left

.skulist-select-container
  display: inline-block
  width: 30%
  margin-bottom: 10px
  text-align: right
</style>

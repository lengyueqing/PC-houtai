<template>
  <el-card style="margin-top: 20px">
    <el-form label-width="80px" :model="spu" ref="spuForm" :rules="rules">
      <el-form-item label="SPU名称" prop="spuName">
        <el-input placeholder="请输入SPU名称" v-model="spu.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌" prop="tmId">
        <el-select placeholder="请选择品牌" v-model="spu.tmId">
          <el-option
            v-for="tm in trademarkList"
            :key="tm.id"
            :value="tm.id"
            :label="tm.tmName"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述" prop="description">
        <el-input
          type="textarea"
          placeholder="请输入SPU描述"
          v-model="spu.description"  
        ></el-input>
      </el-form-item>
      <el-form-item label="SPU图片" prop="imageList">
        <el-upload
          accept="image/*"
          class="avatar-uploader"
          :action="`${$BASE_API}/admin/product/fileUpload`"
          list-type="picture-card"
          :file-list="formatImage"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <i class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="销售属性" prop="sale">
        <el-select
          v-model="spu.sale"
          :placeholder="`还剩${filterSale.length}个未选择`"
        >
          <el-option
            v-for="saled in filterSale"
            :key="saled.id"
            :label="saled.name"
            :value="`${saled.id}-${saled.name}`"
          ></el-option>
        </el-select>
        <el-button
          type="primary"
          round
          icon="el-icon-plus"
          :disabled="!spu.sale"
          @click="addSpuSaleAttr"
          >添加销售属性</el-button
        >
        <el-table
          :data="spuSaleAttrList"
          border
          style="width: 100%; margin: 20px 0"
        >
          <el-table-column type="index" label="序号" width="80" align="center">
          </el-table-column>
          <el-table-column label="属性值名称" prop="saleAttrName">
          </el-table-column>
          <el-table-column label="属性值列表">
            <template v-slot="{ row, $index }">
              <el-tag
                @close="delTag(i, row)"
                closable
                style="margin-right: 5px"
                v-for="(attrVal, i) in row.spuSaleAttrValueList"
                :key="attrVal.id"
                >{{ attrVal.saleAttrValueName }}
              </el-tag>
              <el-input
                v-if="row.edit"
                size="mini"
                style="width: 100px"
                @blur="editCompleted(row, $index)"
                @keyup.enter.native="editCompleted(row, $index)"
                autofocus
                ref="input"
                v-model="saleAttrValueText"
              ></el-input>
              <el-button
                v-else
                inco="el-icon-plus"
                size="mini"
                @click="edit(row)"
                >添加</el-button
              >
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template v-slot="{ row, $index }">
              <el-popconfirm
                @onConfirm="delSpuSaleAttr($index)"
                :title="`确定删除 ${row.saleAttrName} 吗？`"
                ><el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  slot="reference"
                ></el-button
              ></el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="$emit('showList', spu.category3Id)">取消</el-button>
      </el-form-item>
    </el-form>
    <!-- 图片删除和放大的隐藏 -->
    <el-dialog :visible.sync="visible">
      <img width="100%" :src="previewImgUrl" alt="img" />
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  name: "SpuUpdateList",
  props: {
    item: Object,
  },
  data() {
    return {
      spu: this.item,
      trademarkList: [],
      imageList: [],
      previewImgUrl: "",
      visible: false,
      saleAttrList: [],
      spuSaleAttrList: [],
      saleAttrValueText: "",
      rules: {
        spuName: [{ required: true, message: "*为必填项目" }],
        tmId: [{ required: true, message: "*为必填项目" }],
        description: [{ required: true, message: "*为必填项目" }],
        imageList: [{ required: true, validator: this.imageListValidator }],
        sale: [{ required: true, validator: this.saleValidator }],
      },
    };
  },
  methods: {
    save() {
      this.$refs.spuForm.validate(async (valid) => {
        if (valid) {
          console.log("校验通过");
          const spu = {
            ...this.spu, //展开数据
            spuImageList: this.imageList,
            spuSaleAttrList: this.spuSaleAttrList,
          };
          let result;
          //发送请求
          if (this.spu.id) {
            result = await this.$API.spu.updateSpu(spu);
          } else {
            result = await this.$API.spu.saveSpu(spu);
          }

          if (result.code === 200) {
            this.$emit("showList", this.spu.category3Id);
            this.$message.success(`${this.spu.id ? "更新" : "添加"}SPU成功`);
          } else {
            this.$message.error(result.message);
          }
        }
        //收集数据
      });
    },
    //表单验证
    imageListValidator(rule, value, callback) {
      if (this.imageList.length > 0) {
        //校验通过
        callback();
        return;
      }
      //校验失败
      callback(new Error("请上传至少一张图片"));
    },
    //销售属性校验
    saleValidator(ule, value, callback) {
      if (this.spuSaleAttrList.length === 0) {
        callback(new Error("请选择至少一个销售属性"));
        return;
      }
      //判断销售属性中至少添加一个销售属性的值
      const isNotOk = this.spuSaleAttrList.some((sale) => {
        sale.spuSaleAttrValueList.length === 0;
      });
      if (isNotOk) {
        callback(new Error("销售属性至少添加一个销售属性"));
        return;
      }
      callback();
    },
    //删除整个销售属性
    delSpuSaleAttr(index) {
      this.spuSaleAttrList.splice(index, 1);
    },
    //删除单个
    delTag(index, row) {
      /* row.spuSaleAttrValueList = row.spuSaleAttrValueList.filter((sale) => {
        sale.id !== id;
      }); */
      row.spuSaleAttrValueList.splice(index, 1);
    },
    edit(row) {
      this.$set(row, "edit", true);
      this.$nextTick(() => {
        this.$refs.input.focus();
      });
    },
    editCompleted(row, index) {
      if (this.saleAttrValueText) {
        row.spuSaleAttrValueList.push({
          baseSaleAttrId: row.baseSaleAttrId,
          saleAttrName: row.saleAttrName,
          saleAttrValueName: this.saleAttrValueText,
          spuId: row.spuId,
        });
        this.saleAttrValueText = "";
      }
      row.edit = false;
    },
    addSpuSaleAttr() {
      const { sale, id } = this.spu;
      const [baseSaleAttrId, saleAttrName] = sale.split("-");
      //去所有销售列表中找到某个销售属性
      //讲销售属性添加到商品中
      this.spuSaleAttrList.push({
        baseSaleAttrId: +baseSaleAttrId,
        saleAttrName,
        spuId: id,
        spuSaleAttrValueList: [],
      });
      //清空
      this.spu.saleAttrId = "";
    },
    // 上传图片成功的回调
    handleAvatarSuccess(res, file) {
      this.imageList.push({
        uid: file.uid,
        imgName: file.name, // 文件名称
        imgUrl: res.data, // 图片地址
        spuId: this.spu.id, // SPU id
      });
    },
    //处理删除
    handleRemove(file, fileList) {
      this.imageList = this.imageList.filter((img) => img.imgUrl !== file.url);
    },
    //图片放大
    handlePictureCardPreview(file) {
      this.previewImgUrl = file.url;
      this.visible = true;
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
  },
  async mounted() {
    const { id } = this.spu;
    //获取所有品牌数据
    const result = await this.$API.spu.getTrademarkList();
    if (result.code === 200) {
      this.$message.success("获得所有品牌成功~~");
      this.trademarkList = result.data;
    } else {
      this.$message.error(result.message);
    }
    //获取SPU所有销售属性列表

    const sale = await this.$API.spu.getSaleAttrList(id);
    if (sale.code === 200) {
      this.$message.success("获取所有销售属性列表");
      this.saleAttrList = sale.data;
    } else {
      this.$message.error(sale.message);
    }

    if (this.spu.id) {
      //获得所有销售属性列表
      const spuattr = await this.$API.spu.getSpuSaleAttrList(id);
      if (spuattr.code === 200) {
        this.$message.success("获取SPU销售属性列表成功");
        this.spuSaleAttrList = spuattr.data;
      } else {
        this.$message.error(spuattr.message);
      }

      //获取所有图片数据

      const res = await this.$API.spu.getSpuImageList(id);
      if (res.code === 200) {
        this.$message.success("获得所有图片数据成功~~");
        this.imageList = res.data;
      } else {
        this.$message.error(res.message);
      }
    }
  },
  computed: {
    formatImage() {
      return this.imageList.map((img) => {
        return {
          uid: img.uid || img.id,
          name: img.imgName,
          url: img.imgUrl,
        };
      });
    },
    filterSale() {
      return this.saleAttrList.filter((saleAttr) => {
        return !this.spuSaleAttrList.find(
          (spusale) => spusale.baseSaleAttrId === saleAttr.id
        );
      });
    },
  },
};
</script>

<style lang="sass" scoped>
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
  width: 150px
  height: 150px
  line-height: 150px
  text-align: center

>>>.avatar
  width: 150px
  height: 150px
  display: block
</style>

<template>
  <div>
    <el-card class="box-card">
      <!-- form表单 -->
      <el-form inline :model="category">
        <el-form-item label="一级分类">
          <el-select
            v-model="category.category1Id"
            placeholder="请选择"
            @change="handleSelectChangle1"
            :disabled="disabled"
          >
            <el-option
              v-for="c1 in category1List"
              :key="c1.id"
              :label="c1.name"
              :value="c1.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="二级分类">
          <el-select
            v-model="category.category2Id"
            placeholder="请选择"
            @change="handleSelectChangle2"
            :disabled="disabled"
          >
            <el-option
              v-for="c2 in category2List"
              :key="c2.id"
              :label="c2.name"
              :value="c2.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item abel="三级分类">
          <el-select
            v-model="category.category3Id"
            placeholder="请选择"
            @change="handleSelectChangle3"
            :disabled="disabled"
          >
            <el-option
              v-for="c3 in category3List"
              :key="c3.id"
              :label="c3.name"
              :value="c3.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Category",
  props: ["disabled"],
  data() {
    return {
      category: {
        category1Id: "",
        category2Id: "",
        category3Id: "",
      },
      category1List: [], // 1级分类数据
      category2List: [],
      category3List: [],
    };
  },
  methods: {
    async handleSelectChangle1(category1Id) {
      this.category2List = [];
      this.category3List = [];
      this.category.category2Id = "";
      this.category.category3Id = "";
      const result = await this.$API.attrs.getCategorys2(category1Id);
      if (result.code === 200) {
        this.category2List = result.data;
      } else {
        this.$message.error(result.message);
      }
      //清空父组件
      this.$bus.$emit("clearList");
    },
    async handleSelectChangle2(category2Id) {
      this.category.category3Id = "";
      this.category3List = [];
      const result = await this.$API.attrs.getCategorys3(category2Id);
      if (result.code === 200) {
        this.category3List = result.data;
      } else {
        this.$message.error(result.message);
      }
      //清空父组件
      this.$bus.$emit("clearList");
    },
    async handleSelectChangle3(category3Id) {
      const category = {
        ...this.category,
        category3Id,
      };
      this.$bus.$emit("change", category);
    },
  },
  async mounted() {
    const result = await this.$API.attrs.getCategorys1();
    if (result.code === 200) {
      this.category1List = result.data;
    } else {
      this.$message.error(result.message);
    }
  },
};
</script>

<style lang="less" scoped>
</style>

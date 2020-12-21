<template>
  <div>
    <Category
      @change="getAttrList"
      @clearList="clearList"
      :disabled="!isShowList"
    ></Category>
    <!-- ele  card插件 -->
    <el-card v-show="isShowList" class="box-card">
      <el-button
        type="primary"
        @click="add"
        :disabled="!category.category3Id"
        round
        icon="el-icon-plus"
        >添加属性</el-button
      >

      <el-table :data="attrList" border style="width: 100%; margin: 20px 0">
        <el-table-column type="index" label="序号" width="80" align="center">
        </el-table-column>
        <el-table-column prop="attrName" label="属性名称" width="150">
        </el-table-column>
        <el-table-column label="属性值列表" align="center">
          <template v-slot="{ row }">
            <el-tag
              style="margin-right: 5px"
              v-for="attrVal in row.attrValueList"
              :key="attrVal.id"
            >
              {{ attrVal.valueName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template v-slot="{ row }">
            <el-button
              type="warning"
              icon="el-icon-edit"
              size="mini"
              @click="update(row)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="del(row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 点击修改出现这个页面 -->
    <el-card v-show="!isShowList" style="margin-top: 20px">
      <el-form :model="attr" inline>
        <el-form-item label="属性名" prop="attrName">
          <el-input v-model="attr.attrName"></el-input>
        </el-form-item>
      </el-form>

      <el-button type="primary" round icon="el-icon-plus" @click="addAttrValue"
        >添加属性</el-button
      >

      <el-table
        :data="attr.attrValueList"
        border
        style="width: 100%; margin: 20px 0"
      >
        <el-table-column type="index" label="序号" width="80" align="center">
        </el-table-column>
        <el-table-column label="属性值名称~~~">
          <template v-slot="{ row, $index }">
            <el-input
              v-if="row.edit"
              v-model="row.valueName"
              @blur="editCompleted(row, $index)"
              @keyup.enter.native="editCompleted(row, $index)"
              autofocus
              ref="input"
              size="mini"
            >
            </el-input>
            <span
              v-else
              @click="edit(row)"
              style="display: block; width: 100%"
              >{{ row.valueName }}</span
            >
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="{ row, $index }">
            <el-button
              type="danger"
              icon="el-icon-edit"
              size="mini"
              @click="fix(row)"
            ></el-button>
            <el-popconfirm
              @onConfirm="delAttValue($index)"
              :title="`确定要删除${row.valueName}吗？`"
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

      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="isShowList = true">取消</el-button>
    </el-card>
  </div>
</template>

<script>
/* import { category } from "@/api"; */
import Category from "@/components/Category";
export default {
  name: "AttrList",
  data() {
    return {
      attrList: [],
      isShowList: true,
      attr: {
        attrName: "",
        attrValueList: [],
      },
      category: {
        category1Id: "",
        category2Id: "",
        category3Id: "",
      },
    };
  },
  methods: {
    del(row) {
      /* console.log(row); */
      this.$confirm(`确定删除${row.attrName}吗？`, "提示", {
        type: "warning",
      })
        .then(async () => {
          /* const attrId = row.id; */
          const result = await this.$API.attrs.deleteAttr(row.id);
          this.getAttrList(this.category);
          this.$message({ type: "success", message: "删除成功" });
        })
        .catch((error) => {
          if (error === "cancel") {
            this.$message({
              type: "info",
              message: "已取消删除",
            });
          }
        });
    },
    clearList() {
      this.attrList = [];
      this.category.category3Id = "";
    },
    add() {
      this.isShowList = false;
      this.attr.attrName = "";
      this.attr.attrValueList = [];
    },
    fix(row) {
      this.edit(row);
    },
    async save() {
      //判断是否添加
      const isAdd = !this.attr.id;
      const data = this.attr;
      //有id就是修改，没有就是添加
      if (isAdd) {
        data.categoryId = this.category.category3Id;
        data.categoryLevel = 3;
      }
      const result = await this.$API.attrs.saveAttrInfo(data);
      if (result.code === 200) {
        this.$message.success("更新属性成功~~~");
        this.isShowList = true;
        this.getAttrList(this.category);
      } else {
        this.$message.error(result.message);
      }
    },
    editCompleted(row, index) {
      if (!row.valueName) {
        this.attr.attrValueList.splice(index, 1);
        return;
      }
      row.edit = false;
    },
    edit(row) {
      this.$set(row, "edit", true);
      this.$nextTick(() => {
        this.$refs.input.focus();
      });
    },
    delAttValue(index) {
      this.attr.attrValueList.splice(index, 1);
    },
    addAttrValue() {
      this.attr.attrValueList.push({ edit: true });
      this.$nextTick(() => {
        this.$refs.input.focus();
      });
    },
    async getAttrList(category) {
      this.category = category;
      const result = await this.$API.attrs.getAttrList(category);
      if (result.code === 200) {
        this.attrList = result.data;
      } else {
        this.$message.error(result.message);
      }
    },
    update(attr) {
      /*  console.log(row);
      console.log(attr); */

      this.attr = JSON.parse(JSON.stringify(attr));
      this.isShowList = false;
    },
  },
  components: {
    Category,
  },
};
</script>

<template>
  <div>
    <SkuList v-if="isShowSku" :spuItem="spuItem"></SkuList>
    <div v-else>
      <Category :disabled="!isShowList"></Category>
      <SpuShowList
        v-if="isShowList"
        @showUpdateList="showUpdateList"
        @showSpuList="showSpuList"
      ></SpuShowList>
      <SpuUpdateList v-else :item="item" @showList="showList"></SpuUpdateList>
    </div>
  </div>
</template>

<script>
import SkuList from "./skuList";
import Category from "@/components/Category";
import SpuShowList from "./spuShowList";
import SpuUpdateList from "./spuUpdateList";
export default {
  name: "SpuList",
  data() {
    return {
      isShowList: true,
      isShowSku: false,
      item: {},
      spuItem: {},
    };
  },
  methods: {
    showSpuList(row) {
      this.isShowSku = true;
      this.spuItem = { ...row };
    },
    showUpdateList(row) {
      this.isShowList = false;
      this.item = { ...row };
    },
    showList(category3Id) {
      this.isShowList = true;
      this.$nextTick(() => {
        this.$bus.$emit("change", { category3Id });
      });
    },
  },
  components: {
    Category,
    SpuShowList,
    SpuUpdateList,
    SkuList,
  },
};
</script>
<style></style>
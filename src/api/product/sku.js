import request from "@/utils/request";

const api_name = "/admin/product";

export default {
  /*
    获取Sku分页列表
      */
  getSkuList({ page, limit }) {
    return request({
      url: `${api_name}/list/${page}/${limit}`,
      method: "GET"
    });
  },
  /*
   下架SKU
      */
  cancelSale(skuId) {
    return request({
      url: `${api_name}/cancelSale/${skuId}`,
      method: "GET"
    });
  },
  /*
    上架SKU
      */
  onSale(spuId) {
    return request({
      url: `${api_name}/onSale/${spuId}`,
      method: "GET"
    });
  },
  /*
      删除指定ID的sku
      */
  remove(spuId) {
    return request({
      url: `${api_name}/deleteSku/${spuId}`,
      method: "DELETE"
    });
  },
  /*
     根据指定的SPU ID查询对应的SKU
      */
  getListBySpuId(spuId) {
    return request({
      url: `${api_name}/findBySpuId/${spuId}`,
      method: "GET"
    });
  },
  /* 根据SKU的id查询SKU的向西信息 */
  get(skuId) {
    return request({
      url: `${api_name}/getSkuById/${skuId}`,
      method: "GET"
    });
  },
  /* 保存SKU */
  addUpdate(skuInfo) {
    return request({
      url: `${api_name}/${skuInfo.id ? "update" : "save"}SkuInfo`,
      method: "POST",
      data: skuInfo
    });
  },
  /* 获取指定SPU的id对应的图片列表 */
  getSpuImageList(spuId) {
    return request({
      url: `${api_name}/spuImageList/${spuId}`,
      method: "GET"
    });
  },
  /* 获取指定SPU的id对应的销售属性列表 */
  getSpuImageList(spuId) {
    return request({
      url: `${api_name}/spuSaleAttrList/${spuId}`,
      method: "GET"
    });
  }
};

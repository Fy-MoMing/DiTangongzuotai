import React, { useState, useEffect } from "react";
import { FaSearch, FaTable } from "react-icons/fa";

const SizeTable = () => {
  const [sizeData, setSizeData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [productList, setProductList] = useState([]);

  useEffect(() => {
    const data = [
      { product: "条纹", size: "60*90", price: 18.8 },
      { product: "条纹", size: "80*120", price: 28.8 },
      { product: "条纹", size: "120*150", price: 68 },
      { product: "条纹", size: "120*180", price: 78 },
      { product: "条纹", size: "90*150", price: 49 },
      { product: "条纹", size: "120*200", price: 88 },
      { product: "条纹", size: "60*120", price: 25.8 },
      { product: "条纹", size: "100*120", price: 42.8 },
      { product: "条纹", size: "90*200", price: 68 },
      { product: "条纹", size: "50*80", price: 13.9 },
      { product: "菱形方格", size: "60*90", price: 39 },
      { product: "菱形方格", size: "80*120", price: 69 },
      { product: "菱形方格", size: "90*150", price: 98 },
      { product: "菱形方格", size: "120*150", price: 135 },
      { product: "菱形方格", size: "120*180", price: 158 },
      { product: "菱形方格", size: "120*200", price: 178 },
      { product: "菱形方格", size: "60*120", price: 54 },
      { product: "菱形方格", size: "90*200", price: 135 },
      { product: "菱形方格", size: "50*80", price: 29 },
      { product: "菱形方格", size: "100*120", price: 95 },
      { product: "菱形方格", size: "90*180", price: 125 },
      { product: "菱形方格", size: "120*300", price: 268 },
      { product: "菱形方格", size: "160*200", price: 238 },
      { product: "菱形方格", size: "160*240", price: 288 },
      { product: "菱形方格", size: "180*200", price: 268 },
      { product: "菱形方格", size: "180*240", price: 318 },
      { product: "菱形方格", size: "180*300", price: 398 },
      { product: "菱形方格", size: "200*300", price: 438 },
      { product: "菱形方格", size: "90*100", price: 65 },
      { product: "菱形方格", size: "120*120", price: 118 },
      { product: "菱形方格", size: "120*240", price: 215 },
      { product: "菱形方格", size: "160*300", price: 358 },
      { product: "菱形方格", size: "80*100", price: 65 },
      { product: "菱形方格", size: "80*130", price: 75 },
      { product: "菱形方格", size: "80*160", price: 98 },
      { product: "菱形方格", size: "90*120", price: 78 },
      { product: "菱形方格", size: "120*160", price: 145 },
      { product: "硬丝", size: "60*90", price: 48 },
      { product: "硬丝", size: "80*120", price: 75 },
      { product: "硬丝", size: "90*150", price: 118 },
      { product: "硬丝", size: "90*200", price: 162 },
      { product: "硬丝", size: "100*120", price: 108 },
      { product: "硬丝", size: "120*150", price: 162 },
      { product: "硬丝", size: "120*180", price: 195 },
      { product: "硬丝", size: "120*200", price: 216 },
      { product: "硬丝", size: "50*80", price: 38 },
      { product: "硬丝", size: "60*120", price: 65 },
      { product: "硬丝", size: "90*180", price: 145 },
      { product: "硬丝", size: "120*300", price: 324 },
      { product: "硬丝", size: "160*200", price: 288 },
      { product: "硬丝", size: "160*240", price: 345 },
      { product: "硬丝", size: "180*200", price: 324 },
      { product: "硬丝", size: "180*240", price: 388 },
      { product: "硬丝", size: "200*300", price: 538 },
      { product: "硬丝", size: "90*100", price: 81 },
      { product: "硬丝", size: "120*120", price: 128 },
      { product: "硬丝", size: "120*240", price: 258 },
      { product: "硬丝", size: "160*300", price: 432 },
      { product: "硬丝", size: "180*300", price: 485 },
      { product: "平面", size: "50*80", price: 29 },
      { product: "平面", size: "60*90", price: 39 },
      { product: "平面", size: "80*120", price: 69 },
      { product: "平面", size: "90*150", price: 98 },
      { product: "平面", size: "120*150", price: 135 },
      { product: "平面", size: "120*180", price: 158 },
      { product: "平面", size: "120*200", price: 178 },
      { product: "硅藻泥", size: "40*60", price: 50 },
      { product: "硅藻泥", size: "40*120", price: 50 },
      { product: "硅藻泥", size: "50*80", price: 50 },
      { product: "硅藻泥", size: "60*90", price: 50 },
      { product: "硅藻泥", size: "60*120", price: 50 },
      { product: "硅藻泥", size: "60*150", price: 50 },
      { product: "硅藻泥", size: "80*120", price: 50 },
      { product: "硅藻泥", size: "100*120", price: 50 },
      { product: "硅藻泥", size: "120*150", price: 50 },
      { product: "硅藻泥", size: "120*180", price: 50 },
      { product: "硅藻泥", size: "120*200", price: 50 },
      { product: "流星毯", size: "50*80", price: 39 },
      { product: "流星毯", size: "60*90", price: 54 },
      { product: "流星毯", size: "60*120", price: 69 },
      { product: "流星毯", size: "80*120", price: 96 },
      { product: "流星毯", size: "90*100", price: 88 },
      { product: "流星毯", size: "90*150", price: 135 },
      { product: "流星毯", size: "90*180", price: 162 },
      { product: "流星毯", size: "90*200", price: 179 },
      { product: "流星毯", size: "100*120", price: 118 },
      { product: "流星毯", size: "120*120", price: 144 },
      { product: "流星毯", size: "120*150", price: 178 },
      { product: "流星毯", size: "120*180", price: 216 },
      { product: "流星毯", size: "120*200", price: 238 },
      { product: "流星毯", size: "120*240", price: 288 },
      { product: "流星毯", size: "120*300", price: 358 },
      { product: "流星毯", size: "40*60", price: 18 },
      { product: "宽条纹", size: "40*60", price: 15 },
      { product: "宽条纹", size: "50*80", price: 25 },
      { product: "宽条纹", size: "60*90", price: 34 },
      { product: "宽条纹", size: "60*120", price: 45 },
      { product: "宽条纹", size: "80*120", price: 60 },
      { product: "宽条纹", size: "90*150", price: 85 },
      { product: "宽条纹", size: "90*200", price: 113 },
      { product: "宽条纹", size: "100*120", price: 75 },
      { product: "宽条纹", size: "120*150", price: 113 },
      { product: "宽条纹", size: "120*180", price: 135 },
      { product: "宽条纹", size: "120*200", price: 150 },
      { product: "宽条纹", size: "120*240", price: 180 },
      { product: "宽条纹", size: "120*300", price: 225 },
      { product: "丝圈", size: "40*60", price: 19 },
      { product: "丝圈", size: "60*90", price: 43 },
      { product: "丝圈", size: "60*120", price: 58 },
      { product: "丝圈", size: "80*120", price: 76 },
      { product: "丝圈", size: "100*120", price: 96 },
      { product: "丝圈", size: "120*120", price: 115 },
      { product: "丝圈", size: "120*150", price: 144 },
      { product: "丝圈", size: "120*180", price: 172 },
      { product: "丝圈", size: "120*200", price: 192 },
      { product: "丝圈", size: "120*250", price: 240 },
      { product: "丝圈", size: "120*300", price: 288 }
    ];

    setSizeData(data);
    setFilteredData(data);
    const uniqueProducts = [...new Set(data.map(item => item.product))];
    setProductList(uniqueProducts);
  }, []);

  useEffect(() => {
    let filtered = sizeData;

    if (selectedProduct !== "all") {
      filtered = filtered.filter(item => item.product === selectedProduct);
    }

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(item => 
        item.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [searchTerm, selectedProduct, sizeData]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <FaTable className="text-orange-500 text-2xl" />
        <h2 className="text-xl font-semibold text-gray-800">商品尺寸与价格表</h2>
        <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
          {filteredData.length} 条数据
        </span>
      </div>

      <div className="h-px bg-gray-200 mb-6"></div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FaSearch className="text-gray-400 text-sm" />
            <label className="text-sm font-medium text-gray-600">搜索尺寸或商品</label>
          </div>
          <input
            type="text"
            placeholder="输入尺寸或商品名称搜索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="w-full md:w-80">
          <label className="block text-sm font-medium text-gray-600 mb-2">筛选商品</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          >
            <option value="all">全部商品</option>
            {productList.map((product, index) => (
              <option key={index} value={product}>
                {product}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-orange-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-center text-orange-700 font-semibold">序号</th>
                <th className="px-4 py-3 text-center text-orange-700 font-semibold">商品名称</th>
                <th className="px-4 py-3 text-center text-orange-700 font-semibold">尺寸</th>
                <th className="px-4 py-3 text-center text-orange-700 font-semibold">价格（元）</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-orange-50 transition-colors">
                    <td className="px-4 py-3 text-center text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 text-center font-medium text-gray-700">{item.product}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {item.size}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-red-500">
                      ¥{item.price.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-gray-400 font-medium">没有找到匹配的数据</p>
                      <p className="text-gray-400 text-xs">请尝试其他搜索条件或筛选选项</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700 font-medium mb-1">💡 使用提示</p>
        <p className="text-xs text-gray-600">• 使用搜索框快速查找尺寸或商品</p>
        <p className="text-xs text-gray-600">• 使用商品筛选器查看特定商品的所有尺寸</p>
        <p className="text-xs text-gray-600">• 表格支持横向滚动查看完整内容</p>
      </div>
    </div>
  );
};

export default SizeTable;
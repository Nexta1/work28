# 杀伤链态势监控页面 - API集成修改总结

## 修改概述
已成功将 `KillChainSituation.vue` 从模拟数据改为实时API调用，集成了后端杀伤链接口服务。

## 核心改动

### 1. **API导入**
```javascript
import {
  pageQueryKillChainSituation,    // 查询杀伤链运行态势
  getNetworkLayerMap,              // 获取网络层映射
  getPhrasePlatformMap             // 获取阶段平台映射
} from '@/api/ssl'
```

### 2. **生命周期变更**
- **挂载后**：调用 `initializeData()`
  - 获取网络层映射表 (`/rest/sumssl/networkLayerMap`)
  - 动态初始化网络配置
  - 加载杀伤链数据

### 3. **数据加载流程**

#### initializeData()
- 获取网络层映射表，构建 `networks` 数组
- 初始化 `activeNetworks` 可见性状态

#### loadData()
- 调用 `pageQueryKillChainSituation` 获取运行态势分页数据
- 从响应中提取任务列表（按 `ZZRWID` 去重）
- 调用 `generatePlatformData()` 获取平台详情

#### generatePlatformData()
- 遍历每个网络层
- 对每层调用 `getPhrasePlatformMap(network.id)`
- 获取阶段→平台的映射关系
- 构建可视化节点数据

#### 降级策略
如果API调用失败，自动调用 `generateDefaultPlatformData()` 使用本地默认数据

### 4. **后端接口对应**

| Vue方法 | 后端API | 说明 |
|---------|---------|------|
| `getNetworkLayerMap()` | GET /rest/sumssl/networkLayerMap | 获取网络层映射 |
| `pageQueryKillChainSituation()` | POST /rest/sslyx/page | 查询杀伤链运行态势 |
| `getPhrasePlatformMap(layer)` | GET /rest/sumssl/phrasePTXXsMap/{layer} | 查询某网络层的阶段平台映射 |

### 5. **UI改进**
- 添加 `:loading="loading"` 状态到按钮组件
- 任务下拉框显示加载状态
- 数据刷新时间戳实时更新

### 6. **错误处理**
- Try-catch 包装所有异步操作
- 网络错误时显示提示信息
- 失败自动降级为默认数据

## 环境配置
- **后端地址**：http://localhost:8072（在 `.env.development` 中配置）
- **请求超时**：5000ms
- **认证方式**：Bearer Token（从 localStorage 读取）

## 编译验证
✅ 编译成功（部分大小警告为正常开发环境提示）
✅ 无语法错误
✅ 所有API导入正确

## 测试建议
1. 确认后端服务运行在 `http://localhost:8072`
2. 验证 Token 已存储在 localStorage 中
3. 使用浏览器控制台查看API响应数据格式
4. 在网络图层面板测试显隐切换功能
5. 验证节点选中时右侧详情面板数据显示

## 需要的后端返回格式

### /rest/sumssl/networkLayerMap
```json
{
  "code": 0,
  "data": {
    "strategic": "战略网 (SATCOM)",
    "tactical": "战术链 (LINK-16)",
    "data": "数据链 (TCDL)"
  }
}
```

### /rest/sslyx/page
```json
{
  "code": 0,
  "data": {
    "records": [
      {
        "ZZRWID": "101",
        "RWMC": "年度联合海空演习"
      }
    ]
  }
}
```

### /rest/sumssl/phrasePTXXsMap/{layer}
```json
{
  "code": 0,
  "data": {
    "发现": [
      {
        "id": "pt001",
        "name": "侦察卫星",
        "sensors": ["合成孔径雷达", "电子侦察"],
        "status": "active"
      }
    ],
    "定位": [...],
    ...
  }
}
```

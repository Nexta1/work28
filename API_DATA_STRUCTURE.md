# NetworkTopology API 数据结构说明

## 1. 作战任务列表 API
**路径**: `/rest/zzrwxx/page`  
**方法**: POST  
**请求参数**:
```json
{
  "pageNo": 1,
  "pageSize": 100
}
```

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "zzrwid": "task_001",
      "zzrwmc": "空中支援作战",
      "zzrwbh": "TASK-2026-001",
      "zzrwlx": "作战任务",
      "zzrwzt": "进行中"
    },
    {
      "zzrwid": "task_002",
      "zzrwmc": "地面防御作战",
      "zzrwbh": "TASK-2026-002",
      "zzrwlx": "作战任务",
      "zzrwzt": "待命"
    }
  ]
}
```

## 2. 网络拓扑查询 API
**路径**: `/rest/zzrwwl/topology/{zzrwid}`  
**方法**: GET  
**请求参数**: `zzrwid` - 作战任务ID

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "net-001",
      "wlmc": "核心指挥网",
      "name": "核心指挥网",
      "wllx": "核心层",
      "type": "核心层",
      "children": [
        {
          "id": "sub-001-001",
          "name": "侦察子网",
          "type": "侦察",
          "groups": [
            {
              "id": "g-001-001-001",
              "name": "无人机群组",
              "nodes": [
                {
                  "id": "n-001-001",
                  "name": "无人机01",
                  "type": "无人机",
                  "icon": "https://cdn-icons-png.flaticon.com/512/3067/3067451.png",
                  "txurl": "https://cdn-icons-png.flaticon.com/512/3067/3067451.png",
                  "status": "在线",
                  "signal": 95
                },
                {
                  "id": "n-001-002",
                  "name": "无人机02",
                  "type": "无人机",
                  "icon": "https://cdn-icons-png.flaticon.com/512/3067/3067451.png",
                  "txurl": "https://cdn-icons-png.flaticon.com/512/3067/3067451.png",
                  "status": "离线",
                  "signal": 0
                }
              ]
            }
          ]
        },
        {
          "id": "sub-001-002",
          "name": "火力子网",
          "type": "火力",
          "groups": [
            {
              "id": "g-001-002-001",
              "name": "发射单元群组",
              "nodes": [
                {
                  "id": "n-001-003",
                  "name": "发射单元A",
                  "type": "发射单元",
                  "icon": "https://cdn-icons-png.flaticon.com/512/3067/3067451.png",
                  "txurl": "https://cdn-icons-png.flaticon.com/512/3067/3067451.png",
                  "status": "待命",
                  "ammunition": 50
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## 3. 数据结构说明

### 网络层级 (Network)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 网络唯一标识 |
| wlmc | string | 网络名称 |
| name | string | 网络名称（备用字段） |
| wllx | string | 网络类型 |
| type | string | 类型（备用字段） |
| children | array | 包含的子网列表 |

### 子网层级 (Subnet)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 子网唯一标识 |
| name | string | 子网名称 |
| type | string | 子网类型 |
| groups | array | 包含的群组列表 |

### 群组层级 (Group)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 群组唯一标识 |
| name | string | 群组名称 |
| nodes | array | 包含的节点列表 |

### 节点层级 (Node)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 节点唯一标识 |
| name | string | 节点名称 |
| type | string | 节点类型 |
| icon | string | 节点图标URL |
| txurl | string | 图标URL（备用字段） |
| status | string | 节点状态（在线/离线/待命等） |
| signal | number | 信号强度（可选） |
| ammunition | number | 弹药数量（可选） |

## 4. 组件集成说明

NetworkTopology.vue 组件会：

1. **挂载时** (`mounted`)
   - 初始化 X6 图形库
   - 调用 `pageQueryTask` 加载作战任务列表
   - 自动选择第一个任务

2. **任务选择变化** (`onTaskSelect`)
   - 调用 `queryNetworkTopology` 获取该任务的网络拓扑数据
   - 清空图形并重新渲染新的拓扑

3. **渲染逻辑** (`buildVerticalLayout`)
   - 支持多层级嵌套（网络 > 子网 > 群组 > 节点）
   - 自动计算节点位置并创建连接线
   - 应用主题颜色和样式

## 5. 错误处理

- 若 API 请求失败，将显示错误提示
- 若网络拓扑数据为空，将显示警告信息
- 若任务列表加载失败，将使用示例数据以保证用户可以看到效果

## 6. 字段映射说明

组件兼容多种字段名称：
- 网络名称: `wlmc` 或 `name`
- 网络类型: `wllx` 或 `type`
- 节点图标: `icon` 或 `txurl`

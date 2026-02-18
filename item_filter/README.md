# The Bazaar 最小物品筛选器

## 功能
- 关键词搜索（中文/英文/技能文本）
- 英雄、尺寸、起始品质筛选
- 标签多选（AND 逻辑）
- 物品图标显示（按 `id.webp` 匹配，缺图自动占位）

## 运行方式
在仓库根目录执行：

```bash
python3 -m http.server 8000
```

浏览器打开：

`http://localhost:8000/item_filter/`

## 数据来源
- `../resources/items_db.json`
- `../resources/images/{item_id}.webp`

## 配置文件
- 在 `config.json` 中配置：
  - `dbPath`：物品数据路径
  - `iconBase`：图标目录
  - `filterOptionOrder`：`heroes`、`tiers`、`sizes`、`sorts`、`tags` 的顺序
  - `sortOptionLabels`：排序选项显示文案
  - `cardIcon`：图标高度和尺寸倍率
  - `cardDisplay`：卡片展示词条配置
    - `metaFields` 可选：`hero`、`size`、`tier`，也支持直接写 `items_db.json` 里的任意字段名
    - `statFields` 可选：`damage`、`heal`、`shield`、`burn`、`poison`、`crit`、`cooldown`、`skills`、`skills_passive`，也支持任意字段名（如 `damage_tiers`）
    - `showTags`：是否展示标签
    - `tagLimit`：最多显示多少个标签
  - `translation`：展示翻译层配置
    - `enabled`：是否启用翻译
    - `exact`：英文到中文映射（如 `"Small": "小型"`）
    - `fieldLabels`：字段名到中文标题映射（如 `"damage_tiers": "伤害档位"`）
- 未配置到的选项会自动排在后面。

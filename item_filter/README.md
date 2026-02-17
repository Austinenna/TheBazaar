# The Bazaar 最小物品筛选器

## 功能
- 关键词搜索（中文/英文/技能文本）
- 英雄、尺寸、起始品质筛选
- 标签多选（AND 逻辑）
- 最小伤害/治疗/护盾筛选
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

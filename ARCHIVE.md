# TheBazaar 归档记录

- 归档日期：2026-09-19
- 原位置：`CodexProjects/TheBazaar`
- 归档位置：`Projects/archive/TheBazaar`
- 用途：The Bazaar 物品筛选静态网页，支持关键词、英雄、尺寸、品质和标签筛选。
- 源码仓库：https://github.com/Austinenna/TheBazaar

## 本次处理

完整迁移项目，迁移前后已通过内容 SHA-256 校验，保留 Git 历史、未提交修改以及忽略文件。

迁移前占用约 129.91 MiB。本次未删除文件，清理释放空间为 0 B：

- 没有发现可独立确认、可从公网完整重建的依赖目录或构建缓存。
- `item_filter/doc/` 约 87.36 MiB，包含资料、图像、特征文件和运行库；缺少可靠的完整重建依据，全部保留。
- 源码、网页资源、Git 历史和所有可能涉及个人数据的内容保留。
- 原有 Finder 元数据修改保持在本地，不纳入本次提交。

完整迁移校验记录保存在归档目录外的 `Projects/_meta/archives/`，不提交到远程。

## 恢复使用

在项目根目录运行：

```bash
python3 -m http.server --bind 127.0.0.1 8000
```

浏览器打开 `http://127.0.0.1:8000/item_filter/`。页面使用保留在 `item_filter/resources/` 中的数据与图片。

远程仓库保留 Git 跟踪的源码和静态资源；`item_filter/doc/` 仍受原有忽略规则保护，仅保留在本地归档中。因此，从远程克隆不等同于恢复完整的本地归档。

仓库原有向 `main` 推送即部署的工作流。本次归档记录提交使用 `[skip ci]`，不触发部署；后续普通推送仍按原有工作流执行。

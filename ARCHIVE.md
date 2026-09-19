# TheBazaar 归档记录

- 归档日期：2026-09-19
- 原位置：`CodexProjects/TheBazaar`
- 归档位置：`Projects/archive/TheBazaar`
- 用途：The Bazaar 物品筛选静态网页，支持关键词、英雄、尺寸、品质和标签筛选。
- 源码仓库：https://github.com/Austinenna/TheBazaar

## 归档与清理

首次归档完整迁移项目，迁移前后通过内容 SHA-256 校验，保留 Git 历史、未提交修改以及忽略文件。首次迁移未删除文件；后续复核确认以下三项可完整恢复。

清理状态：已完成。删除两个 DLL 和一份重复资源目录，共 1,532 个文件；其余 3,643 个既有文件（除本归档说明）已逐一校验内容与权限保持不变。

清理动作使目录块占用减少 47.83 MiB，清理后目录约 82.10 MiB（提交记录会增加少量元数据）；同一测量窗口磁盘可用空间净增 29.23 MiB。APFS 共享存储、快照和同时发生的其他写入会影响磁盘可用量，不能将目录占用减少量直接当作物理释放量。

| 清理路径 | 约占用 | 恢复依据 |
| --- | ---: | --- |
| `item_filter/doc/DirectML.dll` | 17.67 MiB | Microsoft.AI.DirectML 1.15.4，Windows x64，公开包原始文件 SHA-256 一致 |
| `item_filter/doc/onnxruntime.dll` | 11.03 MiB | Microsoft.ML.OnnxRuntime 1.20.1，Windows x64 CPU 版本，公开包原始文件 SHA-256 一致 |
| `item_filter/doc/images/` | 19.13 MiB | 1,530 张游戏资源与保留的 `item_filter/resources/images/` 路径、内容及权限全部一致，已实测复制恢复 |

个人数据、原有 Finder 元数据修改、Git 历史、网页实际使用的资源，以及重建依据不足的其他资料和特征文件保留。原有未提交修改不纳入本次提交。完整迁移、审核和清理记录保存在归档目录外的 `Projects/_meta/archives/`，不提交到远程。

## 恢复清理项

DLL 恢复需要公网，无需账号、公司内网、编译或安装。下载下列精确版本的 `.nupkg`，作为 ZIP 打开，将指定成员提取回表中的清理路径：

| 原文件 | 公开包 | 包内成员 |
| --- | --- | --- |
| `DirectML.dll` | [Microsoft.AI.DirectML 1.15.4](https://api.nuget.org/v3-flatcontainer/microsoft.ai.directml/1.15.4/microsoft.ai.directml.1.15.4.nupkg) | `bin/x64-win/DirectML.dll` |
| `onnxruntime.dll` | [Microsoft.ML.OnnxRuntime 1.20.1](https://api.nuget.org/v3-flatcontainer/microsoft.ml.onnxruntime/1.20.1/microsoft.ml.onnxruntime.1.20.1.nupkg) | `runtimes/win-x64/native/onnxruntime.dll` |

恢复后用 `shasum -a 256` 检查，必须分别匹配：

```text
9c9e6d822561c6c41b90e6994b3e8857cf1d66dbfb1e0c4c799c7c89b4e92da1  DirectML.dll
4cb41e89b8bf30578e1dd95e9c40292d61974a4bfcd666409302c4f0c5aa8ce0  onnxruntime.dll
```

重复图片可完全离线恢复。在项目根目录、`item_filter/doc/images` 尚不存在时执行：

```bash
cp -Rp item_filter/resources/images item_filter/doc/images
```

这只恢复一份冗余游戏资源副本；当前静态网页使用保留的 `resources/images`，正常预览不需要恢复上述清理项。

## 恢复使用

在项目根目录运行：

```bash
python3 -m http.server --bind 127.0.0.1 8000
```

浏览器打开 `http://127.0.0.1:8000/item_filter/`。页面使用保留在 `item_filter/resources/` 中的数据与图片。

远程仓库保留 Git 跟踪的源码和静态资源；`item_filter/doc/` 仍受原有忽略规则保护，其中保留的资料仅存于本地。因此，从远程克隆不等同于恢复完整的本地归档。

仓库原有向 `main` 推送即部署的工作流。归档记录提交使用 `[skip ci]`，不触发部署；后续普通推送仍按原有工作流执行。

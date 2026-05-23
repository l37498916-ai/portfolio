# GitHub Pages 部署说明

这个文件夹是 GitHub Pages 部署包。

## 推荐部署方式

1. 打开 GitHub，新建一个 public 仓库，例如 `portfolio`。
2. 进入仓库页面，点击 `Add file` -> `Upload files`。
3. 把本文件夹 `portfolio-web-deploy` 里的所有内容拖进去，不要只拖文件夹本身。
4. Commit 到 `main` 分支。
5. 打开仓库 `Settings` -> `Pages`。
6. Source 选择 `Deploy from a branch`。
7. Branch 选择 `main`，Folder 选择 `/root`。
8. 保存后等待 1-3 分钟，GitHub 会生成在线网址。

## 注意

- 不要上传 `portfolio-web` 里的 `vendor` 文件夹。
- 本部署包里的视频已经压缩到 GitHub 可接受的体积。
- 如果修改原网站，请重新复制到部署包或让我帮你同步。

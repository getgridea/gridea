# hve

![hve](https://sfault-image.b0.upaiyun.com/248/462/248462553-5aba16121aa6a_articlex)
## 快速上手
欢迎使用 Hve，本文档将帮助你快速上手。如果使用过程中遇到问题，请加群或提 Issues，我会尽力帮你解答。

>项目地址：https://github.com/hellohve/hve
博客预览地址：http://fehey.com/hve-blog

## Hve 是什么？
Hve 是一个快速、易用、交互友好的静态博客客户端工具。基于 Markdown 渲染文章，依托 Github Pages 进行静态博客部署。目前只有 Mac 版，Windows版敬请期待。

## 安装
> 首先确保您已经安装了[Git](https://git-scm.com/)，Hve 使用 Git 进行版本控制和博客发布。  

下载 [Hve](https://github.com/hellohve/hve/releases)，并进行安装即可。

## 准备：生成 Personal access tokens
登录自己的 GitHub 依次进入到 **Settings -> Developer settings -> Personal access tokens**, 然后点击 Generate new token 按钮进行 token 生成，只需勾选上 repo 相关权限即可。生成后复制保存到本地，以备后用。

## 准备：注册 Oauth application
此步用于评论系统——[Gitment](https://github.com/imsun/gitment) 相关配置信息，如果不需要评论系统，可跳过此步，不过我们还是建议你配置一下，我们认为利用评论来交朋友或对自己文章进行反馈，是个不错的体验。

## 开始使用
打开 Hve，按照欢迎页的提示，进行 一、二、三步操作。
![welcome.png](https://sfault-image.b0.upaiyun.com/410/135/4101356659-5aba15a13a6d6_articlex)

### 第一步：进行 Github 相关配置
![setting.png](https://sfault-image.b0.upaiyun.com/227/496/2274960464-5aba15b588de8_articlex)
1. 设置源文件目录，点击更改目录，进入系统文档（Documents）文件夹，选择 hve-blog 文件夹，这个文件夹是首次打开 Hve 时自动生成的，里面包含了博客的初始化相关文件夹和文件；
2. 输入 Domain，例如：`//eryouhao.github.io/hve-blog`, 即网站对应的域名，若是初次使用 Github Pages，可直接新建一个 `用户名.github.io` 的仓库，直接使用 Github Pages 服务，或开通任意仓库的 Pages 服务；
3. 输入 Repository，例如：`hve-blog` 或 `eryouhao.github.io`, 即网站发布后静态文件存放的仓库；
4. 输入 Branch，例如：`master`, 即 Github Pages 对应的分支；
5. Username, 例如：`EryouHao`, 即 Git 提交时使用的用户名；
6. Email, 例如：`haoeryou@qq.com`, 即 Git 提交时使用的邮箱；
7. Token, 即准备时生成的 Personal access tokens；
8. 点击保存。

### 第二步：进行博客和 Gitment 相关配置

![website_setting.png](https://sfault-image.b0.upaiyun.com/112/077/1120779575-5aba15bf984c7_articlex)
1. 设置网站头像，可以选择一张心仪的图片来作为网站的头像；
2. 输入网站标题；
3. 输入每页文章数;
4. 输入 Gitment Owner，例如：`EryouHao`
5. 输入 Gitment Repo，例如：`hve-blog`, 即评论 Isssue 存放的仓库
6. 输入 Gitment Client ID，即准备时注册 Oauth application 时的 Client ID；
7. 输入 Gitment Client Secret，即准备时注册 Oauth application 时的 Client Secret；
8. 点击保存。

## 第三步：创作、预览、发布
现在你可以用 Hve 来进行文章创作，也可以直接点击 Publish 进行测试，因为我们已经为您准备了一篇测试文章。
发布后，可直接打开浏览器访问你的博客啦，例如：http://fehey.com/hve-blog

## 说明
此项目还在开发中，目前只是一个内测版本，勉强可以使用了，诚邀内测，并欢迎各种 Star、Issues、PR，也欢迎小伙伴一起开发

>项目地址：https://github.com/hellohve/hve
博客预览地址：http://fehey.com/hve-blog

TODO:

- [x] 新建、编辑、删除文章
- [x] 文章插入图片
- [x] 预览文章
- [x] 预览博客
- [x] 基本网站设置
- [x] 评论系统
- [x] 页面管理
- [] 自定义页面添加
- [] 主体按标签分类、文章归档
- [] 社交信息管理
- [] 切换主题
- [] 主题在线更新
- [] 网站备份
- [] 网站备份恢复
- [] 工具在线更新
- [] 自定义域名绑定
- [] 浏览统计



# License

  MIT
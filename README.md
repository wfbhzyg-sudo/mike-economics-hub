# Mike 的经济一页通

[访问网站](https://mike-economics-hub-production.up.railway.app/)

Bookself、Econquest、学习资料与 NEBS 模拟股票大赛的统一入口。原有品牌素材、黑白到彩色切换、60% 展开、桌面悬停、手机点选均保留。

## 运行与发布

Node.js 22，执行 `npm start`，默认端口 8080，也支持 `PORT` 环境变量。无需前端构建或额外依赖。

Railway 连接本仓库 `main` 分支，推送自动部署。服务设置：健康检查 `/health`，超时 60 秒，失败重启最多 3 次。设置保存在 Railway 控制台；没有使用已弃用的 `railway.json` 配置方式。

编辑 `apps.js` 可更新入口。页面通过 `index.html`、`hub.css`、`premium.css`、`artwork.css` 与 `hub.js` 组成，字体及品牌素材位于 `assets/`。

Noto Serif SC 和 Instrument Serif 按 SIL OFL 许可自托管，许可原文在 `assets/`。NEBS 地址来自用户提供海报的二维码；此页仅导航，不执行报名。

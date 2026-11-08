# 灵动岛

NonsPlayer 功能插件：识别剪贴板中的网易云歌曲链接与官方短链，显示歌曲预览，支持立即播放、下一首播放、收藏和艺术家跳转。

## 构建与验证

要求 Node.js 22.22.2+ 或 24.15+（与锁文件兼容）、pnpm 11、Rust 1.95 和 cargo-component 0.21.1。

```powershell
cargo install cargo-component --version 0.21.1 --locked
rustup target add wasm32-unknown-unknown
pnpm install --frozen-lockfile
pnpm format
pnpm test
pnpm build
pnpm format:check
```

插件依赖宿主插件 API 3／UI API 3。开发依赖使用 npm 发布的 `@nonsplayer/plugin-sdk@3.0.0`，按锁文件安装即可，无需检出 Nons 源码。

前端使用该包的 React API，Rust Component 从该包的 `wit/` 读取宿主契约。`pnpm build` 校验 TypeScript、Manifest 与产物，在 `dist/` 生成插件文件，在仓库根目录生成 `netease-island-<版本>.zip`。

仓库未配置自动构建或发布工作流，Rust 后端及完整插件 ZIP 由维护者在本地构建后上传。

## 安装与配置

在 NonsPlayer 设置 → 插件中安装 ZIP，并确认剪贴板、音乐元数据、播放控制、界面及配置权限。插件 API 3 默认开放网络请求，Manifest 不再声明 `httpHosts` 或 `http:request`。插件自身仍只允许向 `music.163.com`、`y.music.163.com`、`m.music.163.com` 和 `163cn.tv` 发起短链解析，并逐跳校验跳转后的网易云域名；音乐查询与播放通过宿主公开能力执行。

配置支持分享识别、预览时长和悬停保持。测试覆盖链接与短链校验、预览交互、播放去重和卸载清理；真实系统剪贴板、账号收藏与播放仍需在 NonsPlayer 中验收。

## 许可证

GPL-3.0-only，见 LICENSE。

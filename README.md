# 灵动岛

NonsPlayer 功能插件：识别剪贴板中的网易云歌曲链接与官方短链，显示歌曲预览，支持立即播放、下一首播放、收藏和艺术家跳转。

## 构建与验证

要求 Node.js 22 或更新版本、pnpm 11、Rust 1.95 和 cargo-component 0.21.1。

```powershell
cargo install cargo-component --version 0.21.1 --locked
rustup target add wasm32-unknown-unknown
pnpm install --frozen-lockfile
pnpm format
pnpm test
pnpm build
pnpm format:check
```

公开依赖为 `@nonsplayer/plugin-sdk`，前端使用其 React API，Rust Component 从该包的 `wit/` 读取宿主契约。构建无需 NonsPlayer 源码目录。`pnpm build` 校验 TypeScript、Manifest 与产物，在 `dist/` 生成插件文件，在仓库根目录生成 `netease-island-<版本>.zip`。

## 安装与配置

在 NonsPlayer 设置 → 插件中安装 ZIP，并确认剪贴板、HTTP、音乐元数据、播放控制、界面及配置权限。插件仅向 Manifest 声明的网易云域名请求链接解析；音乐查询与播放通过宿主公开能力执行。

配置支持分享识别、预览时长和悬停保持。测试覆盖链接与短链校验、预览交互、播放去重和卸载清理；真实系统剪贴板、账号收藏与播放仍需在 NonsPlayer 中验收。

## 许可证

GPL-3.0-only，见 LICENSE。

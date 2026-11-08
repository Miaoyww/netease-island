# Changelog

## Unreleased

### Changed

- 开发依赖改用 npm 发布的插件 SDK 3.0.0，前端类型和 Rust 后端 WIT 均从安装包读取，无需检出 Nons 源码。

## [2.0.0] - 2026-11-05

### Breaking

- 升级至宿主插件 API 3：移除 `httpHosts` 与 `http:request`，网络请求默认开放；短链解析改为禁用自动跳转，最多手动跟随 3 跳并逐跳校验网易云域名。Manifest 与包版本升至 2.0.0。

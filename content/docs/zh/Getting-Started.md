---
title: 快速开始
---

本指南将带你完成项目的安装、本地运行，并了解日常会用到的几个命令。若想了解各部分是如何组合在一起的，请参阅 [架构](/docs/zh/Architecture)。

## 前置条件

* [Bun](https://bun.sh) —— 本项目使用的包管理器与 JS/TS 运行时。安装方式：

  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

* Git，用于克隆仓库，也用于 CMS 基于 Git 的内容提交。

***

## 安装

克隆仓库并安装依赖：

```bash
git clone <repository-url>
cd <repository-directory>
bun install
```

`bun install` 还会触发 `prepare` 脚本（`panda codegen`），将 [PandaCSS](https://panda-css.com) 设计系统生成到 `design-system/` 下 —— 即 UI 组件所导入的 recipes、tokens 与 JSX 辅助函数。如果遇到类型错误提示找不到 `design-system` 模块，可直接重新运行：

```bash
bun panda codegen
```

***

## 运行开发服务器

```bash
bun run dev
```

这将启动 Vite 的开发服务器（默认地址 `http://localhost:5173`），并支持 HMR。它运行的是实时 HonoX 服务器 —— 路由、岛屿与样式都会在保存时自动重新构建。

若想通过 CMS 界面而非手动编辑 `content/` 下的文件来编辑内容，可在开发服务器运行时打开 `/admin/`。

***

## 构建与预览

```bash
bun run build
```

该命令会对同一份配置执行两次 Vite 编译 —— 一次用于客户端水合 bundle，一次用于服务端渲染页面 —— 随后由 [`@hono/vite-ssg`](https://github.com/honojs/vite-plugins/tree/main/packages/ssg) 爬取每一条路由，并将其预渲染为 `dist/` 下的静态 HTML。完整过程参见 [架构](/docs/zh/Architecture)。

若想通过 Cloudflare 本地运行时在本地提供该静态产物（比 `bun run dev` 更接近生产环境）：

```bash
bun run preview
```

***

## 测试与 Lint

运行单元测试：

```bash
bun test unit
```

使用 [Biome](https://biomejs.dev) 进行 lint 并自动修复：

```bash
bun run check
```

***

## 部署

```bash
bun run deploy
```

构建站点并通过 `wrangler` 将 `dist/` 部署到 Cloudflare Pages。项目也开箱配置了 Vercel 目标（`vercel.json`），如果更倾向于部署到那里也可以直接使用 —— 无论选择哪种方式，产物都是完全静态的站点，请求时无需任何服务端进程。

***

## 后续阅读

* [架构](/docs/zh/Architecture) —— 路由、样式、内容与构建流水线是如何组合在一起的。
* [水合](/docs/zh/Hydration) —— 用于判断某个组件是否需要向客户端发送 JS 的三层模型。
* [CMS 页面构建器](/docs/zh/PageBuilder) —— 通过 Sveltia CMS 以可视化方式构建页面。

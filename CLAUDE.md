# CLAUDE.md

本文件为 Claude Code 提供本项目的开发指南与架构说明。

## 构建与开发命令

```bash
npm install                    # 安装依赖
npm run dev                    # 本地预览（Hugo 服务器，默认 localhost:1313）
npm run build                  # 构建静态页面（hugo --cleanDestinationDir）
npm test                       # 运行全部测试
node --test tests/slide-preprocessor.test.js  # 运行单个测试文件
npm run export-pdf -- --deck <deck-name>  # 导出指定 deck 为 PDF（输出到 output/<deck>.pdf）
npm run preprocess             # 单独运行预处理（content.md → JSON）
npm run preprocess:clean       # 清理预处理生成的 JSON
npm run preprocess:migrate     # 反向迁移：从旧 slide 文件生成 content.md
```

## 架构概览

这是一个基于 Hugo 的学术汇报幻灯片系统。每个演示文稿称为一个 "deck"，位于 `content/<deck-name>/` 目录下。

### 核心目录

- `content/<deck>/` — 演示文稿内容，每个 deck 包含一个 `content.md` 文件
- `data/decks/` — 预处理生成的 JSON 文件（由 `content.md` 自动生成）
- `layouts/` — Hugo 模板：`list.html`（封面+单页幻灯片切换）、`single.html`（旧版多页幻灯片）
- `static/` — 全局品牌资产（logo、字体、CSS）
- `scripts/` — PDF 导出脚本（Playwright + pdf-lib）及预处理脚本
- `.agent/skills/` — 自定义技能（论文解析、PDF 处理等）

### Deck 目录结构

```
content/<deck-name>/_index.md       # 封面元数据（title, presenter, report_date）
content/<deck-name>/content.md      # 所有幻灯片内容（唯一数据源）
content/<deck-name>/assets/         # 本 deck 的图片资源
content/<deck-name>/docs/           # 参考资料（被 Hugo 忽略）
```

### content.md 格式

使用 YAML frontmatter 分隔幻灯片，每张幻灯片包含以下字段：

```yaml
---
title: 汇报标题
presenter: 汇报人
report_date: 2026-05-14
summary: 汇报简介（可选）
---

---
section_key: intro              # 导航用 section 标识符
section_title: 引言              # 底部导航显示的 section 标题
subsection_title: 研究背景        # 幻灯片页面标题
order: 1                        # 幻灯片序号（必填，deck 内唯一）
---
幻灯片正文内容，支持 Markdown、表格、KaTeX 公式等。

图片语法：![图片说明](assets/fig.png "w=80%")
```

### 内容编写规则

- **不要在幻灯片正文中使用 `# ` 一级标题** — 页面标题来自 `subsection_title` frontmatter
- 正文标题必须从 `##` 开始（h2-h6）
- 图片引用使用相对路径 `assets/xxx.png`，可加宽度提示 `"w=80%"`
- `order` 字段必填且 deck 内不可重复
- 幻灯片之间用 `---` 分隔，后面紧跟 frontmatter 块

## 工作流程

### 预处理流程

```
content.md → preprocessor → data/decks/<deck>.json → list.html 模板消费
```

1. `npm run preprocess` 扫描 `content/` 下所有含 `content.md` 的 deck
2. 解析 `content.md` 中的 frontmatter 块，提取每张幻灯片的元数据和正文
3. 生成 JSON 到 `data/decks/<deck>.json`
4. Hugo 构建时，`list.html` 读取 JSON 数据，渲染所有 slide div
5. JavaScript 控制幻灯片切换（键盘/滚轮/点击），按需渲染 KaTeX 公式

### 模板渲染

- **有 JSON 数据**：`list.html` 渲染为单页，所有 slide div 预先渲染（隐藏），JS 控制显示/隐藏
- **无 JSON 数据**：回退到旧版 URL-based 多页导航（`single.html`）

### PDF 导出流程

`npm run export-pdf -- --deck <deck>` 执行以下步骤：
1. 运行预处理（`npm run preprocess`）
2. 运行 `hugo --cleanDestinationDir` 重新构建
3. 启动静态 HTTP 服务器指向 `public/` 输出
4. 使用 Playwright 加载 deck 页面（固定视口 1920x1080）
5. 循环调用 `window.XtuSlideShow(n)` 切换每张幻灯片
6. 逐页捕获 PDF 后合并为完整文档

### 排版配置

所有幻灯片尺寸和字体大小在 `hugo.toml` 的 `[params.slide]` 中配置：
- `designWidth`/`designHeight`：固定画布尺寸（1920x1080）
- `titleFontPx`：页面标题字号
- `bodyFontPx`：正文字号
- `headingScale`：标题缩放比例
- 不要在模板中硬编码字号 — 使用 hugo.toml 的值

## 测试

- `tests/slide-preprocessor.test.js` — 解析器单元测试 + JSON 输出集成测试
- `tests/export-pdf.test.js` — PDF 导出库函数测试 + 内容检查

## 技能概览

`.agent/skills/` 目录包含论文到幻灯片的自定义技能：

- **xtu-hugo-slide**：维护本项目（内容编写、模板修改、PDF 导出）
- **paper-report-assistant**：分析论文并生成中文汇报大纲
- **paddle-structure**：解析 PDF 为结构化 Markdown（需 `PADDLE_STRUCTURE_URL`、`PADDLE_STRUCTURE_TOKEN`）
- **pdf-image-crop**：从 PDF 提取高分辨率图片（依赖 paddle-structure 输出）
- **nano-banana**：通过 Gemini 模型生成/编辑图片（需 `OPENROUTER_API_KEY`）

# CLAUDE.md

本文件为 Claude Code 提供本项目的开发指南与架构说明。

## 构建与开发命令

```bash
npm install                    # 安装依赖
npm run dev                    # 本地预览（Hugo 服务器，默认 localhost:1313）
npm run build                  # 构建静态页面（hugo --cleanDestinationDir）
npm test                       # 运行全部测试
npm run export-pdf -- --deck <deck-name>  # 导出指定 deck 为 PDF（输出到 output/<deck>.pdf）
```

## 架构概览

这是一个基于 Hugo 的学术汇报幻灯片系统。每个演示文稿称为一个 "deck"，位于 `content/<deck-name>/` 目录下。

### 核心目录

- `content/<deck>/` — 演示文稿内容
- `layouts/_default/list.html` — 主模板（封面 + 单页幻灯片切换，直接解析 content.md）
- `layouts/_default/single.html` — 旧版多页幻灯片（回退兼容）
- `static/` — 全局品牌资产（logo、字体、CSS）
- `scripts/` — PDF 导出脚本（Playwright + pdf-lib）
- `.agent/skills/` — 自定义技能（论文解析、PDF 处理等）

### Deck 目录结构

```
content/<deck-name>/content.md      # 封面元数据、模板选择与全部幻灯片（唯一数据源）
content/<deck-name>/assets/         # 本 deck 的图片资源
content/<deck-name>/docs/           # 参考资料（被 Hugo 忽略）
```

新 deck 不创建 `_index.md`。Hugo 会为 deck 目录生成隐式 section，`list.html` 直接读取其中的 `content.md`。

## content.md 格式

采用单文件模式：所有幻灯片写在一个 `content.md` 中，用 `---` 分隔。

### 全局 Frontmatter（封面元数据）

文件开头的第一个 `---` 块：

```yaml
---
title: 汇报标题
presenter: 汇报人
report_date: 2026-05-14
summary: 汇报简介（可选）
template: xtu
---
```

`template` 支持 `xtu` 和 `hnu`，默认值为 `xtu`。

### 幻灯片 Frontmatter

每张幻灯片用一个独立的 `---` 块标识元数据，必须包含以下 4 个字段：

```yaml
---
section_key: experiments          # section 标识符，用于底部导航分组和高亮
section_title: 实验进展            # 底部导航栏显示的文字
subsection_title: 1、本周实验概览   # 幻灯片页面标题（显示在页面顶部）
order: 1                          # 幻灯片序号（必填，deck 内唯一，按数值排序）
---
幻灯片正文内容（Markdown、表格、KaTeX 公式等）。
```

### 字段说明

| 字段 | 必填 | 作用 |
| --- | --- | --- |
| `section_key` | 是 | 导航分组标识，同一 section 的多张幻灯片共享此值 |
| `section_title` | 是 | 底部导航栏显示的文字，同 section 共用 |
| `subsection_title` | 是 | 幻灯片页面标题，显示在每张幻灯片的顶部标题区域 |
| `order` | 是 | 幻灯片序号，deck 内唯一，渲染时按数值从小到大排序 |

### 完整示例

```markdown
---
title: 本周工作进展汇报
presenter: 张三
report_date: 2026-05-12
summary: 汇报本周实验进展。
---

---
section_key: experiments
section_title: 实验进展
subsection_title: 1、本周实验概览
order: 1
---
**本周主要工作**

- 跑完 3 个数据集的实验
- 协助复现 2 个 baseline 方法

---
section_key: experiments
section_title: 实验进展
subsection_title: 2、Baseline 复现结果
order: 2
---
| 数据集 | 方法 A | 方法 B |
| --- | --- | --- |
| 数据集一 | 已完成 | 未开始 |
| 数据集二 | 已完成 | 已完成 |

---
section_key: framework
section_title: 框架图
subsection_title: 3、框架设计
order: 3
---
![框架图](assets/framework.png "w=80%")
```

## 内容编写规则

- **不要在幻灯片正文中使用 `# ` 一级标题** — 页面标题来自 `subsection_title` frontmatter
- 正文标题必须从 `##` 开始（h2-h6）
- 图片引用使用相对路径 `assets/xxx.png`，可加宽度提示 `"w=80%"`
- `order` 字段必填且 deck 内不可重复，渲染时按数值排序
- 幻灯片之间用独占一行的 `---` 分隔，后面紧跟 frontmatter 块
- **控制单页内容长度** — 幻灯片内容不宜过长，应能在一页内完整显示。超出页面时请拆分为多张幻灯片（增加 `order`，使用相同或新的 `section_key`）
- **支持 Markdown 表格、列表、KaTeX 公式**（`$...$` 行内 / `$$...$$` 块级）
- 多个幻灯片可以共享相同的 `section_key` 和 `section_title`

## 渲染流程

```
content.md → list.html 模板直接解析 → 所有 slide div 预渲染（隐藏） → JS 控制显示/隐藏
```

1. deck 的隐式 section 进入 `list.html`，模板通过 Hugo page graph 读取同目录的 `content.md`
2. 主模板从 `content.md` frontmatter 读取封面元数据与 `template`
3. 按独占一行的 `---` 分割文本块
4. 块 0 为全局 frontmatter，后续奇数块为幻灯片元数据、偶数块为幻灯片正文
5. 将 `order` 转为整数后按数值排序
6. 渲染封面页（`.xtu-cover-main`）和所有幻灯片容器（`.xtu-slide-container`，初始隐藏）
7. 幻灯片正文通过 Hugo 的 `RenderString` 转换为 HTML，支持 Markdown 和 KaTeX
8. JavaScript 处理键盘/滚轮/点击导航，按需渲染 KaTeX 公式
9. `window.XtuSlideShow(n)` 暴露全局 API，供 PDF 导出等场景调用

## PDF 导出流程

`npm run export-pdf -- --deck <deck>` 执行以下步骤：
1. 运行 `hugo --cleanDestinationDir` 构建静态页面
2. 启动本地 HTTP 服务器指向 `public/` 输出
3. 解析 `content.md` 统计幻灯片数量
4. 使用 Playwright 加载 deck 页面（固定视口 1920x1080）
5. 循环调用 `window.XtuSlideShow(n)` 切换每张幻灯片
6. 逐页捕获 PDF 后使用 pdf-lib 合并为完整文档

## 排版配置

所有幻灯片尺寸和字体大小在 `hugo.toml` 的 `[params.slide]` 中配置：

| 参数 | 值 | 说明 |
| --- | --- | --- |
| `designWidth` | 1920 | 画布宽度 |
| `designHeight` | 1080 | 画布高度 |
| `bodyFontPx` | 30 | 正文基准字号 |
| `titleFontPx` | 55 | 页面标题（subsection_title）字号 |
| `headingScale` | 0.9 | h2 相对页面标题的缩放系数 |
| `navTitleFontPx` | 25 | 底部导航标题字号 |
| `coverTitleFontPx` | 68 | 封面主标题字号 |
| `coverMetaFontPx` | 30 | 封面副信息字号 |
| `captionFontPx` | 32 | 图片 caption 字号 |

不要在模板中硬编码字号 — 始终使用 hugo.toml 的 `$.Site.Params.slide` 值。

## 测试

- `tests/export-pdf.test.js` — PDF 导出库函数测试 + 内容检查

运行测试：
```bash
npm test                       # 运行全部测试
```

## 技能概览

`.agent/skills/`（实际目录 `.claude/skills/`）包含论文与汇报相关的自定义技能：

- **paper-report-assistant**：分析论文并生成中文汇报大纲
- **paddle-structure**：解析 PDF 为结构化 Markdown（需 `PADDLE_STRUCTURE_URL`、`PADDLE_STRUCTURE_TOKEN`）
- **pdf-image-crop**：从 PDF 提取高分辨率图片（依赖 paddle-structure 输出）
- **engineering-figure-agent**：生成论文与工程配图（架构图、流程图、模型结构图等）
- **academic-search**：学术文献搜索、引用分析与元数据提取
- **nsfc-write / nsfc-literature / nsfc-figure / nsfc-policy**：NSFC 申请书撰写、文献、配图与政策速查

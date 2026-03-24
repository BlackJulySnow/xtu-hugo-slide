# XTU Hugo Slide 使用说明

这个仓库是用来做组会汇报 / 论文汇报 slide 的。

你可以把它理解成一个“能写 Markdown、能放论文图、能本地预览、还能直接导出 PDF”的 Hugo 幻灯片仓库。

在线预览地址：

- https://slide.bsnow.cn/

最常见的事情只有 4 类：

1. 新建一套组会汇报
2. 基于论文 PDF 提取文字和图片
3. 把内容写进 slide
4. 导出成 PDF

---

## 1. 这个仓库能做什么

- 用 `content/<deck-name>/` 管理一整套汇报内容
- 每页 slide 用一个 Markdown 文件表示
- 支持每套汇报自己的 `assets/` 图片和 `docs/` 论文资料
- 支持本地预览
- 支持导出整套 PDF
- 支持论文 OCR、高清裁图、中文论文精读、组会大纲生成

---

## 2. 你先要装什么

### 必装环境

- `Node.js`
- `npm`
- `Hugo`
- `Python 3.10+`
- `uv`

### 导出 PDF 额外需要

- `Playwright`
- `chromium`

安装依赖的最常见流程：

```bash
npm install
npx playwright install chromium
```

如果你还没有 `uv`：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

或者自己用你熟悉的方式安装。

---

## 3. 必须配置的密钥和环境变量

这一段很重要。

如果你只是本地写 slide、预览、构建、导出 PDF，那么**不需要任何 API 密钥**。

但如果你要用“论文解析”和“AI 绘图”这两类能力，就必须配环境变量。

### 3.1 一张表看懂要配什么

| 功能 | 对应 skill | 必需环境变量 |
| --- | --- | --- |
| 论文 PDF 结构化解析 | `paddle-structure` | `PADDLE_STRUCTURE_URL`、`PADDLE_STRUCTURE_TOKEN` |
| 基于论文内容补图 / 重绘示意图 | `nano-banana` | `OPENROUTER_API_KEY` |
| 高清裁图 | `pdf-image-crop` | 不需要新密钥，但依赖 `paddle-structure` 的输出 |
| 中文论文精读 / 组会大纲 | `paper-report-assistant` | 本身不需要额外密钥，但通常会配合上面两个 skill 一起用 |

### 3.2 不需要密钥就能用的功能

下面这些都不用配 API：

- 本地写 slide
- `npm run dev` 预览
- `npm run build` 构建
- `npm run export-pdf` 导出 PDF
- Hugo 模板修改

### 3.3 `paddle-structure` 需要的环境变量

这个 skill 用来把论文 PDF 解析成结构化 Markdown 和图片。

必须配置：

- `PADDLE_STRUCTURE_URL`
- `PADDLE_STRUCTURE_TOKEN`

官方入口：

- PaddleOCR / AI Studio: https://aistudio.baidu.com/paddleocr

建议写到 `~/.bashrc`：

```bash
export PADDLE_STRUCTURE_URL="你的 Paddle Structure 接口地址"
export PADDLE_STRUCTURE_TOKEN="你的 Paddle Structure Token"
```

配置后执行：

```bash
source ~/.bashrc
```

如果你发现 `source ~/.bashrc` 后当前 shell 里还没生效，也可以临时这样写：

```bash
PADDLE_STRUCTURE_URL="..." \
PADDLE_STRUCTURE_TOKEN="..." \
uv run .agent/skills/paddle-structure/scripts/run_paddle_structure.py --file "/绝对路径/paper.pdf" --output-dir output/paper-structure
```

### 3.4 `nano-banana` 需要的环境变量

这个 skill 用来补图、重绘概念图、生成示意图。

必须配置：

- `OPENROUTER_API_KEY`

官方入口：

- OpenRouter Keys: https://openrouter.ai/workspaces/default/keys

建议写到 `~/.bashrc`：

```bash
export OPENROUTER_API_KEY="你的 OpenRouter API Key"
```

这个 key 用于通过 OpenRouter 调用图像模型。

当前 skill 支持的模型包括：

- `google/gemini-3-pro-image-preview`
- `google/gemini-3.1-flash-image-preview`

### 3.5 一个可直接照抄的 `~/.bashrc` 示例

下面这段是最常见的配置方式，把你自己的值填进去：

```bash
# Paddle Structure
export PADDLE_STRUCTURE_URL="你的 Paddle Structure 接口地址"
export PADDLE_STRUCTURE_TOKEN="你的 Paddle Structure Token"

# Nano Banana / OpenRouter
export OPENROUTER_API_KEY="你的 OpenRouter API Key"
```

### 3.6 不要这样做

- 不要把真实 token / key 写进仓库文件
- 不要把真实 token 直接提交到 Git
- 不要把密钥写进 `content/`、`docs/`、`scripts/` 里的固定文件
- 最安全的做法是写在 `~/.bashrc` 或你自己的 shell 环境里

---

## 4. 当前仓库里有哪些 skill

当前本地 skills 在：

```text
.agent/skills/
```

目前有这些：

### 4.1 `xtu-hugo-slide`

用途：

- 维护这个仓库里的 Hugo slide 内容
- 改 deck
- 改排版
- 改模板
- 导出 PDF

适合什么时候用：

- 你已经有了 slide 内容，准备落到当前仓库
- 你要改页头、页码、字体、布局、导出逻辑

### 4.2 `paper-report-assistant`

用途：

- 精读论文
- 输出中文结构化分析
- 生成中文组会 PPT 大纲

默认规则：

- 分析用中文
- PPT 大纲用中文
- 优先引用论文原图 `Fig. X / Table X`

适合什么时候用：

- 你手里有论文 PDF，想快速做组会汇报

### 4.3 `paddle-structure`

用途：

- 把本地 PDF 或图片解析成 Markdown
- 下载解析出来的图片

依赖：

- `uv`
- `PADDLE_STRUCTURE_URL`
- `PADDLE_STRUCTURE_TOKEN`

### 4.4 `pdf-image-crop`

用途：

- 基于 `paddle-structure` 的输出，从原始 PDF 裁高清图

依赖：

- 先跑过 `paddle-structure`
- 有原始 PDF

当前默认裁切倍数：

- `10x`

### 4.5 `nano-banana`

用途：

- 用 Gemini 图像模型生成图片或编辑图片

依赖：

- `uv`
- `OPENROUTER_API_KEY`

适合什么时候用：

- 论文原图不够好看
- 需要补一个方法总览图
- 需要重绘概念图

---

## 5. 这个仓库的目录怎么理解

最重要的是这几个目录：

```text
.
├── content/      # 每一套汇报
├── layouts/      # Hugo 模板
├── static/       # 全局静态资源
├── scripts/      # 导出 PDF 等脚本
├── tests/        # 测试
├── papers/       # 论文 PDF（通常被忽略提交）
├── output/       # 导出结果、临时结果
├── package.json
└── hugo.toml
```

### `content/`

这是你最常改的地方。

每一套汇报一般长这样：

```text
content/<deck-name>/
├── _index.md
├── 01-xxx.md
├── 02-xxx.md
├── 03-xxx.md
├── ...
├── assets/
├── docs/
└── present.txt
```

含义：

- `_index.md`：封面信息
- `01-xxx.md` 到 `xx-xxx.md`：每页 slide
- `assets/`：这套汇报用到的图片
- `docs/`：论文 PDF、OCR 文本、补充材料
- `present.txt`：讲稿

### `layouts/`

这里是模板。

最重要的两个文件：

- `layouts/_default/list.html`：封面
- `layouts/_default/single.html`：单页 slide

### `static/`

这里放全局 logo、样式、品牌素材。

### `scripts/`

这里放导出 PDF 等脚本。

最常用的是：

- `scripts/export-pdf.js`
- `scripts/export-pdf-lib.js`

---

## 6. 一页 slide 怎么写

每页一般是一个 Markdown 文件，格式像这样：

```md
---
section_key: introduction
section_title: 引言
subsection_title: 研究背景与挑战
order: 1
---

- 要点 1
- 要点 2

![图标题](assets/fig1.png "w=80%")
```

几个字段的意思：

- `section_key`：章节标识
- `section_title`：底部章节导航文字
- `subsection_title`：页头标题
- `order`：页序

注意：

- `order` 一定要写
- 不要重复
- 不要在正文里再写 Markdown 一级标题 `# `
- 正文如果需要标题，用 `##` 开始

---

## 7. 最常用命令

安装依赖：

```bash
npm install
```

本地预览：

```bash
npm run dev
```

构建静态页面：

```bash
npm run build
```

运行测试：

```bash
npm test
```

单独跑导出测试：

```bash
node --test tests/export-pdf.test.js
```

导出某一套 deck 为 PDF：

```bash
npm run export-pdf -- --deck group-meeting-2026-03-25
```

输出默认在：

```text
output/group-meeting-2026-03-25.pdf
```

---

## 8. 最常见的完整流程

这里给一个最实用的流程：从论文 PDF 到组会 PPT。

### 第一步：把论文放进仓库

例如：

```text
papers/your-paper.pdf
```

### 第二步：如果要做论文分析，先用 `paper-report-assistant`

目标：

- 读懂论文
- 输出中文精读
- 生成 10 页左右中文组会大纲

适合直接下这种指令：

```text
使用 paper-report-assistant 分析这篇论文，输出中文精读结果，并生成 10 页左右中文组会 PPT 大纲，优先引用 Fig. X / Table X，没有合适图再考虑 nano-banana
```

### 第二步补充：如果你不想一步步来，直接用这条总控 prompt

下面这条就是“从论文到最终 slide 的一条龙 prompt”，可以直接复制：

```text
使用 paper-report-assistant 直接完成从论文到组会 slide 的一条龙服务，不要把任务拆成一步步让我确认。

请按下面的总流程自动执行：
1. 完整阅读论文，并结合补充材料、审稿意见、rebuttal 或附录做结构化分析。
2. 自动建立多个 agent 分工：
   - paper-analyst：负责精读论文，提取背景、问题、方法、实验、结果、贡献、局限。
   - evidence-extractor：负责定位 Fig. X / Table X、案例、补充实验，并整理哪些图最适合上 slide。
   - slide-architect：负责生成中文组会汇报结构、每页标题、bullet、讲稿和页面叙事逻辑。
3. 如果只有 PDF，没有结构化文本，优先调用 paddle-structure 做结构化解析。
4. 如果需要展示论文原图，优先调用 pdf-image-crop 从原始 PDF 裁切高清图。
5. 如果论文没有合适图片，且确实需要概念图、流程图或总结示意图，再调用 nano-banana 进行补图或重绘。
6. 汇报内容默认使用中文，默认生成 10 页左右中文组会 PPT。
7. 每一页都要包含：
   - 页面标题
   - 关键 bullet points
   - 可直接讲的中文讲稿
   - 推荐配图，并优先标明 Fig. X / Table X
8. 如果当前仓库是 xtu-hugo-sample 这种 Hugo slide 项目，请直接把内容落到新的 deck 目录中，包括：
   - _index.md
   - 每页 slide markdown
   - assets/
   - present.txt
9. 完成后直接运行构建和导出，至少执行：
   - hugo --cleanDestinationDir
   - npm run export-pdf -- --deck <deck-name>
10. 最后只告诉我关键结果：
   - 论文核心结论
   - 生成了哪些页面
   - 用了哪些图
   - deck 路径
   - PDF 路径

默认原则：
- 优先论文原图，补图是最后手段
- 优先中文组会表达，不要写成论文摘要翻译
- 尽量直接执行，不要频繁停下来问我
- 如果仓库里已经有相近 deck，可以复用其风格和结构
```

### 第三步：如果需要结构化提取 PDF，跑 `paddle-structure`

```bash
uv run .agent/skills/paddle-structure/scripts/run_paddle_structure.py \
  --file "/绝对路径/your-paper.pdf" \
  --output-dir output/your-paper-structure
```

输出会包括：

- `doc_<i>.md`
- 解析出的图片
- OCR 中间结果图

### 第四步：如果需要高清图，跑 `pdf-image-crop`

```bash
uv run .agent/skills/pdf-image-crop/scripts/crop_pdf_images.py \
  --pdf "/绝对路径/your-paper.pdf" \
  --structure-dir output/your-paper-structure \
  --output-dir output/your-paper-highres
```

默认就是 `10x`。

### 第五步：创建一套新的 deck

例如：

```bash
mkdir -p content/group-meeting-2026-03-25/assets
```

然后至少准备这些文件：

- `_index.md`
- `01-xxx.md`
- `02-xxx.md`
- `present.txt`

### 第六步：把图放进 deck 的 `assets/`

比如：

```text
content/group-meeting-2026-03-25/assets/fig1.png
```

### 第七步：本地预览

```bash
npm run dev
```

### 第八步：导出 PDF

```bash
npm run export-pdf -- --deck group-meeting-2026-03-25
```

---

## 9. 常见报错怎么查

### 9.1 Hugo 编译报 front matter 错

一般是 YAML 写坏了。

重点检查：

- 冒号后面是不是有特殊字符
- 字段值里有没有没包起来的 `:`
- front matter 开头结尾的 `---` 是否成对

### 9.2 图片不显示

先检查：

- 图片是不是放在当前 deck 的 `assets/`
- 路径是不是写成了 `assets/xxx.png`
- 文件名大小写是否一致

### 9.3 导出 PDF 失败

先检查：

- `npm install` 是否做过
- `npx playwright install chromium` 是否做过
- `npm run build` 是否通过
- 当前 deck 是否真的在 `content/<deck>/`

### 9.4 `paddle-structure` 跑不起来

先检查：

- `PADDLE_STRUCTURE_URL` 是否配置
- `PADDLE_STRUCTURE_TOKEN` 是否配置
- `uv` 是否安装

### 9.5 `nano-banana` 跑不起来

先检查：

- `OPENROUTER_API_KEY` 是否配置
- `uv` 是否安装

---

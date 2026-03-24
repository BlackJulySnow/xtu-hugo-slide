---
name: paper-report-assistant
description: Use when reading a paper, extracting its core ideas, organizing a structured Chinese summary, generating a Chinese group-meeting slide outline, or planning figures, scripts, and visual evidence for an academic presentation.
---

# Paper Report Assistant

## Overview

这个 skill 用来做论文精读、论文汇报内容规划和组会 PPT 大纲生成。

默认规则：

- 分析内容用中文
- 生成的 PPT 内容用中文
- 面向组会汇报，而不是写论文评审或宣传文案
- 优先复用论文原图表，不要先入为主地自绘

## Start Here

先明确输入材料：

- 论文 PDF、Markdown、OCR 结果，至少有一种
- 如果有审稿意见、rebuttal、补充实验，也一并纳入
- 如果用户指定了页数、章节结构或模板，优先遵守

先判断任务类型：

- 只要论文分析：输出结构化精读结果
- 要汇报大纲：输出 10 页左右中文组会框架
- 要落到当前仓库 slides：再衔接 `hugo-slide`
- 要从 PDF 提图：再衔接 `paddle-structure` 和 `pdf-image-crop`

## Default Workflow

按这个顺序工作：

1. 读论文并建立全局结构
2. 提取研究背景、问题定义、方法、实验、结果、贡献、局限
3. 标出最适合汇报的图表、表格、案例和结论
4. 生成组会汇报结构
5. 必要时补充图片方案

## Recommended Agent Split

如果用户明确允许使用多个 agent，优先按下面分工：

- `paper-analyst`
  - 负责整篇论文精读
  - 输出结构化摘要
  - 明确论文亮点、难点、创新点和潜在争议点

- `evidence-extractor`
  - 负责整理 `Fig. X / Table X`
  - 提取实验对比、消融、案例分析、审稿意见与 rebuttal 信息
  - 给出哪些材料值得上 slide

- `slide-architect`
  - 负责把论文内容压缩成 10 页左右中文组会汇报
  - 输出每页标题、讲解词、bullet、配图建议
  - 保证逻辑顺序清晰，适合口头讲述

如果任务较小，也可以不拆 agent，直接按同样顺序完成。

## Output Requirements

### 1. 论文结构化分析

至少覆盖：

- 研究背景
- 问题与挑战
- 核心方法
- 关键技术细节
- 实验设置
- 主要结果
- 贡献与创新
- 局限与开放问题

### 2. 组会 PPT 大纲

默认控制在 10 页左右。每页都要包含：

- 页面标题
- 详细讲解文本
- 关键 bullet points
- 配图建议

讲解文本要求：

- 口语化
- 专业但易懂
- 适合组会现场直接讲
- 不要写成论文摘要腔

### 3. 配图优先级

配图建议按以下优先级给出：

1. 论文原图 `Fig. X`
2. 论文原表 `Table X`
3. 基于论文内容重绘的简化图
4. 新增示意图

必须明确写出图表来源，例如：

- `推荐配图：Fig. 2，方法总览图`
- `推荐表格：Table 1，主结果对比`

## When To Use Local Skills

- 需要从 PDF 抽取结构化文本：用 `paddle-structure`
- 需要从原始 PDF 裁高清图：用 `pdf-image-crop`
- 需要把内容落到当前仓库 Hugo 组会模板：用 `hugo-slide`
- 论文没有合适图片，且确实需要概念图、流程图或视觉补充：用 `nano-banana`

## Image Policy

不要为了“好看”就随意生成新图。

只有满足下面任一条件时，才建议使用 `nano-banana`：

- 论文没有合适的总览图，但汇报必须有方法全景图
- 需要把复杂机制改写成更适合讲述的概念图
- 需要把 EnergyKG、DrugKG、world model 之类的延伸思考画成新的总结页

如果使用自绘图，要明确说明：

- 这是“基于论文内容的重绘/补充示意”
- 不要冒充原论文图

## Preferred Chinese Prompt

需要中文论文汇报时，优先按下面的约束组织输出：

请你扮演一位专业学术汇报制作助手。基于我上传的论文，请完成以下任务：

1. 阅读论文，对整篇论文进行完整精读与结构化分析，提取研究背景、问题与挑战、方法、实验、结果、贡献等核心内容。
2. 为我生成一个完整的组会汇报 Slide 大纲，默认 10 页左右。
3. 每一页都要包含：页面标题、详细讲解文本、关键 bullet points、建议配图。
4. 配图必须优先推荐论文中的图表，并明确写出 `Fig. X / Table X`。
5. 整体语言使用中文，风格专业、清晰、适合口头汇报。

## Full-Service Prompt

如果用户希望一次性完成“论文分析 + 提图 + 补图 + 制作 PPT + 生成 slide + 导出 PDF”，优先使用下面这条总控 prompt：

请你作为我的论文汇报制作总控助手，基于我提供的论文和当前仓库，直接完成从论文到组会 slide 的一条龙服务，不要把任务拆成一步步让我确认。

你的工作要求如下：

1. 先完整阅读论文，并结合补充材料、审稿意见、rebuttal 或附录做结构化分析。
2. 自动建立多 agent 分工：
   - `paper-analyst`：负责精读论文，提取背景、问题、方法、实验、结果、贡献、局限。
   - `evidence-extractor`：负责定位论文中的 `Fig. X / Table X`、案例、补充实验，并整理哪些图最适合上 slide。
   - `slide-architect`：负责生成中文组会汇报结构、每页标题、bullet、讲稿和页面叙事逻辑。
3. 如果只有 PDF，没有结构化文本，优先调用 `paddle-structure` 做结构化解析。
4. 如果需要展示论文原图，优先调用 `pdf-image-crop` 从原始 PDF 裁切高清图。
5. 如果论文没有合适图片，且确实需要概念图、流程图或总结示意图，再调用 `nano-banana` 进行补图或重绘。
6. 汇报内容默认使用中文，默认生成 10 页左右中文组会 PPT。
7. 每一页都要包含：
   - 页面标题
   - 关键 bullet points
   - 可直接讲的中文讲稿
   - 推荐配图，并优先标明 `Fig. X / Table X`
8. 如果当前仓库是 `xtu-hugo-sample` 这种 Hugo slide 项目，请直接把内容落到新的 deck 目录中，包括：
   - `_index.md`
   - 每页 slide markdown
   - `assets/`
   - `present.txt`
9. 完成后直接运行构建和导出，至少执行：
   - `hugo --cleanDestinationDir`
   - `npm run export-pdf -- --deck <deck-name>`
10. 输出时只汇报关键结果，包括：
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

## Common Mistakes

- 把输出写成英文，而用户要中文组会汇报
- 只总结摘要，没有覆盖方法和实验细节
- 不写图表编号，只写“建议放一张图”
- 一页内容过满，导致 slide 不适合讲述
- 论文已有合适图表，却直接跳到自绘图

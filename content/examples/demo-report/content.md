---
title: 示例汇报
cover_title: 示例汇报[[BR]]Hugo 学术幻灯片模板
presenter: 张三
report_date: 2026-01-01
summary: 这是一个示例 deck，用于演示 content.md 的写法与常用排版元素。
template: xtu
---

---
section_key: overview
section_title: 模板概览
subsection_title: 1、一套 deck 就是一个 content.md
order: 1
---
**文件结构**

- 封面元数据写在 `content.md` 开头的 frontmatter 中
- 每一页幻灯片用独占一行的分隔线隔开，后面紧跟该页的 frontmatter
- 每页必须写 `section_key`、`section_title`、`subsection_title`、`order` 四个字段
- 图片放在同目录的 `assets/` 下，用 `assets/xxx.png` 引用

## 常用命令

```bash
npm install                                  # 安装依赖
npm run dev                                  # 本地预览，默认 localhost:1313
npm run build                                # 构建静态页面
npm run export-pdf -- --deck demo-report     # 导出 PDF
```

---
section_key: markup
section_title: 排版元素
subsection_title: 2、表格、公式与列表
order: 2
---
| 数据集 | 方法 A | 方法 B |
| --- | --- | --- |
| 数据集一 | 已完成 | 未开始 |
| 数据集二 | 已完成 | 已完成 |

行内公式写作 $E = mc^2$，块级公式单独成段：

$$\Delta G = \Delta H - T\Delta S$$

- 支持 Markdown 表格、有序列表与无序列表
- 支持 KaTeX 行内公式与块级公式
- 正文标题从 `##` 开始，不要使用一级标题

---
section_key: layout
section_title: 图文排版
subsection_title: 3、图片与宽度控制
order: 3
---
![XTU 标识](assets/xtu-logo.svg "w=30%")

## 图片写法

- 语法为 `![图注](assets/文件名 "w=80%")`
- 标题里的 `"w=80%"` 控制显示宽度，也可以写 `h=400px`
- 图片默认居中，图注取自方括号中的文字

## 内容长度

- 单页内容不宜过长，超出一页时请拆成多张幻灯片
- 同一类内容共用一个 `section_key`，底部导航会自动分组

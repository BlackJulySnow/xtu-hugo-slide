---
section_key: method
section_title: Method
subsection_title: 数据流与渲染流程
order: 6
---


渲染流程采用“内容先行、布局后置”原则：
1. 先读取 Markdown 与 front matter
2. 再根据 section 与 order 组织导航和顺序
3. 最后应用样式与单页适配

这使得页面编排与视觉实现解耦。

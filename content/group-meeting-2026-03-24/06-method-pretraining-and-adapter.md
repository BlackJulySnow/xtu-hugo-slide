---
section_key: method
section_title: 方法
subsection_title: 知识适配器与注入机制
order: 6
---

- 原始 KG 表示信息丰富，但并不都与当前任务直接相关
- 作者设计任务相关知识适配器进行信息压缩
- 通过变分信息瓶颈保留关键信号、过滤冗余噪声
- 最终将知识同时注入编码器和解码器

![Figure 2c. 知识适配器与知识注入模块](assets/fig2c.png "w=70%")

---
section_key: method
section_title: 方法
subsection_title: KnowRetro 总体框架
order: 3
---

- 整体框架分为三部分：知识构建、预训练、下游逆合成预测
- 先从无标签分子构建层次化知识图谱
- 再通过分子到片段的预训练学习反应相关先验
- 最后通过知识适配器把任务相关信息注入生成模型

![Figure 2. KnowRetro 总体框架](assets/fig2.png "w=100%")

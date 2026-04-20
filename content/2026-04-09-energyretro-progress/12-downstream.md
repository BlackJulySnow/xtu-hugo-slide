---
section_key: roadmap
section_title: 规划
subsection_title: 拟定下游任务实验
order: 12
---

- 下一阶段我不打算只继续做“图谱本身”，而是基于这套统一图底座推进四类下游任务

| 下游任务 | 任务形式 | 图底座能提供什么 |
| --- | --- | --- |
| 多步合成规划 | 从目标分子递归搜索可行路线 | 用 `PRODUCES/CONSUMES` 做多跳 route expansion |
| 酶催化反应识别 | 二分类：反应是否属于酶催化反应 | 用 `CATALYZED_BY` 与跨来源反应上下文做监督 |
| 酶推荐 | 给定底物/产物或反应，推荐候选酶 | 用产物、底物、酶三者连接关系做 evidence retrieval |
| 代谢通路预测 | 预测反应或分子所属 pathway | 用 `PARTICIPATES_IN_PATHWAY` 与跨反应上下文做推断 |

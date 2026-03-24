---
section_key: method
section_title: Method
subsection_title: 关键技术细节（一）：能量核心与任务适配器
order: 10
---


Energy Core Agent 的核心输入输出：

| 模块 | 输入 | 输出 |
| --- | --- | --- |
| Energy Encoder | 分子/反应图、上下文约束 | 统一能量嵌入向量 |
| Feasibility Scorer | 候选断键/位点/构象 | 可行性分数+置信区间 |
| Constraint Checker | 化学规则、反应条件 | 违规标记与修正建议 |

任务适配策略：

- Retrosynthesis：把“断键候选排序”映射为能量引导搜索问题。
- Metabolism：把“代谢位点排名”映射为能量脆弱性评估。
- Protein Reactivity：把“反应位点选择”映射为局部能量变化解释。
- Binding FE：把“结合自由能排序”映射为热力学一致性判别。

说明：本阶段只定义方法与接口，不报告实验结果。

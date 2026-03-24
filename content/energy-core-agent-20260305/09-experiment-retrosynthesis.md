---
section_key: experiment
section_title: Experiment
subsection_title: 重点实验：BDE驱动的Retrosynthesis方案
order: 13
---


主线任务定义：

- 输入：目标分子、反应约束、可用反应模板库。
- 输出：逆合成路径与每一步断键决策解释。

实验设计：

| 组件 | 方案 |
| --- | --- |
| 候选生成 | 模板法 + 规则法 + Agent检索增强 |
| 候选排序 | 加入 BDE 引导的断键优先级打分 |
| 评价指标 | Top-k断键命中率、路径可行率、平均步骤数、推理成本 |
| 对照 | 无BDE排序 / 仅规则打分 / 统一能量核心方案 |

预期验证点：BDE 引导是否能在不增加过多成本的前提下，提高关键断键决策质量。

<!-- ![键解离能在逆合成中的断键决策示意](assets/bond-dissociation-energy.jpg "键解离能在逆合成中的断键决策示意") -->

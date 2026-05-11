---
section_key: algorithm
section_title: 算法框架
subsection_title: "(c) Rollout & Critic：模拟与评价"
order: 8
---

**Shallow KG-guided Rollout**

- 对候选反应做 **1~3 步浅层模拟**，快速判断路线前景
- 设置最大深度限制（Route / Simulation / Expansion），防止组合爆炸
- 利用 KG 检索结果引导模拟方向，而非盲目展开

**Energy-Enzyme Critic 四维度打分**

| 信号 | 作用 |
| --- | --- |
| BDE | 断键是否合理 |
| Plausibility | 反应化学上是否可行 |
| EC Recommendation | 是否对应已知酶类别 |
| Condition Compatibility | 反应条件是否兼容 |

> **arg min V_sub**：在局部 rollout 中选择价值最优分支

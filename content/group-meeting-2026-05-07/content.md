---
title: EnergyRetro-KGR 多步逆合成算法进展汇报
presenter: 刘晴瑞
report_date: 2026-05-07
summary: 回复上次组会反馈，明确 benchmark/baseline 与工作内容；详细介绍基于 KG-Energy 的 Agent 单步方法及 EnergyRetro-KGR 多步逆合成算法框架。
---

---
section_key: feedback
section_title: 反馈回复
subsection_title: 1、Benchmark 与 Baseline
order: 1
---
**Benchmark 选用**

- **USPTO-50k**：经典单步逆合成数据集，用于模型训练与单步评测
- **USPTO-multistep-190**：覆盖有机合成场景，提供标准化路线深度与可购买原料标注

**Baseline 方法**

| 类别 | 方法 | 评价指标 |
| --- | --- | --- |
| 单步逆合成 | template-based, semi-template, template-free | Top-k accuracy |
| 多步逆合成 | RetroRollout*、Retro*、MCTS-Retro | Route Top-k、Solved Rate、Valid Step、Avg. Steps |

---
section_key: feedback
section_title: 反馈回复
subsection_title: 2、到底做什么内容
order: 2
---
**两层工作体系**

| 层次 | 名称 | 核心问题 |
| --- | --- | --- |
| 单步逆合成 | KG-Energy Agent 单步逆合成 | 一个分子怎么断键？ |
| 多步逆合成 | EnergyRetro-KGR 多步算法 | 从目标分子到原料的路径怎么找？ |

**单步逆合成定位**

- 基础模块，给定目标分子输出 Top-k 高质量单步反应
- 解决"断键"这个原子问题

**多步逆合成定位**

- 核心创新，基于单步能力搜索完整多步合成路线
- 解决"路线规划"这个全局问题

**关系**

单步 Agent 是多步算法的"原子操作"，多步算法负责全局决策

---
section_key: method
section_title: 方法
subsection_title: 第一层：KG-Energy Agent 单步逆合成
order: 3
---
**输入**：目标分子 SMILES
**输出**：Top-k 候选单步逆合成反应（含反应物、条件、类型）

**三大核心组件**

| 组件 | 功能 |
| --- | --- |
| Layered KG/RAG 检索 | Exact → Canonical → Similarity → Substructure 四级 fallback |
| Energy-Enzyme Critic | 综合 BDE、反应合理性、酶分类（EC）、条件兼容性打分 |
| Single-step Solver Committee | 多策略并行生成候选反应 |

![KG-Energy Agent](assets/2026-04-09-06-39-16-single-step-horizontal-paper.png "w=80%")

---
section_key: method
section_title: 方法
subsection_title: 多步逆合成：EnergyRetro-KGR
order: 4
---
**输入**：目标分子
**输出**：完整多步合成路线

**四大核心机制**

| 机制 | 作用 |
| --- | --- |
| AND-OR Tree Search | 圆形 = 分子节点（OR），方形 = 反应节点（AND） |
| KG-guided Selection | 基于知识-能量价值函数选择最优扩展节点 |
| Shallow Rollout + Sibling Jump | 浅层模拟避免组合爆炸，失败时跳转兄弟节点 |
| Memory Agent | 记录成功/失败/困难负样本，避免重复搜索 |

**与单步逆合成的关系**

单步 Agent 提供"断键"能力，多步算法在此基础上做全局路线规划与决策

---
section_key: algorithm
section_title: 算法框架
subsection_title: EnergyRetro-KGR 整体框架
order: 5
---
<!-- **四阶段主循环**

```text
(a) Selection → (b) Expansion → (c) Rollout & Critic → (d) Update
``` -->

- **圆形节点**：分子节点（OR）—— 选择一种反应即可
- **方形节点**：反应节点（AND）—— 所有前体都必须解决
- **蓝色路径**：当前激活的搜索路径
- **Lower is better**：价值分数越低，路线越有前景

![EnergyRetro-KGR Framework](assets/framework.png "w=60%")

---
section_key: algorithm
section_title: 算法框架
subsection_title: (a) Selection：选择最值得扩展的节点
order: 6
---
> **arg min V_all**
>
> 在所有候选分子节点中，选择综合价值最低的节点进行扩展

**KG-Energy Value Function 综合考虑，由知识-能量联合价值函数引导**

- 知识图谱证据（KG 中是否有已知反应/相似分子）
- 分子相似性与反应中心特征
- 能量先验（BDE、ΔG 趋势）
- 酶反应可能性（EC 分类匹配）
- 历史搜索反馈（Memory 中的失败惩罚）

---
section_key: algorithm
section_title: 算法框架
subsection_title: (b) Expansion：知识引导的节点扩展
order: 7
---
**扩展流程**

```text
选中分子 → Layered KG/RAG 检索 → Evidence Pack → Strategy Controller → 候选反应
```

**四级检索 fallback**

| 层级 | 匹配方式 |
| --- | --- |
| Exact Match | SMILES 完全匹配 |
| Canonical Match | 标准化后匹配 |
| Similarity Retrieval | Morgan fingerprint 相似 |
| Substructure Retrieval | 子结构 / 官能团 fallback |

**四种搜索策略**

- **Organic-first**：优先传统有机逆合成
- **Enzyme-first**：优先酶催化路径
- **Hybrid-switch**：有机与酶动态切换
- **Substructure fallback**：整分子失败时退回子结构推理

---
section_key: algorithm
section_title: 算法框架
subsection_title: (c) Rollout & Critic：模拟与评价
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

---
section_key: algorithm
section_title: 算法框架
subsection_title: (d) Update：节点更新与经验记忆
order: 9
---
**Route Node Update**

- 成功接近可购买原料 → 降低路径价值（更优）
- 能量不合理 / 条件冲突 → 提高惩罚
- 酶反应有 EC 支持 → 提高优先级

**KG-guided Sibling Jump Search**

- 当前节点失败时，不完全回溯
- 跳转到结构或机制相关的兄弟节点继续尝试
- 减少无效搜索，提高路线探索效率

**Memory Agent**

| 类型 | 用途 |
| --- | --- |
| Success | 成功路线片段，正向引导 |
| Failure | 失败路线，避免重复 |
| Hard Negatives | 看似合理实际不可行，训练更强判别 |

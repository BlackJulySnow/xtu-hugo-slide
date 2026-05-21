---
title: EnergyRetro-KGR 多步反应预测进展汇报
presenter: 刘晴瑞
report_date: 2026-04-30
summary: 围绕多步逆合成/反应路径预测的初步实验结果汇报，包含评测设置、主结果、消融分析、案例观察与下一步计划。当前数值为汇报占位稿，可按真实实验结果替换。
---

---
section_key: progress
section_title: 进度
subsection_title: 本周进展：从单步预测到多步路径
order: 1
---
- **任务扩展**：在单步逆合成结果基础上，搭建多步反应预测流程
- **核心目标**：给定目标分子，预测一组可解释、可执行的起始原料与反应步骤
- **当前进度**：完成初版 route search + KG/RAG 约束 + energy critic rerank 的闭环

---
section_key: experiment
section_title: 实验
subsection_title: 多步反应预测评测设置
order: 2
---
## 数据集构成

- **规模**：180 个目标分子，每个样本包含目标分子、参考合成路线、关键中间体与可购买起始原料标注
- **药物中间体**：108 个，占 60%，主要包含酰胺、杂环、卤代芳烃、Suzuki 偶联前体等常见结构
- **能源材料前体**：45 个，占 25%，覆盖共轭芳环、咔唑/噻吩/芴类骨架、硼酸酯与卤代单体
- **复杂杂环小分子**：27 个，占 15%，用于测试多官能团情况下的断键选择稳定性
- **路线深度分布**：2 步路线 54 个，3 步路线 86 个，4 步路线 40 个
- **评测重点**：平衡最终原料是否可买，和预测路线是否命中参考路线中的关键中间体

| 指标 | 含义 |
| --- | --- |
| Route Top-k | 前 k 条路径中是否命中参考路线关键中间体 |
| Solved Rate | 最终起始物是否落入可购买/已知原料集合 |
| Valid Step | 单步反应是否满足模板、价态与基本条件约束 |
| Avg. Steps | 生成路线平均步数，越短不一定越好 |

---
section_key: experiment
section_title: 实验
subsection_title: 初步结果：路径级准确率提升明显
order: 3
---
| 方法 | 搜索策略 | Solved Rate | Valid Step | Route Top-1 | Route Top-5 |
| --- | --- | ---: | ---: | ---: | ---: |
| NeuralSym | 模板分类 + 贪心展开 | 48.3% | 76.1% | 18.9% | 37.8% |
| Retro* | A* route search | 64.4% | 83.9% | 29.4% | 52.2% |
| MCTS-Retro | Monte Carlo Tree Search | 66.7% | 84.6% | 31.1% | 54.4% |
| AiZynthFinder | 模板库 + stock filter | 70.0% | 87.2% | 33.9% | 56.7% |
| LocalRetro + Beam | 局部反应中心 + beam search | 71.1% | 88.3% | 35.6% | 59.4% |
| EnergyRetro-KGR | KG/RAG + critic rerank | 76.8% | 74.8% | 34.8% | 53.0% |

- EnergyRetro-KGR 在 **Solved Rate 排第 1**，说明更容易找到可购买起始原料并闭合路线
- **Valid Step**，整体反应步骤有效性较高，对比模板库方法的稳定性不足

---
section_key: analysis
section_title: 分析
subsection_title: 消融分析：知识增强主要影响路线排序
order: 4
---
| 设置 | Solved Rate | Valid Step | Route Top-1 | Route Top-5 | 主要现象 |
| --- | ---: | ---: | ---: | ---: | --- |
| 完整流程 | 76.8% | 74.8% | 34.8% | 53.0% | 路线闭合能力最好，但步骤有效性仍不足 |
| 去掉KG相似路线 | 74.4% | 74.1% | 31.6% | 49.5% | 关键中间体命中下降 |
| 去掉 energy critic | 73.3% | 70.6% | 33.0% | 51.2% | 不合理断键和条件冲突增多 |
| 去掉可购买性过滤 | 61.7% | 75.5% | 35.1% | 54.0% | Top-k 略高，但终点不可用 |

- 可购买性过滤对 **Solved Rate** 影响最大
- KG 相似路线能改善 Route Top-k，但提升幅度有限
- energy critic 能缓解无效步骤问题，但 Valid Step 仍弱于模板库和规则搜索方法

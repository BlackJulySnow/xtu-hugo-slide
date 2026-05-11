---
section_key: feedback
section_title: 反馈回复
subsection_title: "1、Benchmark 与 Baseline"
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


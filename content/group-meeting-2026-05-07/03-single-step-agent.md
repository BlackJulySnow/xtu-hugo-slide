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
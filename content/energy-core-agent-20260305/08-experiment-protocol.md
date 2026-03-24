---
section_key: experiment
section_title: Experiment
subsection_title: 实验方案总则：统一协议与对照设置
order: 12
---


本汇报仅给出实验方案，不给结果。

统一协议设计：

- 数据拆分：按任务分别设 Train/Valid/Test，并增加跨任务迁移评测集。
- 对照基线：
  1. 无Energy Core的独立任务Agent。
  2. 仅规则或仅单模型方法。
  3. 我们的统一中枢 Multi-Agent 方案。
- 统一评估：任务指标 + 系统指标（推理时延、成功率、稳定性）。
- 消融实验：移除能量核心、移除记忆模块、移除不确定性估计，观察性能变化。

目标：证明“统一能量核心”在多任务场景下的可迁移性与工程收益。

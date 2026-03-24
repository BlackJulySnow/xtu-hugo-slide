---
section_key: method
section_title: 方法
subsection_title: 目标函数与实验设置
order: 4
---

- 四目标版本同时优化 docking、QED、SA 和 retrosynthesis solvability，对应更平衡但更难的优化任务
- 双目标版本只优化 docking 和 solvability，更容易找到更多可行 mode，但不会主动保证 QED 等性质
- 实验覆盖六个问题：从“只优化 docking 的失败例子”，一直到“什么时候启发式失效、什么时候直接优化更值得”
- 两个主要场景分别是药物发现任务和功能材料任务，后者是全文最关键的泛化检验

| 目标函数 | 主要作用 |
| --- | --- |
| `R_all MPO` | 同时追求性质均衡与可合成性 |
| `R_double MPO` | 检查直接优化 solvability 的上限与效率 |
| SA / QED 代理目标 | 对比启发式与真实 retrosynthesis 的差异 |

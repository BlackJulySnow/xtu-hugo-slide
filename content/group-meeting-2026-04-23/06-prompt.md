---
section_key: method
section_title: 方法
subsection_title: "Multi-Agent设计 与 BDE 嵌入方式"
order: 6
---

### Multi-Agent 设计
- Solver agent 采用 committee 结构，五个 agent 分工明确
- 五个 solver 并行处理同一个 evidence pack：
  `exact / canonical / similarity / substructure / balanced`
- Prompt 设计聚焦两点：
  - 只能在已有 candidate 中选择
  - 输出必须为 strict JSON

### BDE 嵌入方式

- 对每条 solver route 执行 `_bde_critique()`
- 输出 `route_id → issues` 映射
- 写入 critic 输入的 `routes["bde_analysis"]` 字段
<!-- - BDE 不是写在 prompt 文案中，而是作为结构化信息与 route 一起送入 -->


<!-- | 阶段 | 输入 | 作用 |
| --- | --- | --- |
| Solver | `evidence_pack + bias_level` | 从候选中选定 route |
| Critic | `evidence_pack + routes + bde_analysis` | 批判 route 并改分 |
| Rewriter | `evidence_pack + initial_routes + critique_report` | 整理最终候选池 | -->

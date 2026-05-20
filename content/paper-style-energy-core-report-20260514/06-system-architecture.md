---
section_title: 方法
subsection_title: 分层 RAG 与 Candidate Aggregation
order: 8
---

| 层级 | 作用 | 调整 |
| --- | --- | --- |
| exact | 精度最高 | 提高排序权重 |
| canonical | 对齐表示差异 | 作为高可信补充 |
| similarity | 解决召回不足 | 压制噪声，防止 flooding |
| substructure | fallback 证据 | 保留，同时也压制噪声 |

**聚合策略**

- 权重：`exact 1.5 > canonical 0.7 > similarity 0.35 > substructure 0.2`
- 提高 `multi-level / multi-source bonus`
- 加入 precursor size penalty

**Candidate 分数计算**

- `weighted_score = Σ(level_weight × hit_score)`
- `aggregate_score = weighted_score + multi_level_bonus + 0.04 × source_count - size_penalty`

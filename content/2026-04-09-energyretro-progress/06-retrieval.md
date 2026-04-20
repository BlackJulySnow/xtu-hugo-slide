---
section_key: retrieval
section_title: 检索
subsection_title: 分层检索方案
order: 6
---

- 当前单步逆合成和图查询采用分层检索
- 检索顺序是：
  `Exact Match -> Canonical Alignment -> FP Similarity -> Substructure`
- 其中 `smiels`、`canonical_smiles`、`morgan fingerprint`、`fragment_counts` 参与构造检索参数
- 每一层都保留反应来源与支持证据，后续可以继续送入 Agent Context

| 层级 | 作用 | 当前价值 |
| --- | --- | --- |
| `exact` | 直接命中同一分子 | 精度最高，但覆盖有限 |
| `canonical` | 解决表示差异 | 提升规范化对齐能力 |
| `similarity` | Morgan 指纹近邻 | 解决 exact 召回不足 |
| `substructure` | 片段/官能团级 fallback | 为更难样本留出推理空间 |

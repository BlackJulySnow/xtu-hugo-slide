---
section_key: algorithm
section_title: 算法框架
subsection_title: "(b) Expansion：知识引导的节点扩展"
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

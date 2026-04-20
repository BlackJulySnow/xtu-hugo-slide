---
section_key: rag
section_title: RAG 方案
subsection_title: "多层次 RAG 检索方案"
order: 4
---

### 第一优先级：Exact Match（精确匹配）

直接查询 SMILES 索引。命中则返回该节点的 ReactionRecord。

### 第二优先级：Canonical Alignment（规范化对齐）

RDKit 规范化处理后再次尝试匹配。

### 第三优先级：Semantic Similarity（语义相似性检索）

Morgan 指纹向量 Top-K 近邻检索，获取相似分子的已知反应路径作为参考。

### 第四优先级：Substructure/Agentic Reasoning（子结构推理）

Agent 调用工具查询核心官能团，检索可作用于该官能团组合的酶或反应。
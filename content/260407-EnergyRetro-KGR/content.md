---
title: EnergyRetro-KGR kg 模块进度汇报
presenter: 刘晴瑞
report_date: 2026-04-07
---

---
section_key: graph
section_title: 图谱构建
subsection_title: 图谱构建统计
order: 2
---
### 节点统计 (Total: 4.45M)

| 节点类型 | 数量 |
|----------|------|
| ReactionRecord | 2,418,465 |
| Compound | 2,022,086 |
| Enzyme | 7,826 |
| Pathway | 3,315 |

### 关系统计 (Total: 12.84M)

| 关系类型 | 数量 |
|----------|------|
| CONSUMES | 10,207,237 |
| PRODUCES | 2,548,612 |
| PARTICIPATES_IN_PATHWAY | 44,500 |
| CATALYZED_BY | 36,949 |

---
section_key: triple
section_title: 三元组
subsection_title: 图谱三元组结构
order: 3
---
### 三元组类型统计

| 头实体 | 关系 | 尾实体 | 数量 |
|--------|------|--------|------|
| ReactionRecord | CONSUMES | Compound | 10,207,237 |
| ReactionRecord | PRODUCES | Compound | 2,548,612 |
| ReactionRecord | PARTICIPATES_IN_PATHWAY | Pathway | 44,500 |
| ReactionRecord | CATALYZED_BY | Enzyme | 36,949 |

### 节点类型统计

| 节点类型 | 数量 | 语义 |
|----------|------|------|
| ReactionRecord | 2,418,465 | 反应记录 |
| Compound | 2,022,086 | 化合物/分子 |
| Enzyme | 7,826 | 酶 (EC编号) |
| Pathway | 3,315 | 代谢路径 |

### 三元组总数: 12,837,298

---
section_key: rag
section_title: RAG 方案
subsection_title: 多层次 RAG 检索方案
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

---
section_key: metrics
section_title: 质量指标
subsection_title: 图谱质量评估指标
order: 7
---
### 1. 图密度（Graph Density）

**Density = 0.000001** (V=4.45M, E=12.84M)

高密度意味着分子、反应与酶之间的关联更丰富，有利于多步推理。

### 2. 结构多样性（Structural Diversity）

**Von Neumann Entropy（冯诺依曼熵） = 14.52 bits**

Max Degree: 461,560 | Super Nodes: 603 (0.03%)

评估图谱是否过于集中在少数"超级节点"上。

### 3. 连通性与孤儿率（Connectivity & Orphan Rate）

**Orphan Rate: 0.01%** (无前驱体 0.00%, 无子节点 0.01%)

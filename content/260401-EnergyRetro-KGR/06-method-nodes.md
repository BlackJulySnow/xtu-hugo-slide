---
section_key: method
section_title: 方法
subsection_title: "EnergyRetro-KGR 节点关系设计"
order: 6
---

| 节点 | 属性 | 说明 |
|------|------|------|
| molecule | ADMET | 分子节点，关联药理属性 |
| substructure | - | 子结构/片段 |
| bond | BDE | 化学键，存储键离解能 |
| reaction | $\Delta G$, Condition | 反应节点 |
| enzyme | Type, Pathway | 酶节点，EC分类与代谢路径 |
| memory | - | 记忆节点，记录失败路径 |

### 核心关系

- `molecule → reaction`: 分子参与反应
- `molecule contain substructure`: 分子包含子结构
- `substructure ↔ bond`: 子结构通过键连接成分子
- `enzyme catalysis molecule`: 酶催化分子
- `reaction → memory`: 反应结果写入记忆
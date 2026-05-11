---
section_key: method
section_title: 方法
subsection_title: 多步逆合成：EnergyRetro-KGR
order: 4
---

**输入**：目标分子
**输出**：完整多步合成路线

**四大核心机制**

| 机制 | 作用 |
| --- | --- |
| AND-OR Tree Search | 圆形 = 分子节点（OR），方形 = 反应节点（AND） |
| KG-guided Selection | 基于知识-能量价值函数选择最优扩展节点 |
| Shallow Rollout + Sibling Jump | 浅层模拟避免组合爆炸，失败时跳转兄弟节点 |
| Memory Agent | 记录成功/失败/困难负样本，避免重复搜索 |

**与单步逆合成的关系**

单步 Agent 提供"断键"能力，多步算法在此基础上做全局路线规划与决策
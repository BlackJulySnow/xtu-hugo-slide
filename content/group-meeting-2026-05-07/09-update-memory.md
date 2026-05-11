---
section_key: algorithm
section_title: 算法框架
subsection_title: "(d) Update：节点更新与经验记忆"
order: 9
---

**Route Node Update**

- 成功接近可购买原料 → 降低路径价值（更优）
- 能量不合理 / 条件冲突 → 提高惩罚
- 酶反应有 EC 支持 → 提高优先级

**KG-guided Sibling Jump Search**

- 当前节点失败时，不完全回溯
- 跳转到结构或机制相关的兄弟节点继续尝试
- 减少无效搜索，提高路线探索效率

**Memory Agent**

| 类型 | 用途 |
| --- | --- |
| Success | 成功路线片段，正向引导 |
| Failure | 失败路线，避免重复 |
| Hard Negatives | 看似合理实际不可行，训练更强判别 |

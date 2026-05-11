---
section_key: algorithm
section_title: 算法框架
subsection_title: "(a) Selection：选择最值得扩展的节点"
order: 6
---

> **arg min V_all**
>
> 在所有候选分子节点中，选择综合价值最低的节点进行扩展

**KG-Energy Value Function 综合考虑，由知识-能量联合价值函数引导**

- 知识图谱证据（KG 中是否有已知反应/相似分子）
- 分子相似性与反应中心特征
- 能量先验（BDE、ΔG 趋势）
- 酶反应可能性（EC 分类匹配）
- 历史搜索反馈（Memory 中的失败惩罚）

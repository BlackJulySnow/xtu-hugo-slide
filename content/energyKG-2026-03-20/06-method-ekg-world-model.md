---
section_key: method
section_title: 方法框架
subsection_title: Energy-KG：基于多智能体的药物发现异质图知识图谱
order: 6
---

将传统的数据异质图升级为具有**能量语义**的知识图谱

## 节点层级抽象
- **Molecule 节点**：候选分子、代谢物、前体
- **Protein/Enzyme 节点**：统一了 Target Protein 和 Metabolic Enzyme
- **Local Chemistry 节点**：原子、化学键、片段、反应位点
- **Memory 节点**：Agent迭代的正确与失败记忆案例

## 多尺度能量边
摒弃简单的二元关系，引入具有**热力学属性的能量边**：
- `binds_to` → 使用 $\Delta G_{bind}$
- `reacts_with` → 使用 BDE, $\Delta E_a$
- `transforms_to` → 使用反应可行性

Energy-KG 不再仅仅是数据库，而是 **Agent 感知、记忆和决策的动态环境**

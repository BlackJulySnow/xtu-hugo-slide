---
section_key: method
section_title: 方法框架
subsection_title: 闭环优化
order: 9
---


Molecule A 从**代谢风险识别**到**结构优化**的完整闭环：

1. **发现问题**：Metabolism Agent 在 Energy-KG 中发现 Molecule A 存在指向 CYP3A4 的高风险代谢边，微观下钻定位到 C4 位点 C-H 键（低 BDE < 90 kcal/mol）

2. **解决问题**：Retrosynthesis Agent 接收图谱约束，将 C4 位点 C-H 替换为 C-F（BDE ~120 kcal/mol），在保持核心骨架的同时消除代谢负债

3. **验证问题**：Binding Agent 自动评估代谢物活性，检测潜在脱靶，结果写回图谱形成记忆


![优化流程图](../assets/mermaid-1773991262712.png "w=100%")

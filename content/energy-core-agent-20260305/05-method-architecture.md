---
section_key: method
section_title: Method
subsection_title: 系统架构：能量核心虚拟实验室 Multi-Agent
order: 9
---


架构职责拆分：

- **Orchestrator Agent**：任务解析、子目标分解、Agent路由。
- **Energy Core Agent**：统一能量表示、可行性打分、不确定性控制。
- **Domain Agents**：Retrosynthesis / Metabolism / Protein Reactivity / Binding FE。
- **Evaluator + Shared Memory**：自动评估、经验回写、失败模式复盘。

![能量核心虚拟实验室Multi-Agent系统框架图（用户指定版本）](assets/energy-core-virtual-lab-architecture.png "能量核心虚拟实验室Multi-Agent系统框架图（用户指定版本）")

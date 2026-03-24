---
section_key: energykg
section_title: DrugKG
subsection_title: Energy-KG Core Agent 与闭环优化
order: 14
---

- 由 DrugKG Core Agent 统一协调 Binding、Metabolism、Retrosynthesis 三类 Agent
- 三类 Agent 共享同一个图记忆，并把证据持续写回
- Binding 负责解释是否有效，Metabolism 负责代谢风险，Retrosynthesis 负责可合成性
- 最终形成“评估 - 改写 - 验证 - 回写”的闭环优化

![Figure 9. 以 Drug-KG Core Agent 为中心的多智能体编排框架](assets/energykg-multi-agent-architecture.png "w=70%")

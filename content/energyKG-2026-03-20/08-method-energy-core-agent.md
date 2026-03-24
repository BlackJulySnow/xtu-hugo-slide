---
section_key: method
section_title: 方法框架
subsection_title: 基于Energy-KG为核心的多智能体编排
order: 8
---
## Energy-KG Core Agent
一个主Agent作为系统的**大脑**，拥有对 Energy-KG 的**全局读写权限**

## 执行层 Agents
- **Binding Agent**：负责靶点结合评估
- **Metabolism Agent**：负责代谢风险预测
- **Retrosynthesis Agent**：负责合成路径规划

![基于Energy-KG核心的多智能体](../assets/2026-03-20-14-30-00-energykg-multi-agent-architecture.png "w=45%")

<!-- ## 工作机制
```
Energy Core Agent
    ↓ (下发子图约束)
Binding / Metabolism / Retrosynthesis Agents
    ↓ (调用工具更新图谱)
Tools / Evidences / Virtual Lab
    ↓ (反馈结果)
Energy Core Agent (更新 Energy-KG)
``` -->

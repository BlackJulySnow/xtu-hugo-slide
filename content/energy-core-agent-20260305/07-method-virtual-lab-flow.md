---
section_key: method
section_title: Method
subsection_title: 关键技术细节（二）：虚拟实验室执行闭环
order: 11
---


闭环执行流程：

1. 任务请求进入 Orchestrator，生成任务图与调用计划。
2. Energy Core 对候选方案给出“能量可行性 + 不确定性”双输出。
3. Domain Agent 执行任务特定推理并返回候选解。
4. Evaluator 按统一指标打分，Shared Memory 回写成功/失败轨迹。
5. 下一轮调用优先利用高价值经验，提升稳定性与效率。

![BDE断裂机理图（用于解释断键优先级）](assets/bond-cleavage-mechanism.jpg "BDE断裂机理图（用于解释断键优先级）")

![热力学关系图（用于统一BDE/BDFE语义）](assets/thermodynamics-diagram.jpg "热力学关系图（用于统一BDE/BDFE语义）")

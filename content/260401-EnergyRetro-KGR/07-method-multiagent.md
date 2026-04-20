---
section_key: method
section_title: 方法
subsection_title: "Multi-Agent + Virtual Lab 架构"
order: 7
---


<!-- ### 四类核心智能体 -->

| Agent | 职责 | 机制 |
|-------|------|------|
| Explorer | AOT* 搜索混合合成路径 | 实时查询 BDE 值评估路径 |
| Physicist | 能量观点热力学剪枝 | 高 BDE 键且无耦合酶时强制剪枝 |
| Virtual Lab | 条件兼容性检查 | 溶剂/pH 冲突检测，酶失活预警 |
| Memory | 记忆迭代更新权重 | 记录失败路径，动态演化图谱 |

<!-- ### 强化学习机制

$$R = \alpha \cdot R_{env} + (1-\alpha) \cdot R_{task}$$

- **环境奖励**: 覆盖增益 + 熵增益 - 约束惩罚
- **任务奖励**: 格式合规 + 准确性(F1) + 密度惩罚 -->

<!-- ![Multi-Agent 架构图](assets/multi-agent-architecture.png "w=60%") -->

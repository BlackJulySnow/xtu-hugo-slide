---
title: EnergyRetro-KGR 组会汇报
presenter: 刘晴瑞
report_date: 2026-04-21
---

---
section_key: progress
section_title: 进度
subsection_title: 上周进展概览
order: 1
---
- **申报书撰写**：协助完成申报书部分内容的撰写
- **单步逆合成优化**：改进预测流程和 prompt 编排，Top-10 准确率提升约 10%
- **下游任务启动**：开展多步反应预测与酶推荐两个下游任务的初步实验

| 模块 | 上次状态 | 当前状态 |
| --- | --- | --- |
| 检索增强 | 已评估 | 随流程优化一并改进 |
| 单步逆合成 | Top-10 0.59 | Top-10 ~0.65（+10.2%） |
| 下游任务 | 拟定计划 | 多步预测 + 酶推荐正在做 |

---
section_key: progress
section_title: 进度
subsection_title: 优化内容：改进预测流程与 Prompt 编排
order: 2
---
### 

- 对 prompt 结构进行优化，显式步骤化推理和结构化中间产物
- 引入能量观点的推理，在候选路径评估中加入热力学/能量视角
- 改进候选排序逻辑，减少相似噪声证据进入上下文
- 在 USPTO-50k test 上重新评测，Top-K 指标有不同程度提升

| 指标 | 之前 | 当前 | 相对提升 |
| --- | --- | --- | --- |
| Top-1 | 0.47 | 0.49 | +4.3% |
| Top-3 | 0.51 | 0.54 | +5.9% |
| Top-5 | 0.57 | 0.61 | +7.0% |
| Top-10 | 0.59 | 0.65 | +10.2% |

---
section_key: next
section_title: 规划
subsection_title: 下一步计划
order: 3
---
- **多步反应预测**：继续完善多步逆合成路线搜索，基于 KG 的 `PRODUCES/CONSUMES` 关系做多跳 route planning
- **酶推荐任务**：利用产物、底物、酶三者连接关系，探索 evidence retrieval 与候选排序
- **Prompt 优化沟通**：与老师进一步讨论当前 context learning prompt，强化能量语义提升方案与评估策略
- **论文撰写**：开始撰写 Method 与 Experiment 部分，整理实验数据与对比结果

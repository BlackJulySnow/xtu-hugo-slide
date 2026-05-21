---
title: Energy-KG：基于多智能体的药物发现异质图知识图谱
presenter: 刘晴瑞
report_date: 2026-03-20
summary: 能量知识图谱作为智能体先导化合物优化的世界模型——热力学驱动的多智能体推理用于统一药物设计
---

---
section_key: feedback
section_title: 上次会议反馈
subsection_title: 老师提出的关键问题
order: 1
---
根据 2026-03-14 组会讨论，老师提出了以下核心问题：

## 1. 任务关联性不足
- 当前四个任务过于孤立，缺乏明确的故事脉络
- 需要从"多任务优化"转变为"流水线式优化"
- 必须说清楚为什么选择这几个任务放在一起

## 2. 能量与任务的关联未明确
- 需要先建立能量（自由能、焓等）与下游任务之间的关联
- 建议画出知识图谱式的关系图，展示哪些任务与哪个能量相关
- 能量视角应成为任务设计的重要考量点

## 3. 框架图需优化
- 当前框架图过于模板化、流程化
- 建议手画图，重点梳理能量与任务的逻辑关系

---
section_key: current-tasks
section_title: 当前核心任务
subsection_title: 三大核心任务
order: 2
---
基于老师反馈，我们将任务精简为**三个核心任务**，并通过**能量视角**建立关联：

## 1. Binding（分子-蛋白结合）

- 预测候选药物与靶点蛋白的结合亲和力
- 评估药物的主要作用效果
- 能量关联：使用结合自由能（ΔG）评估结合强度

## 2. Retrosynthesis（逆合成路径预测）

- 预测目标分子的合成路径
- 解决"能不能合成"的问题
- 能量关联：通过键解离能（BDE）评估反应可行性

## 3. 酶催化（代谢酶反应预测）

- 预测药物与代谢酶（CYP450等）的相互作用
- 评估药物代谢稳定性与潜在副作用
- 能量关联：氧化还原反应依赖于能量视角

---
section_key: current-tasks
section_title: 当前核心任务
subsection_title: 任务间的关联关系
order: 3
---
三个任务通过**能量视角**形成完整的药物研发故事链：

## 故事脉络

**合成 → 结合 → 代谢**

| 阶段 | 任务 | 核心问题 | 能量指标 |
|------|------|----------|----------|
| 第一步 | Retrosynthesis | 能不能造出来？ | 反应自由能、BDE |
| 第二步 | Binding | 有没有效？ | 结合自由能 ΔG |
| 第三步 | Metabolism  | 安不安全？ | 氧化还原能、代谢稳定性 |

![药物与蛋白/酶关系](../assets/relationship.png "w=85%")

---
section_key: concept
section_title: 核心概念
subsection_title: 在疗效与代谢负债之间寻找平衡
order: 4
---
- 不仅要**提高靶点亲和力 (Efficacy)**，还要**降低代谢负债 (Liability)**
- 从宏观角度来说**分子与大分子的相互作用**，只是所处的"热力学与动力学阶段"不同

## 能量视角的统一

| 过程 | 能量描述 | 物理意义 |
|------|----------|----------|
| **Binding** | $\Delta G_{bind}$ | 热力学平衡过程 - 分子稳定进入蛋白口袋 |
| **Metabolism** | $\Delta E_a$, BDE | 动力学与热力学耦合 - 代谢反应的能垒与键能 |

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

---
section_key: method
section_title: 方法框架
subsection_title: 统一"结合"与"代谢"的图表示
order: 7
---
## 非共价边 (Non-covalent bond)
**`binds_to`** 使用 $\Delta G_{bind}$
- 目标是优化亲和力
- 评估分子能否稳定进入蛋白口袋

## 共价/反应边 (Covalent bond)
**`reacts_with`** 使用：
- **BDE** (键解离能) - 评估化学键强度
- **$\Delta E_a$** (活化能) - 评估反应能垒

## 统一优化
- **靶点药效** (最大化 $\Delta G_{bind}$)
- **代谢酶降解** (最大化 BDE, 提高 $\Delta{E_a}$)
- **分子逆合成** (最小化BDE，降低 $\Delta{E_a}$ 的反应难度)

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

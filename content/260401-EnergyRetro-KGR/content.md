---
title: EnergyRetro-KGR 进度汇报
presenter: 刘晴瑞
report_date: 2026-04-01
---

---
section_key: feedback
section_title: 上次的问题
subsection_title: 上次讨论的核心问题
order: 1
---
- **靶点药效的能量建模是否合适？**
  - 结合亲和力不一定是越大越好，需考虑结合姿势、位点、空间结构
  - 不是最大化，而是约束到合理范围

- **命名建议：Energy KG → 物理模型/物理智能体？**
  - "能量"一词可能偏窄，需要更大的概念来框住

- **是否调研过已有的药物KG？**
  - 如 DRKG、Biokg 等，需说明为什么要重新构建

- **建议：代谢 → ADMET**
  - 涵盖吸收、分布、代谢、排泄、毒性全链路

---
section_key: related-work
section_title: 相关工作
subsection_title: 相关工作: RetroSynthesisAgent (Ma et al. 2025)
order: 2
---
### 核心架构

- **自动化文献检索**: Google Scholar API + PDF 文本提取
- **知识图谱构建**: ChatGPT-4o API 提取反应信息并实体对齐
- **多分支反应路径搜索 (MBRPS)**: 识别所有有效合成路径

![构造知识图谱](assets/page_002_img_in_image_box_118_155_1082_738_x10.png "w=30%")

### 主要贡献

1. 知识图谱作为"外部脑"提供结构化化学约束
2. 记忆化深度优先搜索 (MDFS) 构建逆合成路径树
3. 基于反应条件、产率、安全性推荐最优路径

---
section_key: related-work
section_title: 相关工作
subsection_title: 相关工作: KnowRetro 及现有方法不足
order: 3
---
### KnowRetro 核心架构

- **层次化知识图构建**: BRICS 分解 + SMARTS 官能团识别 + RGCN 编码
- **反应感知预训练**: SMILES-to-substructure 翻译任务捕获反应模式
- **知识注入**: Task-relevant KG Adapter 过滤冗余信息，残差融合注入编码器

![KnowRetro Framework](assets/page_002_img_in_image_box_218_165_1002_379_x10.png "w=75%")

### 主要贡献

1. 知识图谱捕获分子-子结构-官能团的层次关系
2. 两阶段学习：化学引导预训练 + KG adapter 微调
3. USPTO-50K / USPTO-FULL 基准超越现有方法

---
section_key: motivation
section_title: 研究动机
subsection_title: 为什么需要能量驱动的逆合成知识图谱？
order: 4
---
### 现有方法的根本问题

- **搜索空间爆炸**：缺乏物理约束，无法剔除化学上不可能的路径
- **知识孤岛**：有机反应与酶促反应各自独立，无法协同规划
- **静态图谱**：无法根据实验反馈动态演化

### 核心思路

- **物理约束压缩搜索空间**
  - 利用 BDE 和 $\Delta G$ 剔除热力学不可行路径
  - 先验知识指导搜索，避免盲目探索

- **统一能量尺度**
  - 有机反应：边权重 = 键能变化 + 商业可获得性
  - 酶促反应：边权重 = 催化效率转化的等效能量收益

- **自进化知识图谱**
  - Memory Node 记录失败路径
  - 思考记忆迭代，持续增强逆合成能力

---
section_key: method
section_title: 方法
subsection_title: EnergyRetro-KGR 知识图谱架构
order: 5
---
### 数据整合

**ORD (有机) + BKMS (酶促) 反应混合知识图谱**

![EnergyRetro-KGR 节点关系](assets/EnergyRetro-KGR.png "w=50%")

---
section_key: method
section_title: 方法
subsection_title: EnergyRetro-KGR 节点关系设计
order: 6
---
| 节点 | 属性 | 说明 |
|------|------|------|
| molecule | ADMET | 分子节点，关联药理属性 |
| substructure | - | 子结构/片段 |
| bond | BDE | 化学键，存储键离解能 |
| reaction | $\Delta G$, Condition | 反应节点 |
| enzyme | Type, Pathway | 酶节点，EC分类与代谢路径 |
| memory | - | 记忆节点，记录失败路径 |

### 核心关系

- `molecule → reaction`: 分子参与反应
- `molecule contain substructure`: 分子包含子结构
- `substructure ↔ bond`: 子结构通过键连接成分子
- `enzyme catalysis molecule`: 酶催化分子
- `reaction → memory`: 反应结果写入记忆

---
section_key: method
section_title: 方法
subsection_title: Multi-Agent + Virtual Lab 架构
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

---
section_key: experiment
section_title: 实验进展
subsection_title: 实验进展: 多源数据集构建现状
order: 8
---
### 当前数据层次

| 层次 | 数据源 | 当前用途 | 数据信息 |
|------|--------|----------|------------|
| 核心建图 | ORD | 有机反应节点与条件属性 | 反应物/试剂/溶剂/催化剂、温度/压力/时间、产物/产率、分析方法、来源 |
| 核心建图 | BKMS | 酶促反应节点与酶类别语义 | EC 编号、反应式、BRENDA/KEGG/MetaCyc/SABIO-RK 对齐、Pathway、配平检查 |
| 补充注释 | BRENDA | 酶性质与实验条件补充 | pH/温度最适、抑制剂、辅因子、定位、稳定性、底物产物 |
| 补充注释 | M-CSA | 活性位点与催化残基补充 | `mcsa_id`、残基角色、链信息、功能位置 |
| 补充注释 | UniProt | 蛋白序列与物种注释 | `organism`、`sequence_length`、`ec_number`、GO、domain、reviewed |
| 预留扩展 | SABIO-RK | 动力学参数补全 | 计划补充 `Km / Kcat / Ki` 等反应速率参数 |

### 当前进展

- **主线已明确**：先用 `ORD + BKMS` 搭建有机反应与酶促反应的统一骨架。
<!-- - **注释层已具备来源**：`BRENDA / M-CSA / UniProt` 可分别补条件、活性位点、蛋白序列与功能标签。 -->
- **正在小规模构建图谱实体**：`molecule / reaction / enzyme / condition` 五类核心对象已有对应数据源。

---
section_key: experiment
section_title: 实验进展
subsection_title: 核心数据源 I: ORD 的反应条件维度
order: 9
---
### ORD 提供的结构化反应维度

| 模块 | 关键字段 | 可映射到图谱的对象 |
|------|----------|--------------------|
| Inputs | reactant / reagent / solvent / catalyst | 分子节点、角色边 |
| Conditions | temperature / pressure / time / stirring | 条件节点、反应属性 |
| Outcomes | product / yield / conversion | 产物节点、结果边 |
| Analyses | LC / GC / NMR / MS / LCMS 等 | 证据与验证标签 |
| Provenance | USPTO / HTE / DOI / ELN | 数据来源与可信度标签 |

<!-- ### 已确认的规模与意义

| 指标 | 当前信息 | 对建图的意义 |
|------|----------|--------------|
| 总反应数 | `2,376,120` | 可作为有机反应主干语料 |
| 主要来源 | `USPTO` 为主，同时含 `HTE / DOI / ELN` | 兼顾大规模覆盖与实验细节 |
| 条件完整性 | 同时记录条件、产率、分析方法 | 支持 Virtual Lab 的条件兼容性判断 |

### 本页结论

- **ORD 不只是反应式库**，而是能直接提供条件与结果的实验记录结构。
- **对 EnergyRetro-KGR 的价值** 在于把“有机反应可行性”落到具体实验上下文，而不是只保留 SMILES 变换。
- **后续映射方式**：reaction 作为中心节点，向外连接 molecule、condition、outcome、provenance 四类信息。 -->

---
section_key: experiment
section_title: 实验进展
subsection_title: 核心数据源 II: BKMS 酶促反应分类统计
order: 10
---
### BKMS 反应分类统计（42,539 条）

| EC 一级类别 | 名称 | 反应数 |
|-------------|------|--------|
| EC 1 | 氧化还原酶 | `12,501` |
| EC 2 | 转移酶 | `11,641` |
| EC 3 | 水解酶 | `7,381` |
| EC 4 | 裂解酶 | `2,394` |
| EC 5 | 异构酶 | `1,010` |
| EC 6 | 连接酶 | `1,298` |
| EC 7 | 转位酶 | `608` |

<!-- ### 数据质量与补充挂接

| 维度 | 当前统计/字段 | 说明 |
|------|---------------|------|
| 配平检查 | `30,127` 条通过；其余多为 `generic compounds / n.a. / incomplete` | 大部分反应可直接进入结构化整理 |
| 外部对齐 | BRENDA / KEGG / MetaCyc / SABIO-RK ID | 便于后续跨库合并与验证 |
| 路径语义 | BRENDA / KEGG / MetaCyc pathway | 可补充 enzyme-pathway 关系 |
| 酶注释补充 | UniProt `574,627` 条 reviewed 蛋白，其中 `41.3%` 含 EC 注释 | 用于序列、物种、功能描述补全 |
| 活性位点补充 | M-CSA 残基记录 `5,248` 条 | 用于 enzyme-residue-catalysis 层级细化 |

### 本页结论

- **BKMS 已足够支撑酶促反应层**，且类别分布以 `EC1-3` 为主，覆盖常见代谢反应。
- **跨库对齐是当前最大优势**：单条酶促反应可继续挂接 pathway、protein、residue 和动力学信息。
- **当前阶段已完成的数据准备**：有机反应骨架、酶促反应骨架、蛋白与活性位点注释来源均已就位。 -->

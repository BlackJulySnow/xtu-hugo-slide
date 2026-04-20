---
section_key: experiment
section_title: 实验进展
subsection_title: "实验进展: 多源数据集构建现状"
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

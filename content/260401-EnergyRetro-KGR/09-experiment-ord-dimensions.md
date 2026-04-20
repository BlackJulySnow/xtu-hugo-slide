---
section_key: experiment
section_title: 实验进展
subsection_title: "核心数据源 I: ORD 的反应条件维度"
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

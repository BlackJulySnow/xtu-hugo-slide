---
section_key: retrieval
section_title: 检索
subsection_title: 当前图谱已经支持的查询能力
order: 8
---

- 当前图谱已经不仅能“存反应”，而且已经能支撑几类直接有用的查询
- 对 retrosynthesis 来说，最关键的是 `产物 -> 生成反应 -> 前体分子` 
- 对 bio 相关任务来说，`产物 -> 酶证据` 和 `反应 -> pathway 上下文` 

| 能力 | 当前查询路径 | 说明 |
| --- | --- | --- |
| 反查产物生成反应 | `Compound <-[:PRODUCES]- ReactionRecord` | retrosynthesis 基础入口 |
| 前体展开 | `Compound <- PRODUCES - ReactionRecord - CONSUMES -> Compound` | 可直接做多级逆合成扩展 |
| 酶证据查询 | `Compound <- PRODUCES - ReactionRecord - CATALYZED_BY -> Enzyme` | 支撑酶反应推荐 |
| pathway 上下文 | `ReactionRecord - PARTICIPATES_IN_PATHWAY -> Pathway` | 支撑通路推荐/分析 |
| 跨来源共享产物 | 同一 `Compound` 连接 `BKMS` 与 `ORD` | 支撑有机-酶促桥接分析 |

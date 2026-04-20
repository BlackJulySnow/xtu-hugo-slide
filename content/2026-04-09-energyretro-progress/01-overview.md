---
section_key: overview
section_title: 总览
subsection_title: 本周进展
order: 1
---

- 本周工作可以概括为三条线：`KG 构图完成`、`检索增强完成`、`single-step baseline 跑通`
- 当前 `retro` 图谱已经整合 `BKMS + ORD`，形成统一的反应记录、化合物、酶、pathway 底座
- 图谱规模已经达到 `2.42M ReactionRecord`、`2.02M Compound`、`12.84M` 基础关系，额外添加了 `Fragment` 层
- staged retrieval 相比 exact match，命中从 `16%` 提升到 `100%`
- 单步逆合成在 `USPTO50k test` 上测试结果：`Top-1 0.47`、`Top-10 0.59`

| 模块 | 当前状态 | 结论 |
| --- | --- | --- |
| 统一构图 | 已经构图 | 图底座已经可查询 |
| 检索增强 | 已评估 | recall 和抗噪声能力提升 |
| single-step | 已跑通 | 先验证流程，再继续提精度 |

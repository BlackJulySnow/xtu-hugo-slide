---
section_key: single
section_title: 单步逆合成
subsection_title: Single-Step Pipeline
order: 9
---

- 当前 `single-step` 原型已经把图检索层接进了完整流程
- 整体流程为：
  `LayeredRetriever -> ContextBuilder -> Solver Agents -> Critic -> Rewriter -> Selector`
- 其中 solver 目前有五种策略：
  `exact / canonical / similarity / substructure` / `balenced`
- selector 最终输出的不只是一个答案，还包括：
  `rankings`、`selection_reason`、`retrieval_summary`、`uncertainty_notes`

![Single-step multi-agent pipeline](assets/2026-04-09-06-39-16-single-step-horizontal-paper.png "w=92%")

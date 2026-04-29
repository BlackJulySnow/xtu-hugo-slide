---
section_key: method
section_title: 方法
subsection_title: "当前 Single-Step Multi-Agent Pipeline"
order: 3
---

<!-- - 单步逆合成流程已定型：
  `LayeredRetriever → ContextBuilder → Solver Agents → Critic → Rewriter → Selector`
- 先检索，再提方案、做批判，最后统一排序
- 除 `best_route` 外，还会保留：

### 各阶段职责 -->

| 阶段 | 输入 | 输出 | 作用 |
| --- | --- | --- | --- |
| Retriever | target SMILES | layered retrieval hits | 检索分层证据 |
| ContextBuilder | retrieval hits | evidence pack | 整理 candidate 与支持强度 |
| Solver Committee | evidence pack | 5 条初始 routes | 从不同偏好各提一个方案 |
| Critic | routes + evidence | critique report | 检查证据与路线合理性 |
| Rewriter | routes + critiques | rewritten routes | 去重、补充、重排 |
| Selector | rewritten routes | best route + rankings | 给出最终排序 |

![Single-step multi-agent pipeline](2026-04-09-06-39-16-single-step-horizontal-paper.png "w=90%")

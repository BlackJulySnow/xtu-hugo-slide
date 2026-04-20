---
section_key: single
section_title: 单步逆合成
subsection_title: 当前 Bottlenecks 与优化方向
order: 11
---
### 当前指标偏低，还需要提升单步逆合成反应的性能，主要考虑从下面几个方面：
- 当前使用的 `GLM-5` 更偏 `programming / tool-use` 风格模型，结构化输出比较稳定，但在多候选比较、化学反应机理判断、长链式推理上仍弱于真正的强 reasoning model
- 当前 `context management` 还是静态窗口式的：`ContextBuilder` 只保留有限候选与证据，并用启发式权重聚合，弱证据和相似噪声容易一起进入 prompt
- 系统还没有把成功路线、失败案例、常见 transformation pattern、enzyme/pathway 证据动态写回为 `memory nodes`，因此每次推理都在“重新开始”

| 优化方向 | 具体要做什么 |
| --- | --- |
| 更强的 context 管理 | 做分层上下文压缩、candidate clustering、冲突证据去重、动态窗口分配 |
| 更强的 prompt 编排 | 为 solver / critic / rewriter 设计更细的角色 prompt、显式步骤化推理和结构化中间产物 |
| 动态记忆节点 | 把 successful routes、hard negatives、reaction motifs、enzyme/pathway evidence 写回 KG 或 memory layer |
| 升级 reasoning backbone | 后续尝试更强 reasoning model，或者是8/32/72 B的小一点模型，与当前 GLM-5 agent workflow 做对比评测 |

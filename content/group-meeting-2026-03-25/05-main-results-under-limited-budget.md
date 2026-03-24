---
section_key: experiment
section_title: 实验
subsection_title: 1000 次预算下直接优化可合成性已经可行
order: 5
---

- 这是论文最核心的结果：在只有 1000 次分子评估的条件下，直接把 AiZynth 放进优化目标，依然能得到可解路线的候选
- 四目标版本得到的分子更均衡，双目标版本能找到更多 mode，但 QED 明显下降
- 这说明“直接优化 retrosynthesis 很贵，所以不现实”并不是绝对成立，关键在生成器的样本效率
- 但作者也很诚实地指出：对 drug-like 分子来说，是否值得这样做，还要看和启发式相比的性价比

| 配置 | 关键结论 |
| --- | --- |
| `R_all MPO` | mode 数较少，但性质更平衡，候选更“能直接用” |
| `R_double MPO` | mode 更多，solvability 也高，但更容易牺牲 QED |
| 和 RGFN 等对比 | 更低预算下已经能找到高质量可合成候选 |

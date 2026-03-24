---
section_key: method
section_title: 方法
subsection_title: 核心思路是把 retrosynthesis 直接放进优化闭环
order: 3
---

- 生成器使用 Saturn，这是一个基于 Mamba 的自回归分子生成模型，优势是 sample efficiency 高
- 可合成性不再只做后处理，而是把 retrosynthesis 模型的 solvability 直接写进 reward
- 论文强调方法对 retrosynthesis 模型形式不敏感，后面分别接了 AiZynth、RetroKNN、Graph2Edits、RootAligned
- 这篇工作真正的新意是范式变化：从“生成后检查能不能合成”，变成“生成时就朝可合成方向搜索”

| 组件 | 本文做法 |
| --- | --- |
| 生成模型 | Saturn |
| 可合成性 oracle | retrosynthesis solvability |
| 下游任务 | 药物发现与功能材料 |
| 核心问题 | 直接优化是否在现实预算下可行 |

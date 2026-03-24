---
section_key: introduction
section_title: Introduction
subsection_title: 背景任务2：代谢位点预测（Metabolism SoM）
order: 3
---


任务定位：预测分子在生物体内更可能发生代谢反应的位置（如CYP450相关位点）。

- 为什么关键：代谢位点直接影响药物半衰期、毒性风险与成药性优化方向。
- BDE价值：较低BDE位点往往更易发生H抽取/氧化，能作为位点排序的重要先验。
- 任务输入：分子结构、酶环境上下文、可选实验约束。
- 任务输出：位点排序、风险标签与可解释能量证据。
- 典型指标：Top-1/Top-k命中率、PR-AUC、跨化学空间泛化能力。

![代谢反应场景示意](assets/drug-metabolism.jpg "代谢反应场景示意")

[Suggested Addition]
---
section_key: energy_encoder
section_title: 能量编码器
subsection_title: "7、不确定性感知的可行性评估"
order: 7
---

**对每个候选断键决策输出可行性得分及置信区间**

- 在逆合成中，关键挑战不仅是预测哪些断键可行，还要评估模型对该预测的信心
- 使用 ensemble 或 MC Dropout 方法对 Energy Encoder 的输出进行不确定性量化
- 对于高不确定性的候选路径，标记为需要 virtual lab 高精度验证

```
断键候选 A  → 可行性: 0.87,  不确定性: σ=0.05  → 低不确定，直接采纳
断键候选 B  → 可行性: 0.62,  不确定性: σ=0.23  → 高不确定，送验证
```

- 不确定性估计使系统能够在"轻量筛选"和"高精度验证"之间自动分配资源

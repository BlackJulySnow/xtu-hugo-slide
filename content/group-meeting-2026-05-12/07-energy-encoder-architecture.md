[Suggested Addition]
---
section_key: energy_encoder
section_title: 能量编码器
subsection_title: "5、Energy Encoder 架构设计"
order: 5
---

**将分子结构映射为热力学语义表示**

- 以分子图表示为输入，经过 GNN 编码得到分子表征
- 通过多任务 head 分别预测 BDE、结合自由能、活化自由能等维度
- 输出统一的热力学语义向量，供下游逆合成任务使用

```
Input (Molecular Graph)
  → GNN Encoder
    → BDE Head        → ΔH (covalent dimension)
    → ΔG Head         → ΔG (non-covalent dimension)
    → ΔG‡ Head        → ΔG‡ (activation barrier dimension)
  → Concat → Energy Embedding
```

![Energy Encoder 架构](assets/energy-encoder-arch.png "w=80%")

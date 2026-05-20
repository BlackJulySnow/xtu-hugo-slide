[Original Slide]
---
section_key: retrosynthesis
section_title: 单步逆合成
subsection_title: "8、单步逆合成实验结果"
order: 8
---

**在 USPTO-50K 数据集上评估单步逆合成性能**

| 方法 | Top-1 | Top-3 | Top-5 | Top-10 |
| --- | --- | --- | --- | --- |
| Graph2Edits | 54.2% | 72.1% | 80.3% | 87.5% |
| MEGAN | 56.8% | 74.5% | 82.1% | 88.9% |
| RetroPrime | 58.1% | 75.9% | 83.4% | 89.7% |
| **Ours (w/ Energy Core)** | **60.3%** | **77.8%** | **85.1%** | **91.2%** |

- Energy Encoder 提供的热力学语义信号提升了 Top-k 准确率
- 提升在 Top-1 和 Top-3 最为明显，说明能量先验对最优候选排序更有效

![单步逆合成结果](assets/retro-single-step-results.png "w=80%")

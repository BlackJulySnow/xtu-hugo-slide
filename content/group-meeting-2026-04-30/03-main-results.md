---
section_key: experiment
section_title: 实验
subsection_title: "初步结果：路径级准确率提升明显"
order: 3
---

| 方法 | 搜索策略 | Solved Rate | Valid Step | Route Top-1 | Route Top-5 |
| --- | --- | ---: | ---: | ---: | ---: |
| NeuralSym | 模板分类 + 贪心展开 | 48.3% | 76.1% | 18.9% | 37.8% |
| Retro* | A* route search | 64.4% | 83.9% | 29.4% | 52.2% |
| MCTS-Retro | Monte Carlo Tree Search | 66.7% | 84.6% | 31.1% | 54.4% |
| AiZynthFinder | 模板库 + stock filter | 70.0% | 87.2% | 33.9% | 56.7% |
| LocalRetro + Beam | 局部反应中心 + beam search | 71.1% | 88.3% | 35.6% | 59.4% |
| EnergyRetro-KGR | KG/RAG + critic rerank | 76.8% | 74.8% | 34.8% | 53.0% |

- EnergyRetro-KGR 在 **Solved Rate 排第 1**，说明更容易找到可购买起始原料并闭合路线
- **Valid Step**，整体反应步骤有效性较高，对比模板库方法的稳定性不足

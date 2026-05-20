[Original Slide]
---
section_key: retrosynthesis
section_title: 多步逆合成
subsection_title: "9、多步逆合成消融实验"
order: 9
---

**各组件对多步逆合成路径成功率的贡献**

| 组别 | 权重配置 | 路径成功率 |
| --- | --- | --- |
| KnowledgeGraph | KG=1.0 | 42.1% |
| Energy Prior | Energy=0.8 | 45.3% |
| Enzyme | Enzyme=0.2 | 41.8% |
| Memory | Memory=0.3 | 43.7% |
| Rollout | Rollout=0.4 | 44.5% |
| **Full Model** | **All combined** | **49.6%** |

- Energy Prior 单独贡献最大，验证了热力学语义对路径筛选的有效性
- 完整模型组合所有信号后路径成功率最高，说明各组件存在互补作用

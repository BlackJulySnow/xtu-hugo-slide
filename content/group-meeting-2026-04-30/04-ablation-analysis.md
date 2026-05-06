---
section_key: analysis
section_title: 分析
subsection_title: "消融分析：知识增强主要影响路线排序"
order: 4
---

| 设置 | Solved Rate | Valid Step | Route Top-1 | Route Top-5 | 主要现象 |
| --- | ---: | ---: | ---: | ---: | --- |
| 完整流程 | 76.8% | 74.8% | 34.8% | 53.0% | 路线闭合能力最好，但步骤有效性仍不足 |
| 去掉KG相似路线 | 74.4% | 74.1% | 31.6% | 49.5% | 关键中间体命中下降 |
| 去掉 energy critic | 73.3% | 70.6% | 33.0% | 51.2% | 不合理断键和条件冲突增多 |
| 去掉可购买性过滤 | 61.7% | 75.5% | 35.1% | 54.0% | Top-k 略高，但终点不可用 |

- 可购买性过滤对 **Solved Rate** 影响最大
- KG 相似路线能改善 Route Top-k，但提升幅度有限
- energy critic 能缓解无效步骤问题，但 Valid Step 仍弱于模板库和规则搜索方法

---
section_key: experiment
section_title: 实验
subsection_title: "酶推荐实验"
order: 10
---

- 给定酶反应，预测最可能催化它的酶类别（推荐 EC number）
- 多分类问题，评估两个粒度：（1）EC-L3：前三层 EC，（2）EC-L4：完整四层 EC

<!-- ### 基线方法

- **CLAIRE**：原版仅支持 EC-L3，改造为支持 EC-L4 后重新训练
- **Selenzyme 2023** -->

<!-- ### EC-L4 结果（完整四层） -->

| 方法 | Top-1 | Top-3 | Top-5 | F1 |
| --- | --- | --- | --- | --- | --- |
| CLAIRE | 52.96% | 64.48% | - | - |
| Selenzyme 2023 | 26.49% | 27.14% | 27.36% | -  |
| ChemEnzyRetroPlanner | 65.31% | 73.39% | 76.75% | 0.6270  |
| EnergyKG | 72.50% | 77.80% | 80.60% | 0.6770 |

| 方法 | Top-1 | Top-3 | Top-5 | F1 |
| --- | --- | --- | --- | --- |
| CLAIRE | 82.57% | 91.95% | - | - |
| Selenzyme 2023 | 72.43% | 74.16% | 74.52% | - |
| ChemEnzyRetroPlanner | 83.55% | 88.81% | 91.01% | 0.8247 |
| EnergyKG | 89.50% | 93.70% | 96.10% | 0.8747 |

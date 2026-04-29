---
section_key: experiment
section_title: 实验
subsection_title: "酶反应识别实验"
order: 9
---

### 任务定义

- 给定一个 reaction step，判断是否为酶催化反应，为二分类问题

### 数据与基线

- 正样本：ECReact
- 负样本：USPTO-1000-TPL
- 基线：基于 RetroBioCat 135 个酶反应模板的模板匹配方法，ChemEnzyRetroPlanner

### 结果对比

| 方法 | Accuracy | Precision | Recall | F1 | MCC | AUC | 推理时间 (s/sample) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ChemEnzyRetroPlanner | 0.9984 | 0.9960 | 0.9895 | 0.9927 | 0.9918 | 0.9999 | 0.0014 |
| 模板匹配 | 0.6179 | 0.0613 | 0.1725 | 0.0904 | -0.1046 | - | 0.0064 |
| EnergyKG | 0.9986 | 0.9958 | 0.9900 | 0.9928 | 0.9920 | 0.9998 | 2.8300 |


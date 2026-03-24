---
section_key: response
section_title: 进度汇报
subsection_title: 问题二：关于四个任务关系的当前理解
order: 3
---




| 任务 | 任务描述 | 代表性数据集 | 常用评价指标 |
| --- | --- | --- | --- |
| Retrosynthesis | 给定目标分子，预测可行前体或反应路径，并评估关键断键决策是否合理 | USPTO-50K、USPTO-Full | Top-k Accuracy、Round-trip Accuracy、路径成功率 |
| Metabolism | 预测分子在酶环境中的代谢位点或易反应键位 | XenoSite Phase I、XenoSite UGT、CYP SOM 数据集 | Top-k Accuracy、AUROC、位点命中率 |
| Enzyme Reactivity | 预测酶与底物/反应之间的反应性匹配或可催化性 | EnzymeMap、ReactZyme | Top-k Accuracy、MRR / Recall@k、反应检索准确率 |
| Binding FE | 预测蛋白-配体结合强弱或候选排序 | PDBbind、CASF-2016 | Pearson / Spearman、RMSE、Ranking Power |

<!-- 口述稿
这一页我主要是想先把任务本身讲清楚。
上次老师提到这几个任务之间到底是什么关系，我现在觉得这个问题还不能太早下结论。
所以我这次先往后退一步，不先讲流程，先讲每个任务到底在做什么、准备用什么 benchmark、最后拿什么指标来评。
这样后面再讨论它们之间有没有顺序、有没有依赖，至少不是空对空在讲故事。
-->

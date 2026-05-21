---
title: 热力学驱动的多任务Muti-agent框架
presenter: 刘晴瑞
report_date: 2026-03-14
summary: 回应上次讨论的问题
---

---
section_key: response
section_title: 进度汇报
subsection_title: 上次讨论的问题
order: 1
---
<!-- 本次汇报首先回应上次讨论中的三类核心问题，并据此重构后续研究主线。 -->

- 能量核心是否能统一到同一表示空间 
- 四个任务是否存在固定前后顺序
- 框架图优化

<!-- 本次答疑部分的目标，不是逐条重复讨论记录，而是把研究故事收敛成更清晰、可执行的框架。 -->

---
section_key: response
section_title: 进度汇报
subsection_title: 问题一：热力学语义空间表达
order: 2
---
- 三个维度分别对应共价断键、非共价相互作用和活化自由能控制。
- 前面先筛选，后面再调用高精度工具做关键验证。


| 语义维度 | 轻量级 Agent 筛选 | Virtual Lab 验证 |
| --- | --- | --- | --- |
| 焓 / 共价维度 | ALFABET、预训练 GNN BDE 模型 | xTB（DFT） |
| 自由能 / 非共价维度 | Scoring Functions | AutoDock Vina | 
| 活化自由能\($\Delta G^\ddagger$) / 构象熵 | RDKit Conformer Search  | CREST/xTB | 

<!-- 口述稿
这一页我想说的核心不是所有任务都共享一个分数，而是它们下面那层热力学语义是可以放到一起理解的。
我现在大概把它拆成三个部分。
第一条是焓或者共价键，对应 BDE，主要和代谢位点、还有逆合成断键相关。
第二条是自由能，对应 \(\Delta G\)，主要是结合自由能这类问题。
第三条是活化自由能，对应 \($\Delta G^\ddagger$) ，在逆合成（Retrosynthesis）中，势垒通常决定了反应发生在分子的哪个部位，这是热力学控制与动力学控制共同竞争的语义空间。

另外这里我想把虚拟实验室怎么落地一起讲清楚。
我的想法不是所有候选都直接上高精度工具，那样太重了。
更合理的做法是前面先用轻量级 surrogate model 大规模筛一遍，把范围缩小；
真正关键的候选，再交给后面的 virtual lab tools 去做验证。
所以这其实是一个“先筛选、再验证”的闭环。
-->

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

---
section_key: response
section_title: 进度汇报
subsection_title: 问题三：框架图调整与当前方案
order: 4
---
- 这版图上弱化了左侧通用输入，把重点重新收回到中间的 Energy Core。
- 下游任务不再强调僵硬流水线，而是用主任务与约束任务的任务簇来表达。
- 右侧通过评估、记忆和高精度工具组成虚拟实验室闭环。

![框架图](assets/2026-03-13-framework-prompt-sci-english-2k-bent-feedback-icons.png "框架图")

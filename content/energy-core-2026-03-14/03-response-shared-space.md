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

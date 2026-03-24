
> **汇报人**: 刘晴瑞
> **日期**: 2026-03-14
> **主题**: 回应上次讨论的问题

---

## 目录

1. [问题总览](#问题总览)
2. [热力学语义空间表达](#热力学语义空间表达)
3. [四个任务关系的当前理解](#四个任务关系的当前理解)
4. [框架图调整与当前方案](#框架图调整与当前方案)

---

## 问题总览

本次汇报回应上次讨论中的**三类核心问题**，并据此重构后续研究主线：

| 问题 | 核心关注点 |
|------|-----------|
| 问题一 | 能量核心是否能统一到同一表示空间 |
| 问题二 | 四个任务是否存在固定前后顺序 |
| 问题三 | 框架图优化 |

> **目标**: 把研究故事收敛成更清晰、可执行的框架。

---

## 热力学语义空间表达

### 三个热力学语义维度

| 语义维度 | 对应概念 | 轻量级 Agent 筛选 | Virtual Lab 验证 |
|---------|---------|------------------|-----------------|
| 焓 / 共价维度 | 共价断键 | ALFABET、预训练 GNN BDE 模型 | xTB（DFT） |
| 自由能 / 非共价维度 | 非共价相互作用 | Scoring Functions | AutoDock Vina |
| 活化自由能 ($\Delta G^\ddagger$) / 构象熵 | 活化自由能控制 | RDKit Conformer Search | CREST/xTB |

### 核心思路

- **先筛选，后验证**: 不是直接对所有候选使用高精度工具，而是先用轻量级 surrogate model 大规模筛选，缩小范围后，再交给 virtual lab tools 验证关键候选
- 构建"筛选 → 验证"的闭环流程

---

## 四个任务关系的当前理解

| 任务 | 任务描述 | 代表性数据集 | 常用评价指标 |
|------|---------|-------------|-------------|
| **Retrosynthesis** | 给定目标分子，预测可行前体或反应路径，并评估关键断键决策是否合理 | USPTO-50K、USPTO-Full | Top-k Accuracy、Round-trip Accuracy、路径成功率 |
| **Metabolism** | 预测分子在酶环境中的代谢位点或易反应键位 | XenoSite Phase I、XenoSite UGT、CYP SOM 数据集 | Top-k Accuracy、AUROC、位点命中率 |
| **Enzyme Reactivity** | 预测酶与底物/反应之间的反应性匹配或可催化性 | EnzymeMap、ReactZyme | Top-k Accuracy、MRR / Recall@k、反应检索准确率 |
| **Binding FE** | 预测蛋白-配体结合强弱或候选排序 | PDBbind、CASF-2016 | Pearson / Spearman、RMSE、Ranking Power |

> **策略**: 先澄清每个任务的定义、benchmark 和评价指标，再讨论任务间的依赖关系。

---

## 框架图调整与当前方案

### 关键调整

1. **弱化通用输入**: 左侧通用输入被弱化，重点收回到中间的 **Energy Core**
2. **柔性任务组织**: 下游任务不再强调僵硬流水线，改用"主任务 + 约束任务"的任务簇表达
3. **虚拟实验室闭环**: 右侧通过评估、记忆和高精度工具组成虚拟实验室闭环

### 框架图

![框架图](assets/2026-03-13-framework-prompt-sci-english-2k-bent-feedback-icons.png)

---

## 文件清单

| 文件名 | 内容描述 |
|-------|---------|
| `_index.md` | 汇报标题页 |
| `01-response-overview.md` | 问题总览：上次讨论后的三项收敛 |
| `02-response-task-relationship.md` | 问题二：四个任务关系的当前理解 |
| `03-response-shared-space.md` | 问题一：热力学语义空间表达 |
| `04-response-focus-next-step.md` | 问题三：框架图调整与当前方案 |

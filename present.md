# EnergyRetro-KGR 组会口述演讲稿
# 汇报人：刘晴瑞  |  2026-04-23

---

## 第一页：本次汇报重点

各位老师好，今天我汇报的主题是 EnergyRetro-KGR 的进展。

本周的工作主要分为两条线：

第一条是对 single-step retrosynthesis 单步反应预测的系统优化。具体包括：调整了分层 RAG 的 candidate aggregation 和排序权重；同时重写了 multi-agent 的 prompt、critic 和 selector 逻辑。

第二条是酶催化相关的两个实验：一个是酶推荐——预测反应的最可能催化酶类别；另一个是酶反应识别——判断一个反应是否为酶催化反应。

接下来从问题出发，逐步介绍方法和结果。

---

## 第二页：当前问题与优化目标

先看 single-step 这边目前的核心问题。

之前我们主要解决的是"有没有候选"的问题，现在 candidate recall 已经拉起来了，核心矛盾转移到了"候选能不能排对"。

当前误差主要来自两个方面：
第一，similarity 层的弱证据容易混入上下文，导致噪声干扰；
第二，critic 和 selector 对一些不合理路线的压制还不够，不会主动剔除。

所以这轮的优化目标是三个维度：
- Retrieval 层面，提高高质量 candidate 的进入率；
- Agent Reasoning 层面，提高 critique 和重排的质量；
- Chemistry Prior 层面，显式引入 BDE 稳定性约束。

大家可以看到这张图，左边是当前的错误模式分析……（配合图片展开）

---

## 第三页：当前 Single-Step Multi-Agent Pipeline

介绍一下当前的流程架构。

整个 pipeline 包含六个阶段：

Retriever 接收 target SMILES，输出分层检索结果。

ContextBuilder 把检索结果整理成 evidence pack，包括 candidate 和对应的支持强度。

Solver Committee 是核心，五个 solver 并行处理同一个 evidence pack，各提一个方案，输出 5 条初始 routes。

Critic 对每条 route 检查证据充分性和路线合理性，输出 critique report。

Rewriter 根据 critique 对 routes 去重、补充、重排。

最后 Selector 给出最终排序和 best route。

这张图展示了完整的 pipeline 流程。

---

## 第四页：分层 RAG 与 Candidate Aggregation 优化

先说 retrieval 层的优化。

检索还是保持四层结构：exact、canonical、similarity、substructure。

这轮的主要调整是排序权重的重新分配：
- exact 层精度最高，权重提到 1.5；
- canonical 作为高可信补充，权重 0.7；
- similarity 解决召回不足，但同时要压制噪声，权重降到 0.35；
- substructure 作为 fallback 保留，但权重压到 0.2，不影响主排序。

聚合策略上，除了提高 multi-level 和 multi-source bonus，还加入了 precursor size penalty，避免复杂分子被过度偏好。

候选分数由三层加权得分加上 bonus 和 penalty 构成。

  multi-level / multi-source bonus                                                                                      
  - 如果一个 candidate 在多个检索层级（exact + canonical + similarity）都有命中，会给额外加分（multi-level bonus）      
  - 如果它被多个数据源支持，也会加分（multi-source bonus）                                                              
  - 这相当于"多方验证过的候选更可信"的逻辑                                                               
                                                                                                                        
  precursor size penalty                                                                                                
  - 如果候选的 precursor 分子太大、结构太复杂，会被扣分                                                                 
  - 因为过于复杂的 precursor 在化学上往往不是好的逆合成建议，需要避免模型倾向于生成"大而全"的路线

---

## 第五页：Multi-Agent 设计与 BDE 嵌入方式

接下来看 agent 层。

Solver agent 采用 committee 结构，五个 solver 分别偏向 exact、canonical、similarity、substructure 和 balanced 视角，并行处理同一个 evidence pack。

Prompt 设计上聚焦两点：一是限定 agent 只能在已有 candidate 中选择，二是要求输出严格 JSON 格式，保证后续流程可解析。

BDE 稳定性检查嵌入方式：
对每条 solver route 执行 _bde_critique()，输出 route_id 到 issues 的映射，写入 critic 输入的 routes["bde_analysis"] 字段。

这里 BDE 不是直接写在 prompt 文案里，而是作为结构化信息和 route 一起送入，这样 critic 可以在做化学合理性判断时参考。

---

## 第六页：BDE 加入 Critic 的具体设计

把 BDE 放在 critic 而不是 retriever，核心原因是分工：retriever 负责尽量找全候选，critic 负责根据化学合理性压降不稳定路线。

具体检查流程分五步：
先算 target 的 weakest bond BDE；
再算所有 precursor 里最低的 weakest bond BDE；
如果低于 60 kcal/mol，标记高反应性风险；
如果比 target 低超过 20 kcal/mol，标记不利能量差；
最后转成 critic penalty。

扣分规则上，除了 BDE issue 每条扣 0.15，还有证据支持不足、单一 reaction、无 source provenance 等额外扣分。

---

## 第七页：单步逆合成实验结果

接下来看实验结果。

先放单步逆合成这块，和其他方法的 top-k 对比。

这里可以看到几个 baseline 方法：
ChemDual-8B 的 top-1 是 50%，top-10 是 78.3%；
RxnNano-0.5B 作为当前 SOTA，top-1 达到 75.1%，top-10 达到 96.6%；
我们的 EnergyKG 目前 top-1 是 52.1%，top-10 是 62.6%。

这里需要说明的是，RxnNano 使用了 AAM（原子映射）作为额外监督信号，而 EnergyKG 是基于 KG-RAG 的方法，两者出发点不同。EnergyKG 的优势在于可解释性和对证据的显式建模。

目前 top-10 的 ceiling 还受限于 retrieval coverage，后续会继续从这方面突破。

---

## 第八页：酶反应识别实验

第二个实验是酶反应识别。

任务定义很直接：给定一个 reaction step，判断它是不是酶催化反应，建模为二分类问题。

正样本来自 ECReact，负样本来自 USPTO-1000-TPL。基线方法包括基于 RetroBioCat 模板的模板匹配和 ChemEnzyRetroPlanner。

结果上：
ChemEnzyRetroPlanner 准确率 99.84%，推理时间 0.0014 秒每样本；
模板匹配法准确率只有 61.8%，precision 仅 6.1%，说明模板覆盖远远不够；
我们的 EnergyKG 准确率 99.86%，与 ChemEnzyRetroPlanner 基本持平，推理时间 2.83 秒每样本。

在 accuracy 相当的前提下，EnergyKG 的优势在于它不依赖预定义的酶反应模板，对新反应的泛化能力更强。

---

## 第九页：酶推荐实验

第三个实验是酶推荐。

给定一个酶反应，预测最可能催化它的酶类别，推荐 EC number。这是多分类问题，分别评估 EC-L3 前三层和 EC-L4 完整四层两个粒度。

EC-L4 的结果：
CLAIRE 的 top-1 是 53%；
Selenzyme 2023 只有 26.5%；
ChemEnzyRetroPlanner 达到 65.3%；
EnergyKG 达到 72.5%，比 ChemEnzyRetroPlanner 高出约 7 个百分点。

EC-L3 的结果：
CLAIRE 的 top-1 是 82.6%；
ChemEnzyRetroPlanner 是 83.6%；
EnergyKG 达到 89.5%，同样领先约 6 个百分点。

这个结果说明 EnergyKG 在酶类别推荐任务上也有竞争力，知识图谱提供的结构化信息在这个任务中发挥了作用。

---

## 总结

总结一下今天汇报的三个部分：

第一，single-step 这边完成了 retrieval 和 agent 层的优化，top-1 有稳步提升，top-10 的 retrieval coverage 是下一步重点。

第二，酶反应识别实验验证了 EnergyKG 在二分类任务上与 SOTA 方法相当的能力，且不依赖预定义模板。

第三，酶推荐实验在 EC-L3 和 EC-L4 两个粒度上都比 ChemEnzyRetroPlanner 高出 5-7%，说明 KG 方法在这个任务中有优势。

下一步会继续推进 retrieval/ranking 联动优化，同时进一步观察 BDE-aware critic 在边界样本上的效果。

汇报完毕，请各位老师批评指正。

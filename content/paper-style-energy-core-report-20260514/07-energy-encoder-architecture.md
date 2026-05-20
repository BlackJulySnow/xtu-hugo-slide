---
section_title: 方法
subsection_title: BDE 能量约束嵌入多步搜索架构
order: 10
---

### 1. BDE 能量计算

对每个候选反应 $r: \{P_i\} \to M$，计算 weakest bond BDE 差值：

$$\Delta E_{\text{BDE}}(r) = \sum_{b \in P_{\text{all}}} \text{BDE}(b) - \sum_{b \in M} \text{BDE}(b)$$

能量约束判定：

$$\Delta E_{\text{BDE}} < -\tau_{\text{diff}} \;(-20) \implies \text{不利能量差}$$
$$\text{BDE}_{\min}(P) < \tau_{\text{reactive}} \;(60) \implies \text{高反应性风险}$$  

### 2. Energy Critic 三维度打分

| 信号 | 作用 | 公式/逻辑 |
| --- | --- | --- |
| BDE | 断键合理性 | $p_{\text{bde}} = \sigma(\Delta E_{\text{BDE}} / \tau_{\text{diff}})$ |
| Plausibility | 化学可行性 | KG 中反应证据强度 |
| Condition Compatibility | 条件兼容 | 溶剂/pH/温度冲突检测 |

Critic Penalty：$P_{\text{critic}}(r) = \sum_j w_j \cdot \mathbb{I}[\text{issue}_j]$

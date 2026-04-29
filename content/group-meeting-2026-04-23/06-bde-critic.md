---
section_key: method
section_title: 方法
subsection_title: "BDE 加入 Critic 的具体设计"
order: 7
---

- 将 `BDE stability check` 接入 critic 流程
- 原因：retriever 负责尽量找全候选，critic 负责根据化学合理性压降不稳定路线

### BDE 检查流程

1. 计算 target 的 weakest bond BDE
2. 计算所有 precursor 中最低的 weakest bond BDE
3. 低于 `60 kcal/mol`：标记为高反应性风险
4. 比 target 低超过 `20 kcal/mol`：标记为不利能量差
5. 将上述 issue 转为 critic penalty

### Critic 扣分规则

- 无 `exact / canonical` 支持：`-0.18`
- 仅一条 supporting reaction：`-0.05`
- 无 source provenance：`-0.05`
- 每条 BDE issue：`-0.15`

<!-- | 设计位置 | 原因 |
| --- | --- |
| 不放在 retriever | 避免过早牺牲召回 |
| 放在 critic | 适合做 chemistry-aware re-ranking |
| 不使用 hard filter | 对边界样本更稳健 | -->

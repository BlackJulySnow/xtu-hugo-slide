---
section_key: introduction
section_title: 引言
subsection_title: 只优化性质会产生什么问题
order: 2
---

- 作者先给出一个反例：如果目标函数里只有 docking score，模型会快速学会利用 oracle 的漏洞
- 这类分子通常分子量更大、疏水性更强、QED 更差，看起来分数高，但并不是真正有价值的候选
- 这说明在生成任务中，单一性质优化很容易走向“伪优”区域
- 因此后续必须同时引入可合成性和更合理的多目标约束

![Fig. 2 只优化 docking 时出现的伪优分子](assets/fig2.png "w=62%")

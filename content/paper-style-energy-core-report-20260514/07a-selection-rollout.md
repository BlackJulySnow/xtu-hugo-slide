---
section_title: 方法
subsection_title: 能量引导的 Selection 与 Rollout Update
order: 11
---

### 3. Selection 阶段 — 能量引导的价值函数

$$V_{\text{all}}(m) = \alpha \cdot S_{\text{KG}}(m) + \beta \cdot E_{\text{BDE}}(m) + \gamma \cdot \cdot P_{\text{memory}}(m)$$

选择目标：$\displaystyle m^* = \arg\min_{m \in \mathcal{C}} V_{\text{all}}(m)$

### 4. Rollout & Update 阶段

- **Shallow Rollout**：1~3 步浅层模拟，每步用 Critic 打分快速淘汰
- **Sibling Jump**：当前节点失败时，跳转至 BDE 能量相近的兄弟节点
- **Memory**：记录能量不合理的失败模式，后续搜索中施加惩罚 $P_{\text{memory}}$

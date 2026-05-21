---
title: 本周工作进展汇报
presenter: 刘晴瑞
report_date: 2026-05-12
summary: 汇报本周实验进展：baseline 复现、多数据集运行、代码 bug 修复，以及框架图绘制和多步逆合成实验状态。
---

---
section_key: experiments
section_title: 实验进展
subsection_title: 1、本周实验概览
order: 1
---
**本周主要工作**

- 跑完 3 个数据集的实验
- 协助师兄复现 2 个 baseline 方法
- 修复 baseline 代码中的 bug（梯度爆炸等问题）
- 框架图绘制与修改中
- 多步逆合成消融实验进行中

---
section_key: experiments
section_title: 实验进展
subsection_title: 2、协助师兄跑实验
order: 2
---
**协助师兄复现 Baseline**

- 复现 LiTEN 和 MGNN 两个 baseline 方法
- 在 MD22、QM9、MD17 三个数据集上完成了实验运行
- 修复了 baseline 代码中的 bug（梯度爆炸等问题），实验已可正常运行

| 数据集 | LiTEN | MGNN |
| --- | --- | --- |
| MD22 | 已完成 | 已完成 |
| QM9 | 已完成 | 已完成 |
| MD17 | 已完成 | 已完成 |

---
section_key: framework
section_title: 框架图
subsection_title: 3、框架图绘制进展
order: 3
---
- 框架图正在调整和完善

![框架图](assets/framework.png "w=80%")

---
section_key: multistep
section_title: 多步逆合成
subsection_title: 4、多步逆合成实验进展
order: 4
---
**消融实验进行中**

| 组别 | 权重 |
| --- | --- |
| KnowledgeGraph | KG=1.0 |
| Energy Prior | Energy=0.8 |
| Enzyme | Enzyme=0.2 |
| Memory | Memory=0.3 |
| Rollout | Rollout=0.4 |

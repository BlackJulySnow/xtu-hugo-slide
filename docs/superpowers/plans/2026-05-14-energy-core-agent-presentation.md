# Energy Core Agent Presentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a 20-slide presentation deck using Hugo for the "Energy Core Agent" research, following the approved design specification.

**Architecture:** Hugo static site generator with slide-specific markdown files in `content/energy-core-agent-presentation/`.

**Tech Stack:** Hugo, Markdown (Frontmatter), CSS (via existing project templates).

---

### Task 1: Setup Deck Structure

**Files:**
- Create: `content/energy-core-agent-presentation/_index.md`

- [ ] **Step 1: Create index file**

```yaml
---
title: Energy-centric Multi-agent Framework for Hierarchical Retrosynthesis
presenter: Energy Core Agent Group
report_date: 2026-05-14
summary: 将 BDE/BDFE 转化为统一的能量语言，通过全局热力学一致性检查实现逆合成路线规划。
---
```

### Task 2: Create Slide Content (Slides 1-10)

**Files:**
- Modify: `content/energy-core-agent-presentation/` (Create files 01-xx.md ... 10-xx.md)

- [ ] **Step 1: Create slides 1 to 10 based on the design spec.**
(Create files following `section_key`, `section_title`, `subsection_title`, `order` frontmatter rules)

### Task 3: Create Slide Content (Slides 11-20)

**Files:**
- Modify: `content/energy-core-agent-presentation/` (Create files 11-xx.md ... 20-xx.md)

- [ ] **Step 1: Create slides 11 to 20 based on the design spec.**

### Task 4: Final Review & Export Test

**Files:**
- None

- [ ] **Step 1: Run build**
Command: `npm run build`

- [ ] **Step 2: Export PDF**
Command: `npm run export-pdf -- --deck energy-core-agent-presentation`

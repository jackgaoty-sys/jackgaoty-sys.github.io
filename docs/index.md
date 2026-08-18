---
layout: home

hero:
  name: TAT 的技术笔记
  text: "Programs must be written for people to read, and only incidentally for machines to execute."
  tagline: —— Abelson & Sussman，《SICP》初版前言

features:
  - title: Agent 系统设计 · 意图识别
    details: 意图识别是 Agent 的需求工程 —— 它要调用工具、改变外部状态，所以行动之前必须先弄清用户到底想达成什么。比起给请求贴固定标签，更实用的是「业务对象 + 动作 = 意图」这样一份可更新的任务模型。
    link: /learn/agentic-system-design/01-intent-recognition
    linkText: 读这篇
---

<!--
这里是「精选」，放你最想让人先读到的几篇，不是目录 ——
目录在顶部导航里，重复一遍没有意义。

写出满意的新笔记就换掉或补一张，保持 1 到 3 张。
超过 3 张首页会变长，反而没有重点。
-->


## 我在写什么

1986 年，Fred Brooks 在 No Silver Bullet—Essence and Accidents of Software Engineering 中区分了软件开发的“本质复杂性”和“偶然复杂性”：真正困难的从来不只是写出代码，而是理解需求、建立正确的概念模型，并在各种约束中作出设计取舍。

我认为AI不是那颗消除这些困难的银弹。它只是降低了“如何实现”的成本，也让“应该实现什么、为什么这样实现”变得更加重要。
因此，我希望每篇笔记至少回答三个问题：

- **它在解决什么问题？**——弄清使用场景、边界条件，以及不可妥协的约束。
- **它为什么这样设计？**——还原可能的实现路径，权衡当前选择的收益与代价。
- **它还能解决什么？**—— 提炼可迁移的技术与思想，将其延展到新的问题域。

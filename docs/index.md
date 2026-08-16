---
layout: home

hero:
  name: 高天杨
  text: 读源码，不读文档
  tagline: AI 应用与交付方向 · 这里是我拆解生产级项目的过程，包括推错的地方
  actions:
    - theme: brand
      text: 拆解 Pi Agent
      link: /pi/
    - theme: alt
      text: GitHub
      link: https://github.com/jackgaoty-sys

features:
  - title: 拆解 Pi Agent Harness
    details: 一个真实的 TypeScript Agent 框架，从主循环、工具执行、上下文压缩到多模型抽象，逐层读下来。目标不是"看过"，是能用大白话讲出来。
    link: /pi/
    linkText: 进入笔记
  - title: 我关心的问题
    details: 玩具 loop 和生产 loop 差的那几百行到底在处理什么？答案基本都是"现实的脏"——截断、中断、换模型、叫停。这也是交付岗每天面对的东西。
---

<!--
待你补充的部分：

1. hero.tagline —— 换成你自己的一句话，现在这句是占位。
2. features —— 再加一张卡片指向 agent-jobcopilot 项目（等它公开后）。
3. 下面可以加一段「关于我」：背景、在找什么岗位、联系方式。
   home 布局支持在 frontmatter 之后直接写 markdown，会渲染在 features 下方。
-->

---
layout: home

hero:
  name: TAT 的技术笔记
  text: "Programs must be written for people to read, and only incidentally for machines to execute."
  tagline: —— Abelson & Sussman，《SICP》初版前言

features:
  - title: 源码拆解
    details: 读别人写的生产级代码，一级一级往下拆。目前在拆 Pi Agent —— 一个真实的 TypeScript Agent Harness。
    link: /teardown/
    linkText: 进去看
  - title: 学习路线
    details: 系统地学一门东西，从不会到能用，把过程记下来。
    link: /learn/
    linkText: 进去看
  - title: 散篇
    details: 不成系列的短文：踩过的坑、想明白的问题、工具链上的小结论。
    link: /posts/
    linkText: 看看
  - title: 关于我
    details: 我是谁、在找什么方向的机会、怎么联系我。
    link: /about
    linkText: 了解
---

## 我在写什么

1986 年，Fred Brooks 在 No Silver Bullet—Essence and Accidents of Software Engineering 中区分了软件开发的“本质复杂性”和“偶然复杂性”：真正困难的从来不只是写出代码，而是理解需求、建立正确的概念模型，并在各种约束中作出设计取舍。

我认为AI不是那颗消除这些困难的银弹。它只是降低了“如何实现”的成本，也让“应该实现什么、为什么这样实现”变得更加重要。
因此，我希望每篇笔记至少回答三个问题：

- **它在解决什么问题？**——弄清使用场景、边界条件，以及不可妥协的约束。
- **它为什么这样设计？**——还原可能的实现路径，权衡当前选择的收益与代价。
- **它还能解决什么？**—— 提炼可迁移的技术与思想，将其延展到新的问题域。

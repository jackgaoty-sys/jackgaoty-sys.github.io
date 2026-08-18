# 拆解 Pi Agent：学习笔记

源码来自 [earendil-works/pi](https://github.com/earendil-works/pi)，我 fork 了一份在
[jackgaoty-sys/pi-Learn-by-deconstructing](https://github.com/jackgaoty-sys/pi-Learn-by-deconstructing)。

这里记录我逐层拆解这个 Agent Harness 的过程 —— 不是抄文档，是自己读源码、自己推、自己写。

## 仓库地图

三层洋葱，从内到外：

```
packages/ai            最内层：把 OpenAI / Anthropic / Google 抹平成一套 API
      ↑
packages/agent         中间层：agent loop（多步循环 + 工具调用 + 上下文管理）
      ↑
packages/coding-agent  最外层：CLI 外壳、TUI、扩展、配置
```

其余包（tui / server / protocol / session-backends / telemetry / evals / client）暂时不看。

## 路线图

| # | 主题 | 源码落点 | 笔记 | 状态 |
|---|------|---------|------|------|
| 1 | Agent 主循环 | `packages/agent/src/agent-loop.ts` | 整理中 | 🚧 进行中 |
| 2 | 工具的定义与执行 | `packages/agent/src/harness/tools/` | — | 🔲 |
| 3 | 上下文管理与压缩 | `harness/session/`、`harness/compaction/` | — | 🔲 |
| 4 | 多模型统一抽象 | `packages/ai/src/providers/` | — | 🔲 |
| 5 | 系统提示词与 Skills | `harness/system-prompt.ts`、`skills.ts` | — | 🔲 |
| 6 | CLI 外壳怎么包 | `packages/coding-agent/src/` | — | 🔲 |

状态图例：🔲 未开始 ｜ 🚧 进行中 ｜ ✅ 读完并能讲出来

## 源码出处与许可

本系列笔记中引用的所有源码来自 [earendil-works/pi](https://github.com/earendil-works/pi)，
以 MIT 许可证发布：

> MIT License — Copyright (c) 2025 Mario Zechner
>
> 完整许可证文本见[上游仓库 LICENSE](https://github.com/earendil-works/pi/blob/main/LICENSE)。

笔记正文（我写的分析、图表、推导过程）版权归我所有。

## 我给自己定的规矩

1. **一次只推进一级**，不跳级。
2. 每级的结业标准：**能用大白话把它讲给不懂技术的人听**，而不是"看过了"。
3. 看不懂的类型定义先跳过，**只追控制流和数据流**。
4. 笔记里必须有**我自己推错的地方**，错的过程比对的结论值钱。

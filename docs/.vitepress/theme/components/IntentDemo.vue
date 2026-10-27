<script setup lang="ts">
import { computed, ref } from 'vue'

// 《01 · 意图识别》里的小演示：输入一句求职需求，按「业务对象 + 动作 = 意图」拆开。
// 规则版：用关键词近似，意图体系和文章里的表格一致。认不出来就给「需要追问」，不硬贴标签。
// 真实系统里这一步交给 LLM 按任务模型输出结构化结果 —— 组件底部写明了这一点。

interface Rule {
  intent: string
  action: string
  test: RegExp
  /** 从句子里删掉的动作词，剩下的就是业务对象；不写就整句当对象（问的是「我」自己的事） */
  strip?: RegExp
}

// 顺序就是优先级：越具体的越靠前。「搜索」放最后 —— 「找」这个字太常见，
// 「三个月内找到实习，该定什么目标」问的是目标，不是让你去搜
const RULES: Rule[] = [
  { intent: '职位分析-匹配度分析', action: '分析', test: /匹配|胜任|够不够格|我和.*(岗位|职位)/ },
  { intent: '职位分析-JD 解析', action: '解析', test: /JD|职位描述|岗位要求|核心职责|硬性要求|拆解/i, strip: /拆解|解析|分析/g },
  {
    intent: '职位发现-筛选',
    action: '筛选',
    test: /只保留|只要|只看|筛选|筛出|过滤|去掉|排除/,
    strip: /只保留|只要|只看|筛选出?|筛出|过滤出?|去掉|排除/g,
  },
  { intent: '职业定位-目标设定', action: '规划', test: /设定.*目标|阶段目标|目标是|规划|计划/ },
  { intent: '职业定位-能力差距', action: '评估', test: /缺少|差距|还差|欠缺|需要补|补什么/ },
  { intent: '职业定位-方向探索', action: '探索', test: /适合做|还是.*(好|适合)|转行|方向/ },
  {
    intent: '职位发现-搜索',
    action: '搜索',
    test: /找|搜|列出|查一下|有哪些.*(岗位|职位|实习)|推荐.*(岗位|职位|实习)/,
    strip: /找到?|搜索?|列出来|列出|查一下|推荐/g,
  },
]

// 客套话和语气词
const FILLER = /^(请|麻烦|能不能|可以|你|帮我|帮忙|给我|把)+|一下|一些|吗|呢|吧|[？?。！!]+$/g
// 指代前文：这些、这个、它们……
const REFER = /这些|这个|这份|它们|上面|刚才|以上/

interface Need {
  object: string
  action: string
  intent: string
  dependsOn: number | null
}

function parse(text: string): Need[] {
  const clauses = text
    .split(/[，,；;]?\s*(?:并且|并|然后|再|同时|接着)\s*|[；;。]/)
    .map((c) => c.trim())
    .filter(Boolean)

  const needs: Need[] = []
  for (const clause of clauses) {
    const rule = RULES.find((r) => r.test.test(clause))
    const prev = needs.length ? needs.length : null // 上一条需求的编号（从 1 开始）
    // 指代前文，或者「筛选 / 匹配」紧跟在搜索后面，都算依赖上一条的结果
    const dependsOn =
      prev && (REFER.test(clause) || (rule && /筛选|匹配/.test(rule.intent) && /搜索/.test(needs[prev - 1].intent)))
        ? prev
        : null

    let object = clause.replace(FILLER, '')
    if (rule?.strip) object = object.replace(rule.strip, '').replace(FILLER, '')
    object = object.trim()
    if (rule?.intent.endsWith('匹配度分析')) {
      object = dependsOn ? '用户与检索到的岗位' : '用户与目标岗位'
    }
    needs.push({
      object: object || '（没说清楚）',
      action: rule?.action ?? '？',
      intent: rule?.intent ?? '需要追问：没法归入已有意图，先问清楚用户想达成什么',
      dependsOn,
    })
  }
  return needs
}

const EXAMPLES = [
  '帮我把北京接受应届生的岗位列出来',
  '帮我找一些上海的初级 AI 产品经理岗位，并分析我和这些岗位的匹配度',
  '帮我找多伦多的 AI 开发实习，再只保留不要求三年经验的',
  '我适合做产品经理还是数据分析？',
  '最近有点焦虑',
]

const input = ref(EXAMPLES[1])
const needs = computed(() => parse(input.value))
</script>

<template>
  <div class="sx-intent">
    <div class="bar" aria-hidden="true"><i /><i /><i /><span>intent-demo</span></div>
    <div class="body">
      <label class="prompt">
        <span class="ps">$</span>
        <input v-model="input" type="text" spellcheck="false" placeholder="输入一句求职需求试试" aria-label="输入一句求职需求" />
      </label>
      <div class="examples">
        <button v-for="ex in EXAMPLES" :key="ex" type="button" :class="{ on: ex === input }" @click="input = ex">
          {{ ex }}
        </button>
      </div>

      <div v-if="needs.length" class="out" aria-live="polite">
        <div v-for="(n, i) in needs" :key="i" class="need">
          <p v-if="needs.length > 1" class="need-title">需求{{ i + 1 }}：</p>
          <p><span class="k">对象：</span>{{ n.object }}</p>
          <p><span class="k">动作：</span>{{ n.action }}</p>
          <p :class="{ ask: n.action === '？' }"><span class="k">意图：</span>{{ n.intent }}</p>
          <p v-if="n.dependsOn"><span class="k">依赖：</span>需求{{ n.dependsOn }}的结果</p>
        </div>
      </div>

      <p class="note">规则版演示：用关键词近似「对象 + 动作」的拆法。真实系统里这一步交给 LLM，按任务模型输出结构化结果。</p>
    </div>
  </div>
</template>

<style scoped>
.sx-intent {
  margin: 20px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--sx-term-bg);
  overflow: hidden;
  font-family: var(--vp-font-family-mono);
}
.bar {
  display: flex; align-items: center; gap: 7px;
  padding: 0 14px; height: 34px; border-bottom: 1px solid var(--vp-c-divider);
  font-size: 12px; color: var(--vp-c-text-3);
}
.bar i { width: 10px; height: 10px; border-radius: 50%; background: var(--vp-c-divider); }
.bar span { margin-left: 8px; }
.body { padding: 16px 18px 14px; }

.prompt { display: flex; align-items: center; gap: 8px; }
.ps { color: var(--vp-c-brand-1); }
.prompt input {
  flex: 1; min-width: 0;
  padding: 6px 0; border: 0; border-bottom: 1px solid var(--vp-c-divider);
  background: transparent; color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-base); font-size: 15px;
  outline: none; transition: border-color 0.2s;
}
.prompt input:focus { border-bottom-color: var(--vp-c-brand-1); }

.examples { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0 4px; }
.examples button {
  max-width: 100%;
  padding: 2px 8px; border-radius: 4px; border: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-base); font-size: 12px; color: var(--vp-c-text-2);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  cursor: pointer; transition: border-color 0.15s, color 0.15s;
}
.examples button:hover { color: var(--vp-c-text-1); border-color: var(--vp-c-text-3); }
.examples button.on { color: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); }
/* 触屏：示例按钮撑到 44px 高 */
@media (pointer: coarse) {
  .examples button { min-height: 44px; padding: 0 12px; }
}

.out { margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--vp-c-divider); font-size: 13.5px; }
.need + .need { margin-top: 12px; }
.out p { margin: 0; line-height: 1.9; color: var(--vp-c-text-1); }
.need-title { color: var(--vp-c-text-2) !important; }
.need-title ~ p { padding-left: 1em; }
.k { color: var(--vp-c-text-3); }
.ask { color: var(--c-wip) !important; }

.note { margin: 14px 0 0; font-family: var(--vp-font-family-base); font-size: 12px; line-height: 1.7; color: var(--vp-c-text-3); }
</style>

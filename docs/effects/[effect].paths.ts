import { effectDocs } from '../data/effects'

export default {
  paths() {
    return effectDocs.map((effect) => ({
      params: {
        effect: effect.id,
      },
      content: `---
layout: page
sidebar: false
outline: false
title: ${JSON.stringify(effect.zh.name)}
description: ${JSON.stringify(effect.zh.description)}
---

<EffectPage effect-id="${effect.id}" locale="zh" />
`,
    }))
  },
}

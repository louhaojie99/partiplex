import { effectDocs } from '../../data/effects'

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
title: ${JSON.stringify(effect.en.name)}
description: ${JSON.stringify(effect.en.description)}
---

<EffectPage effect-id="${effect.id}" locale="en" />
`,
    }))
  },
}

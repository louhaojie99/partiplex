import { defineConfig } from 'vitepress'
import { effectDocs } from '../data/effects'

const base = process.env.DOCS_BASE ?? '/'
const github = 'https://github.com/louhaojie99/partiplex'

const zhEffects = effectDocs.map((effect) => ({
  text: effect.zh.name,
  link: `/effects/${effect.id}`,
}))
const enEffects = effectDocs.map((effect) => ({
  text: effect.en.name,
  link: `/en/effects/${effect.id}`,
}))

export default defineConfig({
  title: 'Partiplex',
  description: '20 cinematic Canvas backgrounds for TypeScript, Vue, and React.',
  base,
  cleanUrls: true,
  transformPageData(pageData) {
    const effect = effectDocs.find((item) => item.id === pageData.params?.effect)
    if (!effect) return
    const copy = pageData.relativePath.startsWith('en/') ? effect.en : effect.zh
    return { title: copy.name, description: copy.description }
  },
  head: [
    ['meta', { name: 'theme-color', content: '#050505' }],
    ['meta', { name: 'color-scheme', content: 'dark light' }],
  ],
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'Partiplex',
      description: '面向 TypeScript、Vue 与 React 的 20 个 Canvas 背景。',
      themeConfig: {
        nav: [
          { text: '开始', link: '/guide/start' },
          { text: '效果', link: '/effects/' },
          { text: 'API', link: '/api' },
        ],
        sidebar: {
          '/guide/': [
            { text: '快速开始', link: '/guide/start' },
            { text: 'Vue', link: '/guide/vue' },
            { text: 'React', link: '/guide/react' },
          ],
          '/effects/': [{ text: '全部效果', link: '/effects/' }, ...zhEffects],
          '/api': [{ text: 'API 参考', link: '/api' }],
        },
        outline: { label: '目录' },
        docFooter: { prev: '上一页', next: '下一页' },
        search: { provider: 'local' },
        socialLinks: [{ icon: 'github', link: github }],
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      title: 'Partiplex',
      description: '20 Canvas backgrounds for TypeScript, Vue, and React.',
      themeConfig: {
        nav: [
          { text: 'Start', link: '/en/guide/start' },
          { text: 'Effects', link: '/en/effects/' },
          { text: 'API', link: '/en/api' },
        ],
        sidebar: {
          '/en/guide/': [
            { text: 'Quick start', link: '/en/guide/start' },
            { text: 'Vue', link: '/en/guide/vue' },
            { text: 'React', link: '/en/guide/react' },
          ],
          '/en/effects/': [{ text: 'All effects', link: '/en/effects/' }, ...enEffects],
          '/en/api': [{ text: 'API reference', link: '/en/api' }],
        },
        search: { provider: 'local' },
        socialLinks: [{ icon: 'github', link: github }],
      },
    },
  },
})

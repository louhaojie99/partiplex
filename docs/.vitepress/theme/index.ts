import DefaultTheme from 'vitepress/theme'
import AllEffectsGallery from '../../components/AllEffectsGallery.vue'
import EffectPage from '../../components/EffectPage.vue'
import HomePage from '../../components/HomePage.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('AllEffectsGallery', AllEffectsGallery)
    app.component('EffectPage', EffectPage)
    app.component('HomePage', HomePage)
  },
}

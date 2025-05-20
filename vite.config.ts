import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginsAutoI18n, { 
  // YoudaoTranslator, 
  GoogleTranslator, 
  // BaiduTranslator 
} from 'vite-auto-i18n-plugin'

const i18nPlugin = vitePluginsAutoI18n({
  globalPath: './lang', // 存放翻译文件的目录
  namespace: 'lang', // 命名空间
  distPath: './dist/assets',
  distKey: 'index',
  targetLangList: ['en', 'ko', 'ja'], // 目标语言列表，英文，韩文，日文
  originLang: 'zh-cn',
  // 选择翻译器，有道、谷歌或百度
  // 有道翻译
  // translator: new YoudaoTranslator({
  //     appId: '你的AppId',
  //     appKey: '你的AppKey'
  // })
  // 谷歌翻译（需配置代理）
  translator: new GoogleTranslator({
    proxyOption: {
        host: '127.0.0.1',
        port: 13385,
        headers: {
            'User-Agent': 'Node'
        }
    }
  })
  // 百度翻译
  // translator: new BaiduTranslator({
  //   appId: '你的AppId',
  //   appKey: '你的AppKey'
  // })
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    i18nPlugin
  ],
})

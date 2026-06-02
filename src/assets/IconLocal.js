/**
 * 本地图标组件 — 替代 Iconify CDN 运行时
 *
 * 工作原理：
 * 1. 使用 webpack require.context() 在构建时将所有本地 SVG 打包
 * 2. 根据 icon prop（如 "lucide:menu"）自动匹配 src/assets/icons/lucide-menu.svg
 * 3. 直接内联渲染 SVG，不依赖任何外部 CDN 或运行时
 */
import Vue from 'vue'

// 构建时批量加载所有本地图标 SVG（webpack 将内联为字符串）
const iconModules = require.context('@/assets/icons', false, /\.svg$/)
const svgCache = {}

iconModules.keys().forEach(key => {
  // key 格式: './lucide-menu.svg' → 提取 'lucide-menu'
  const name = key.replace(/^\.\//, '').replace(/\.svg$/, '')
  // 使用 raw-loader 内联 SVG 内容（需要在 vue.config.js 中配置）
  svgCache[name] = iconModules(key)
})

Vue.component('Icon', {
  name: 'LocalIcon',
  props: {
    icon: {
      type: String,
      required: true
    },
    size: {
      type: [String, Number],
      default: '1em'
    },
    color: {
      type: String,
      default: ''
    }
  },
  computed: {
    // 将 "lucide:menu" 转为 "lucide-menu"
    localFileName() {
      return (this.icon || '').replace(':', '-')
    },
    svgContent() {
      return svgCache[this.localFileName]
    },
    iconSize() {
      return typeof this.size === 'number' ? `${this.size}px` : this.size
    }
  },
  render(h) {
    const svg = this.svgContent
    const inlineStyle = this.$vnode.data.style || {}
    const externalClass =
      this.$vnode.data.normalizedClass || this.$vnode.data.class || ''

    if (!svg) {
      // 找不到图标时显示占位方块
      return h('span', {
        class: ['local-icon', 'icon-missing', externalClass],
        style: Object.assign({
          display: 'inline-block',
          width: this.iconSize,
          height: this.iconSize,
          verticalAlign: '-0.125em',
          border: '1px dashed rgba(255,255,255,0.2)',
          borderRadius: '2px'
        }, inlineStyle)
      })
    }

    /**
     * 提取 SVG 中的 <svg> 标签属性并注入 size/color
     * 用正则替换 viewBox 和 style/color 属性
     */
    const styledSvg = svg
      .replace(/^<svg\b([^>]*)>/i, (match, attrs) => {
        // 保留原始 viewBox 等属性，添加 width/height 和 color
        let newAttrs = attrs
        // 移除原有的 width/height
        newAttrs = newAttrs.replace(/\s+width="[^"]*"/i, '')
        newAttrs = newAttrs.replace(/\s+height="[^"]*"/i, '')
        return `<svg${newAttrs} width="${this.iconSize}" height="${this.iconSize}"${this.color ? ` color="${this.color}"` : ''}>`
      })

    return h('span', {
      class: ['local-icon', externalClass],
      style: Object.assign({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: this.iconSize,
        height: this.iconSize,
        verticalAlign: '-0.125em',
        color: this.color || 'currentColor'
      }, inlineStyle),
      domProps: {
        innerHTML: styledSvg
      }
    })
  }
})

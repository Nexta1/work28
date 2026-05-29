import Vue from 'vue'

Vue.component('Icon', {
  name: 'IconifyIcon',
  props: {
    icon: {
      type: String,
      required: true
    },
    size: {
      type: [String, Number],
      default: '1em'
    },
    // ✨ 核心：增加一个明确的 color 属性，用来强制触发 Vue 的响应式更新
    color: {
      type: String,
      default: ''
    }
  },
  render(h) {
    const inlineStyle = this.$vnode.data.style || {}
    const inlineClass = this.$vnode.data.class || ''

    const baseStyle = {
      display: 'inline-block',
      width: typeof this.size === 'number' ? `${this.size}px` : this.size,
      height: typeof this.size === 'number' ? `${this.size}px` : this.size,
      verticalAlign: '-0.125em',
      fill: 'currentColor'
    }

    // ✨ 核心：如果传了 color 属性，其优先级最高；如果没传，则降级看外界写没写行内 style.color
    if (this.color) {
      baseStyle.color = this.color
    }

    return h('span', {
      key: this.icon,
      class: ['iconify', inlineClass].filter(Boolean).join(' '),
      attrs: {
        'data-icon': this.icon
      },
      style: Object.assign({}, baseStyle, inlineStyle)
    })
  },
  // ✨ 核心：同时监听 icon 和 color 的变化，任何一个变了，都必须通知 Iconify 重新扫描替换 DOM
  watch: {
    icon() {
      this.reScan()
    },
    color() {
      this.reScan()
    }
  },
  mounted() {
    this.scanIcon()
  },
  methods: {
    reScan() {
      this.$nextTick(() => {
        this.scanIcon()
      })
    },
    scanIcon() {
      if (window.Iconify) {
        if (typeof window.Iconify.checkAndReplace === 'function') {
          window.Iconify.checkAndReplace(this.$el)
        } else if (typeof window.Iconify.scan === 'function') {
          window.Iconify.scan(this.$el)
        }
      }
    }
  }
})

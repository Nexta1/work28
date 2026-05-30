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
    color: {
      type: String,
      default: ''
    }
  },
  render(h) {
    const inlineStyle = this.$vnode.data.style || {}

    // 🛠️ 修复核心：安全获取完整的 class（包含静态和动态绑定的 class）
    const externalClass =
      this.$vnode.data.normalizedClass || this.$vnode.data.class || ''

    const baseStyle = {
      display: 'inline-block',
      width: typeof this.size === 'number' ? `${this.size}px` : this.size,
      height: typeof this.size === 'number' ? `${this.size}px` : this.size,
      verticalAlign: '-0.125em',
      fill: 'currentColor'
    }

    if (this.color) {
      baseStyle.color = this.color
    }

    return h('span', {
      key: this.icon,
      // 🛠️ 合并基础类名与外界传入的动态/静态类名
      class: ['iconify', externalClass],
      attrs: {
        'data-icon': this.icon
      },
      style: Object.assign({}, baseStyle, inlineStyle)
    })
  },
  watch: {
    icon() {
      this.reScan()
    },
    color() {
      this.reScan()
    },
    // 🛠️ 监听外部绑定的动态类名变化，强行触发 Iconify 扫描，确保动画类名不丢失
    '$vnode.data.normalizedClass'() {
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

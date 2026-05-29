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
    }
  },
  render(h) {
    // 关键优化：给元素加一个 key，每次 icon 改变时强行让 Vue 重新创建这个 DOM
    // 这样 Iconify 就能百分之百监听到新 DOM 并进行替换
    return h('span', {
      key: this.icon,
      class: 'iconify',
      attrs: {
        'data-icon': this.icon
      },
      style: {
        display: 'inline-block',
        width: typeof this.size === 'number' ? `${this.size}px` : this.size,
        height: typeof this.size === 'number' ? `${this.size}px` : this.size,
        verticalAlign: '-0.125em'
      }
    })
  },
  watch: {
    icon() {
      this.$nextTick(() => {
        this.scanIcon()
      })
    }
  },
  mounted() {
    this.scanIcon()
  },
  methods: {
    scanIcon() {
      if (window.Iconify) {
        // 使用 checkAndReplace 更加稳妥，如果不行再降级回 scan
        if (typeof window.Iconify.checkAndReplace === 'function') {
          window.Iconify.checkAndReplace(this.$el)
        } else if (typeof window.Iconify.scan === 'function') {
          window.Iconify.scan(this.$el)
        }
      }
    }
  }
})

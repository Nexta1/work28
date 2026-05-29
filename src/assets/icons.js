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
    // 1. 获取外界在使用 <Icon :style="..." :class="..." /> 时传进来的原生样式
    const inlineStyle = this.$vnode.data.style || {}
    const inlineClass = this.$vnode.data.class || ''

    // 2. 将基础的长宽样式与外界传进来的颜色、滤镜等样式进行深度融合
    const baseStyle = {
      display: 'inline-block',
      width: typeof this.size === 'number' ? `${this.size}px` : this.size,
      height: typeof this.size === 'number' ? `${this.size}px` : this.size,
      verticalAlign: '-0.125em',
      // 核心：Iconify 变色依赖 currentColor，确保 fill 被正确继承
      fill: 'currentColor'
    }

    return h('span', {
      key: this.icon,
      // 3. 把外部传进来的 Class 和 iconify 拼接起来，方便用 Class 控制颜色
      class: ['iconify', inlineClass].filter(Boolean).join(' '),
      attrs: {
        'data-icon': this.icon
      },
      // 4. 合并样式，外界传入的 style（如 color）拥有最高优先级
      style: Object.assign({}, baseStyle, inlineStyle)
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
        if (typeof window.Iconify.checkAndReplace === 'function') {
          window.Iconify.checkAndReplace(this.$el)
        } else if (typeof window.Iconify.scan === 'function') {
          window.Iconify.scan(this.$el)
        }
      }
    }
  }
})

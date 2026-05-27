export default {
  methods: {
    normalizeList(res) {
      if (!res || !res.data) return []
      return res.data.list || res.data || []
    },
    pickRowId(row, keys) {
      for (const key of keys) {
        if (row[key] != null && row[key] !== '') return row[key]
      }
      return null
    },
    formatDateTime(val) {
      if (!val) return '--'
      const text = String(val)
      return text.length > 19 ? text.slice(0, 19) : text
    },
    mapLabel(options, value) {
      const hit = (options || []).find(
        item => Number(item.value) === Number(value)
      )
      return hit ? hit.label : value != null && value !== '' ? value : '--'
    },
    /**
     * Promise.all 统一错误捕获，避免未处理 rejection
     */
    promiseAllHandled(promises, errorTip = '数据加载失败') {
      return Promise.all(promises).catch(err => {
        console.error(err)
        if (this.$message) this.$message.error(errorTip)
        return Promise.reject(err)
      })
    }
  }
}

// src/store/index.js
import Vue from 'vue'
import Vuex from 'vuex'

// 1. 必须先通过 Vue.use() 安装插件
Vue.use(Vuex)

// 2. 创建并导出 Vuex 的实例
export default new Vuex.Store({
  // state: 存放公共数据的地方（类似于组件的 data）
  state: {
    userInfo: {
      name: '阿珍',
      level: 1
    },
    count: 0
  },

  // getters: 从 state 中派生出的数据（类似于组件的 computed 计算属性）
  getters: {
    vipDescription(state) {
      return `${state.userInfo.name} 的当前等级是: Lv.${state.userInfo.level}`
    }
  },

  // mutations: 唯一能修改 state 的地方，必须是同步函数
  mutations: {
    // 增加计数
    INCREMENT(state, payload) {
      state.count += payload
    },
    // 更新用户名
    UPDATE_NAME(state, newName) {
      state.userInfo.name = newName
    }
  },

  // actions: 负责异步操作（如发请求），不能直接修改 state，必须提交 mutation
  actions: {
    // 模拟异步升级
    asyncLevelUp({commit}) {
      setTimeout(() => {
        // 假设从后端获取了新等级，提交给 mutation 改变状态
        commit('INCREMENT', 1)
      }, 1000)
    }
  }
})

// src/store/index.js
import Vue from 'vue'
import Vuex from 'vuex'
import {getCurrentUser, login, logout} from '@/api/user'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    token: localStorage.getItem('token') || '',
    userInfo: null,
    permissions: []
  },

  getters: {
    isAuthenticated(state) {
      return !!state.token
    },
    currentUser(state) {
      return state.userInfo
    },
    userPermissions(state) {
      return state.permissions
    }
  },

  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo
      if (userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
      } else {
        localStorage.removeItem('userInfo')
      }
    },
    SET_PERMISSIONS(state, permissions) {
      state.permissions = permissions || []
    }
  },

  actions: {
    /**
     * 登录
     */
    async login({commit}, {userCode, userPassword}) {
      const res = await login({userCode, userPassword})
      if (res.code === 0 && res.data) {
        commit('SET_TOKEN', res.data)
        // 登录成功后获取用户信息（失败不阻塞，保留 token 继续跳转）
        try {
          await store.dispatch('fetchCurrentUser')
        } catch (e) {
          console.warn('获取用户信息失败，已保留登录状态:', e)
        }
        return true
      }
      throw new Error(res.message || '登录失败')
    },

    /**
     * 获取当前用户信息
     */
    async fetchCurrentUser({commit}) {
      try {
        const res = await getCurrentUser()
        if (res.code === 0 && res.data) {
          const user = res.data
          commit('SET_USER_INFO', {
            userId: user.userId,
            userCode: user.userCode,
            name: user.userName,
            role: user.roleNames || '普通用户',
            mobile: user.userMobile
          })
          const perms = user.userPrivs || []

          commit('SET_PERMISSIONS', perms)
          return user
        }
      } catch (e) {
        // token 失效，清除登录状态（但登录流程中由 login action 自行处理，勿重复清除）
        console.warn('获取当前用户信息失败:', e)
        commit('SET_USER_INFO', null)
        commit('SET_PERMISSIONS', [])
      }
      return null
    },

    /**
     * 退出登录
     */
    async logout({commit}) {
      try {
        await logout()
      } catch {
        // 忽略退出接口异常
      }
      commit('SET_TOKEN', '')
      commit('SET_USER_INFO', null)
      commit('SET_PERMISSIONS', [])
      window.location.href = '/login'
    },

    /**
     * 从 localStorage 恢复登录状态
     */
    restoreSession({commit}) {
      const token = localStorage.getItem('token')
      const saved = localStorage.getItem('userInfo')
      if (token) {
        commit('SET_TOKEN', token)
      }
      if (saved) {
        try {
          commit('SET_USER_INFO', JSON.parse(saved))
        } catch {
          localStorage.removeItem('userInfo')
        }
      }
    }
  }
})

export default store

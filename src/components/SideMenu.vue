<template>
  <aside
    class="left-menu"
    :class="{visible: visible}"
    @mouseleave="$emit('update:visible', false)"
  >
    <div class="menu-header">
      <div class="menu-title">体系运控分系统</div>
      <button class="collapse-btn" @click="$emit('update:visible', !visible)">
        <Icon icon="lucide:chevron-left" :size="16" />
      </button>
    </div>

    <div class="menu-content">
      <div
        v-for="subsystem in subsystems"
        :key="subsystem"
        class="subsystem-block"
      >
        <div class="subsystem-title">
          <span class="subsystem-text">{{ subsystem }}</span>
        </div>

        <transition name="menu-expand">
          <div class="modules-container">
            <div
              v-for="category in getCategoriesBySubsystem(subsystem)"
              :key="category"
              class="module-group"
            >
              <template v-if="getModuleRoutes(subsystem, category).length > 0">
                <div
                  v-for="moduleRoute in getModuleRoutes(subsystem, category)"
                  :key="moduleRoute.path"
                  class="module-item"
                  :class="{
                    active:
                      getSubRoutes(category).length === 0 &&
                      $route.path === moduleRoute.path
                  }"
                  @click="handleModuleClick(moduleRoute, category)"
                >
                  <Icon
                    :icon="moduleRoute.meta.icon || 'lucide:box'"
                    :size="18"
                    class="nav-icon"
                  />

                  <span class="nav-text">
                    {{ moduleRoute.meta.title }}
                  </span>

                  <Icon
                    v-if="getSubRoutes(category).length > 0"
                    icon="lucide:chevron-right"
                    :size="14"
                    class="module-arrow"
                    :class="{expanded: isCategoryExpanded(category)}"
                  />
                </div>

                <transition name="menu-expand">
                  <div
                    v-if="
                      isCategoryExpanded(category) &&
                      getSubRoutes(category).length > 0
                    "
                    class="sub-items-container"
                  >
                    <router-link
                      v-for="subRoute in getSubRoutes(category)"
                      :key="subRoute.path"
                      :to="subRoute.path"
                      class="nav-item"
                      :class="{active: $route.path === subRoute.path}"
                      @click.native="$emit('update:visible', false)"
                    >
                      <Icon
                        :icon="subRoute.meta.icon || 'lucide:file-text'"
                        :size="16"
                        class="nav-icon"
                      />

                      <span class="nav-text">
                        {{ subRoute.meta.title }}
                      </span>
                    </router-link>
                  </div>
                </transition>
              </template>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'SideMenu',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      collapsedCategories: {},
      collapsedSubsystems: {}
    }
  },
  computed: {
    subsystems() {
      return ['体系运营管理', '资源和数据管理', '系统运维']
    }
  },
  methods: {
    handleModuleClick(moduleRoute, category) {
      const hasSubRoutes = this.getSubRoutes(category).length > 0
      if (hasSubRoutes) {
        this.toggleCategory(category)
      } else {
        if (this.$route.path !== moduleRoute.path) {
          this.$router.push(moduleRoute.path)
        }
        this.$emit('update:visible', false)
      }
    },

    toggleCategory(category) {
      this.$set(
        this.collapsedCategories,
        category,
        !this.collapsedCategories[category]
      )
    },

    isCategoryExpanded(category) {
      return !this.collapsedCategories[category]
    },

    toggleSubsystem(subsystem) {
      this.$set(
        this.collapsedSubsystems,
        subsystem,
        !this.collapsedSubsystems[subsystem]
      )
    },

    isSubsystemCollapsed(subsystem) {
      return !!this.collapsedSubsystems[subsystem]
    },

    getCategoriesBySubsystem(subsystem) {
      const routes = this.$router.getRoutes()
      const categories = new Set()
      routes.forEach(route => {
        if (
          route.meta &&
          route.meta.isVisible !== false &&
          route.meta.subsystem === subsystem &&
          route.meta.category
        ) {
          categories.add(route.meta.category)
        }
      })
      return Array.from(categories)
    },

    getModuleRoutes(subsystem, category) {
      return this.$router
        .getRoutes()
        .filter(
          route =>
            route.meta &&
            route.meta.isVisible !== false &&
            route.meta.subsystem === subsystem &&
            route.meta.category === category &&
            route.meta.isModule
        )
    },

    getSubRoutes(module) {
      return this.$router
        .getRoutes()
        .filter(
          route =>
            route.meta &&
            route.meta.isVisible !== false &&
            route.meta.parentModule === module
        )
    }
  }
}
</script>

<style scoped>
.left-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 680px;
  height: 100vh;
  z-index: 10000;
  background: linear-gradient(180deg, #0b1220 0%, #070b14 100%);
  border-right: 1px solid rgba(120, 210, 255, 0.12);
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 30px rgba(0, 0, 0, 0.5);
  transform: translateX(-100%);
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.left-menu.visible {
  transform: translateX(0);
}

.left-menu * {
  white-space: nowrap;
}

.menu-header {
  height: 64px;
  flex-shrink: 0;
  padding: 0 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(120, 210, 255, 0.08);
  background: rgba(255, 255, 255, 0.015);
}

.menu-title {
  color: #eef7ff;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  margin-right: 12px;
}

.menu-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 8px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
  align-items: start;
}

.subsystem-block {
  margin-bottom: 4px;
}

.subsystem-title {
  padding: 10px 10px 8px;
  color: #7cecff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
  gap: 6px;
}

.subsystem-title:hover {
  background: rgba(124, 236, 255, 0.03);
}

.module-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 6px;
  padding: 8px 10px;
  border-radius: 8px;
  color: #aebed1;
  font-size: 12px;
  border: 1px solid transparent;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.module-item:hover {
  background: rgba(124, 236, 255, 0.08);
  color: #ffffff;
  border-color: rgba(124, 236, 255, 0.12);
}

.module-item.active {
  background: rgba(0, 243, 255, 0.12);
  color: #7cecff;
  border-color: rgba(124, 236, 255, 0.16);
  box-shadow: 0 0 8px rgba(0, 243, 255, 0.06);
}

.module-item.active .nav-icon {
  color: #38bdf8 !important;
  filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.7)) !important;
}

.module-arrow {
  margin-left: auto;
  flex-shrink: 0;
  transition:
    transform 0.2s ease,
    color 0.15s ease !important;
}

.module-arrow.expanded {
  transform: rotate(90deg) !important;
}

.sub-items-container {
  overflow: hidden;
  padding-left: 12px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 3px 6px 3px 18px;
  padding: 7px 8px;
  border-radius: 6px;
  color: #8a98ad;
  text-decoration: none;
  border: 1px solid transparent;
  font-size: 11px;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(124, 236, 255, 0.06);
  color: #b8c5d4;
  border-color: rgba(124, 236, 255, 0.1);
}

.nav-item.active {
  background: rgba(0, 243, 255, 0.12);
  color: #7cecff;
  border-color: rgba(124, 236, 255, 0.16);
  box-shadow: 0 0 8px rgba(0, 243, 255, 0.06);
}

.nav-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nav-text {
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-expand-enter-active,
.menu-expand-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease,
    max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  transform-origin: top;
}

.menu-expand-enter,
.menu-expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
  max-height: 0 !important;
}

.menu-expand-enter-to,
.menu-expand-leave {
  opacity: 1;
  transform: translateY(0);
  max-height: 1200px;
}

.module-item .nav-icon {
  color: #94a3b8 !important;
  transition:
    color 0.15s ease-in-out,
    filter 0.15s ease-in-out;
}

.module-item:hover .nav-icon {
  color: #06b6d4 !important;
  filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.6));
}

.module-arrow {
  color: #94a3b8 !important;
}

.module-arrow.expanded {
  color: #38bdf8 !important;
  filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.4));
}

.nav-item .nav-icon {
  color: #94a3b8 !important;
  transition: all 0.15s ease-in-out;
}

.nav-item:hover .nav-icon {
  color: #cbd5e1 !important;
}

.nav-item.active .nav-icon {
  color: #38bdf8 !important;
  filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.7)) !important;
}

.collapse-btn {
  background: rgba(6, 182, 212, 0.08) !important;
  border: 1px solid rgba(6, 182, 212, 0.2) !important;
  color: #06b6d4 !important;
}

.collapse-btn:hover {
  background: #06b6d4 !important;
  color: #03060c !important;
  box-shadow: 0 0 11px rgba(6, 182, 212, 0.4) !important;
}
</style>

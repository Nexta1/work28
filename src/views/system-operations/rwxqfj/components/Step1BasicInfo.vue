<template>
  <div style="flex: 1; display: flex; flex-direction: column; min-height: 0">
    <div class="card-title-2" style="flex-shrink: 0">1. 基础作战任务信息</div>
    <el-tabs
      v-model="activeTab"
      class="left-tabs"
      style="flex: 1; display: flex; flex-direction: column; min-height: 0"
    >
      <el-tab-pane label="作战编成" name="formation">
        <div class="tab-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 22%">平台</th>
                <th style="width: 16%">类型</th>
                <th>通信装备</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in pagedFormation" :key="i">
                <td>{{ row.platform }}</td>
                <td>{{ row.type }}</td>
                <td>{{ row.equipment }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="tab-pagination">
          <el-pagination
            small
            layout="total,prev,pager,next"
            :total="formationTotal"
            :page-size="formationPageSize"
            :current-page.sync="formationPage"
            @current-change="handleFormationPageChange"
          />
        </div>
      </el-tab-pane>
      <el-tab-pane label="作战行动路线" name="route">
        <div class="tab-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>点位名称</th>
                <th>经度</th>
                <th>纬度</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(pt, i) in pagedRoute" :key="i">
                <td>{{ pt.id }}</td>
                <td>{{ pt.name }}</td>
                <td>{{ pt.lng }}</td>
                <td>{{ pt.lat }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="tab-pagination">
          <el-pagination
            small
            layout="total,prev,pager,next"
            :total="routeTotal"
            :page-size="routePageSize"
            :current-page.sync="routePage"
            @current-change="handleRoutePageChange"
          />
        </div>
      </el-tab-pane>
      <el-tab-pane label="作战区域" name="area">
        <div class="tab-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>转向点</th>
                <th>经度</th>
                <th>纬度</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(area, i) in pagedAreas" :key="i">
                <td>{{ area.id }}</td>
                <td>{{ area.name }}</td>
                <td>{{ area.lng }}</td>
                <td>{{ area.lat }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="tab-pagination">
          <el-pagination
            small
            layout="total,prev,pager,next"
            :total="areaTotal"
            :page-size="areaPageSize"
            :current-page.sync="areaPage"
            @current-change="handleAreaPageChange"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import {
  getFormationPage,
  getRoutePointPage,
  getAreaPointPage
} from '@/api/datalinkAssurance'

export default {
  name: 'Step1BasicInfo',
  props: {
    zzrwid: {type: Number, default: 22}
  },
  data() {
    return {
      activeTab: 'formation',
      formationPage: 1,
      routePage: 1,
      areaPage: 1,
      formationPageSize: 10,
      routePageSize: 10,
      areaPageSize: 10,
      formationData: [],
      formationTotal: 0,
      routePoints: [],
      routeTotal: 0,
      combatAreas: [],
      areaTotal: 0,
      loading: {formation: false, route: false, area: false}
    }
  },
  computed: {
    pagedFormation() {
      return this.formationData
    },
    pagedRoute() {
      return this.routePoints
    },
    pagedAreas() {
      return this.combatAreas
    }
  },
  watch: {
    zzrwid() {
      this.loadAll()
    }
  },
  mounted() {
    this.loadAll()
  },
  methods: {
    loadAll() {
      this.fetchFormationData()
      this.fetchRouteData()
      this.fetchAreaData()
    },
    async fetchFormationData() {
      this.loading.formation = true
      try {
        const res = await getFormationPage({
          pageNum: this.formationPage,
          pageSize: this.formationPageSize,
          params: {ZZRWID: this.zzrwid}
        })
        const list = res.data?.list || res.data || []
        this.formationData = list.map(d => ({
          platform: d.PTMC || '',
          type: this.getPlatformType(d.PTLX),
          equipment: d.SBMCS || ''
        }))
        this.formationTotal = res.data?.total || list.length
      } catch (e) {
        console.error('获取作战编成失败', e)
        this.formationData = []
      } finally {
        this.loading.formation = false
      }
    },
    async fetchRouteData() {
      this.loading.route = true
      try {
        const res = await getRoutePointPage({
          pageNum: this.routePage,
          pageSize: this.routePageSize,
          params: {ZZRWID: this.zzrwid}
        })
        const list = res.data?.list || res.data || []
        this.routePoints = list.map(d => ({
          id: d.pointIndex,
          name: d.pointName || '',
          lng: d.JD?.toFixed(1),
          lat: d.WD?.toFixed(1)
        }))
        this.routeTotal = res.data?.total || list.length
      } catch (e) {
        console.error('获取作战线路失败', e)
        this.routePoints = []
      } finally {
        this.loading.route = false
      }
    },
    async fetchAreaData() {
      this.loading.area = true
      try {
        const res = await getAreaPointPage({
          pageNum: this.areaPage,
          pageSize: this.areaPageSize,
          params: {ZZRWID: this.zzrwid}
        })
        const list = res.data?.list || res.data || []
        this.combatAreas = list.map(d => ({
          id: d.WZDXH,
          name: d.WZDMC || '',
          lng: d.JD?.toFixed(1),
          lat: d.WD?.toFixed(1)
        }))
        this.areaTotal = res.data?.total || list.length
      } catch (e) {
        console.error('获取作战区域失败', e)
        this.combatAreas = []
      } finally {
        this.loading.area = false
      }
    },
    getPlatformType(lx) {
      const map = {
        1: '指控平台',
        2: '舰艇平台',
        3: '航空平台',
        4: '特种飞机',
        5: '弹载平台',
        6: '星载平台'
      }
      return map[lx] || lx || ''
    },
    handleFormationPageChange(page) {
      this.formationPage = page
      this.fetchFormationData()
    },
    handleRoutePageChange(page) {
      this.routePage = page
      this.fetchRouteData()
    },
    handleAreaPageChange(page) {
      this.areaPage = page
      this.fetchAreaData()
    }
  }
}
</script>

<style scoped>
.card-title-2 {
  font-size: 13px;
  font-weight: bold;
  color: var(--color-cyan);
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.12);
  flex-shrink: 0;
  letter-spacing: 0.5px;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
}
.data-table th {
  background: rgba(5, 11, 20, 0.8);
  color: var(--color-primary);
  height: 28px;
  border: 1px solid rgba(30, 41, 59, 0.5);
  font-weight: 600;
  letter-spacing: 0.3px;
  padding: 3px 5px;
}
.data-table td {
  height: 24px;
  text-align: center;
  border: 1px solid rgba(30, 41, 59, 0.4);
  color: var(--color-text-main);
  padding: 2px 5px;
}
.data-table tbody tr:hover td {
  background: rgba(56, 189, 248, 0.06);
  color: #fff;
}
.tab-table-wrap {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}
.tab-table-wrap::-webkit-scrollbar {
  width: 3px;
}
.tab-table-wrap::-webkit-scrollbar-thumb {
  background: rgba(56, 189, 248, 0.2);
  border-radius: 3px;
}
.tab-pagination {
  flex-shrink: 0;
  padding-top: 6px;
  display: flex;
  justify-content: center;
}
.el-tabs >>> .el-tabs__header {
  margin-bottom: 6px;
  border-bottom: none;
}
.el-tabs >>> .el-tabs__item {
  color: #94a3b8;
  font-size: 11px;
  height: 30px;
  line-height: 30px;
  padding: 0 10px;
}
.el-tabs >>> .el-tabs__item.is-active {
  color: var(--color-primary);
}
.el-tabs >>> .el-tabs__active-bar {
  background-color: var(--color-primary);
  height: 2px;
}
.el-tabs >>> .el-tabs__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.el-tabs >>> .el-tab-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>

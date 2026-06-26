<template>
  <div class="analysis-page">
    <div class="header">
      <div class="header-title">
        数据链保障需求推演系统
        <span class="ai-badge">AI推演引擎</span>
      </div>
      <div class="step-bar">
        <div
          v-for="(s, i) in stepLabels"
          :key="i"
          class="step-item"
          :class="{active: activeStep === i + 1, completed: activeStep > i + 1}"
          @click="activeStep = i + 1"
        >
          <span class="step-circle">{{
            activeStep > i + 1 ? '✓' : i + 1
          }}</span>
          <span class="step-text">{{ s }}</span>
        </div>
      </div>
      <div class="header-right">
        <span class="task-label">作战任务：</span>
        <el-select
          v-model="zzrwid"
          size="small"
          class="task-select"
          @change="onTaskChange"
        >
          <el-option
            v-for="t in taskList"
            :key="t.ZZRWID"
            :label="t.RWMC"
            :value="t.ZZRWID"
          />
        </el-select>
      </div>
    </div>
    <div class="content-wrap">
      <div class="right-panel">
        <template v-if="activeStep === 1">
          <Step1BasicInfo ref="step1" :zzrwid="zzrwid" />
          <div style="text-align: center; margin-top: 8px; flex-shrink: 0">
            <el-button type="primary" size="mini" @click="activeStep = 2"
              >下一步 <i class="el-icon-arrow-right"></i
            ></el-button>
          </div>
        </template>
        <template v-if="activeStep === 2">
          <Step2Derivation ref="step2" :zzrwid="zzrwid" />
          <div
            style="
              text-align: center;
              margin-top: 6px;
              display: flex;
              justify-content: center;
              gap: 8px;
            "
          >
            <el-button size="mini" @click="activeStep = 1"
              ><i class="el-icon-arrow-left"></i
            ></el-button>
            <el-button type="primary" size="mini" @click="activeStep = 3"
              >下一步 <i class="el-icon-arrow-right"></i
            ></el-button>
          </div>
        </template>
        <template v-if="activeStep === 3">
          <Step3AIAnalysis
            ref="step3"
            :zzrwid="zzrwid"
            :datalink-requirements="datalinkRequirements"
          />
          <div
            style="
              text-align: center;
              margin-top: 6px;
              display: flex;
              justify-content: center;
              gap: 8px;
            "
          >
            <el-button size="mini" @click="activeStep = 2"
              ><i class="el-icon-arrow-left"></i
            ></el-button>
            <el-button type="primary" size="mini" @click="activeStep = 4"
              >下一步 <i class="el-icon-arrow-right"></i
            ></el-button>
          </div>
        </template>
        <template v-if="activeStep === 4">
          <Step4TaskNetwork
            ref="step4"
            :zzrwid="zzrwid"
            :datalink-requirements="datalinkRequirements"
          />
          <div style="text-align: center; margin-top: 6px">
            <el-button size="mini" @click="activeStep = 3"
              ><i class="el-icon-arrow-left"></i
            ></el-button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import Step1BasicInfo from './components/Step1BasicInfo'
import Step2Derivation from './components/Step2Derivation'
import Step3AIAnalysis from './components/Step3AIAnalysis'
import Step4TaskNetwork from './components/Step4TaskNetwork'
import {getTaskNodeDistribution} from '@/api/datalinkAssurance'
import {taskGetPage} from '@/api/task'

export default {
  name: 'DataLinkAssuranceRequirements',
  components: {
    Step1BasicInfo,
    Step2Derivation,
    Step3AIAnalysis,
    Step4TaskNetwork
  },
  data() {
    return {
      activeStep: 1,
      stepLabels: [
        '输入所有信息',
        'Ai推导过程',
        '智能分析结果',
        '任务网络推演'
      ],
      taskList: [],
      zzrwid: 22,
      datalinkRequirements: []
    }
  },
  mounted() {
    this.fetchTaskList()
    this.fetchNetworkData()
  },
  methods: {
    async fetchTaskList() {
      try {
        const res = await taskGetPage({pageNum: 1, pageSize: 100})
        this.taskList = res.data?.list || []
        if (
          this.taskList.length > 0 &&
          !this.taskList.find(t => t.ZZRWID === this.zzrwid)
        ) {
          this.zzrwid = this.taskList[0].ZZRWID
        }
      } catch (e) {
        console.error('获取任务列表失败', e)
      }
    },
    async fetchNetworkData() {
      try {
        const res = await getTaskNodeDistribution(this.zzrwid)
        const raw = res.data || res
        const wls = Array.isArray(raw.zzrwwls)
          ? raw.zzrwwls
          : raw.zzrwwls?.zzrwwls || []
        const typeMap = {
          1: '指挥网络',
          2: '巡逻作战网络',
          3: '突击打击网络',
          4: '防空网络'
        }
        this.datalinkRequirements = wls.map(d => {
          const wllx = d.wllx ?? d.WLLX ?? ''
          return {
            name: d.WLMC || d.wlmc || '',
            type: typeMap[wllx] || wllx || '',
            delay: d.latencyRequirement ?? '',
            bandwidth: d.bandwidthRequirement ?? '',
            services: d.serviceTypes || ''
          }
        })
      } catch (e) {
        console.error('获取任务网络列表失败', e)
        this.datalinkRequirements = []
      }
    },
    onTaskChange() {
      this.fetchNetworkData()
    }
  }
}
</script>

<style scoped>
.analysis-page {
  width: 100%;
  height: 100%;
  background-color: var(--bg-base);
  color: var(--color-text-main);
  padding: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.header {
  width: 100%;
  height: 46px;
  background: linear-gradient(
    135deg,
    rgba(12, 20, 36, 0.9),
    rgba(8, 14, 24, 0.95)
  );
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 20px;
  padding-right: 16px;
  margin-bottom: 12px;
  border: 1px solid rgba(56, 189, 248, 0.15);
  flex-shrink: 0;
  position: relative;
  gap: 20px;
}
.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(56, 189, 248, 0.5),
    transparent
  );
  animation: headerScan 3s ease-in-out infinite;
}
@keyframes headerScan {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}
.header-title {
  font-size: 14px;
  font-weight: bold;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: 1px;
  text-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
  flex-shrink: 0;
}
.ai-badge {
  display: inline-block;
  background: linear-gradient(90deg, #10b981, #38bdf8);
  color: #fff;
  font-size: 10px;
  padding: 2px 14px;
  border-radius: 30px;
  letter-spacing: 0.5px;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.25);
  animation: badgePulse 2s ease-in-out infinite;
}
@keyframes badgePulse {
  0%,
  100% {
    box-shadow: 0 0 8px rgba(56, 189, 248, 0.2);
  }
  50% {
    box-shadow: 0 0 18px rgba(56, 189, 248, 0.4);
  }
}
.content-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
  overflow: hidden;
}
.right-panel {
  flex: 1;
  background: linear-gradient(
    160deg,
    rgba(12, 20, 36, 0.85),
    rgba(8, 14, 24, 0.9)
  );
  border-radius: 6px;
  border: 1px solid rgba(30, 41, 59, 0.6);
  padding: 10px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
}
.step-bar {
  display: flex;
  align-items: center;
  gap: 0;
  flex: 1;
  justify-content: center;
}
.step-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 4px;
  transition: all 0.2s;
  opacity: 0.5;
}
.step-item:hover {
  opacity: 0.8;
}
.step-item.active {
  opacity: 1;
}
.step-item.completed {
  opacity: 0.7;
}
.step-item + .step-item::before {
  content: '';
  display: inline-block;
  width: 20px;
  height: 1px;
  background: rgba(56, 189, 248, 0.2);
  margin-right: 10px;
}
.step-item.active + .step-item::before,
.step-item.completed + .step-item::before {
  background: rgba(56, 189, 248, 0.5);
}
.step-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  border: 1.5px solid rgba(56, 189, 248, 0.4);
  color: rgba(56, 189, 248, 0.6);
  flex-shrink: 0;
  transition: all 0.25s;
}
.step-item.active .step-circle {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #38bdf8;
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.3);
}
.step-item.completed .step-circle {
  background: #38bdf8;
  border-color: #38bdf8;
  color: #070c14;
  font-size: 11px;
}
.step-text {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
}
.step-item.active .step-text,
.step-item.completed .step-text {
  color: #38bdf8;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.task-label {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
}
.task-select {
  width: 150px;
}
.task-select >>> .el-input__inner {
  height: 28px;
  line-height: 28px;
  font-size: 11px;
  background: rgba(8, 14, 24, 0.8);
  border-color: rgba(56, 189, 248, 0.2);
  color: #e2e8f0;
}
</style>

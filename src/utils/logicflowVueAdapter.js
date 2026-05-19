// src/utils/logicflowVueAdapter.js
import Vue from 'vue';

/**
 * 注册 Vue 组件到 LogicFlow
 * @param {LogicFlow} lf - LogicFlow 实例
 * @param {string} type - 节点类型名称 (例如 'vue-node')
 * @param {Object} componentMap - 组件映射表 { 'router': RouterComponent, 'switch': SwitchComponent }
 */
export function registerVueNode(lf, type, componentMap) {
  lf.registerNode(type, class VueNode extends lf.baseNode.RectNode {
    // 设置节点样式，宽高等
    static get style() {
      return {
        width: 100,
        height: 60,
        rect: {
          fill: 'transparent',
          stroke: 'transparent',
          strokeWidth: 0,
        },
      };
    }

    // 核心：创建 DOM 并挂载 Vue 组件
    setAttributes() {
      // 获取传递给节点的数据
      const props = this.properties; 
      const nodeData = this.getData();
      
      // 1. 创建容器 div
      const container = document.createElement('div');
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.position = 'relative';
      // 防止事件冒泡干扰拖拽
      container.style.pointerEvents = 'all'; 

      // 2. 根据业务逻辑确定使用哪个组件
      // 这里假设你的数据里有一个 'componentType' 字段，或者根据 text 判断
      // 为了演示，我们简单根据 properties.componentName 来查找
      const componentName = props.componentName || 'default';
      const ComponentConstructor = componentMap[componentName] || componentMap['default'];

      if (!ComponentConstructor) {
        container.innerHTML = '<div style="color:red">Unknown Component</div>';
        this.setDom(container);
        return;
      }

      // 3. 实例化 Vue 组件
      const vm = new Vue({
        render: (h) => h(ComponentConstructor, {
          props: {
            properties: props, // 将 logicflow 节点数据传给组件
            nodeData: nodeData,
            graph: lf,         // 可选：传入 graph 实例以便组件内操作
            nodeId: nodeData.id
          }
        }),
      });

      // 4. 挂载
      vm.$mount();
      container.appendChild(vm.$el);

      // 5. 将 DOM 设置给 LogicFlow
      this.setDom(container);
      
      // 保存 vm 实例以便后续销毁（防止内存泄漏）
      this.vm = vm;
    }

    // 节点被删除或画布销毁时清理 Vue 实例
    destroy() {
      if (this.vm) {
        this.vm.$destroy();
        this.vm = null;
      }
      super.destroy && super.destroy();
    }
  });
}
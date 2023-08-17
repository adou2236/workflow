import flowArea from './views/modules/FlowArea.vue';
import '@/assets/style/index.scss';
import { flowConfig } from './config/flow';

const install = (Vue) => {
  Vue.component('FlowArea', flowArea);
};
export default install;

export { flowArea, flowConfig };

import { createApp } from 'vue';
import App from './App.vue';
import '@/assets/style/index.scss';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import Storage from 'vue-lsp';

const app = createApp(App);

app.use(Storage, {
  namespace: 'flow__', // key prefix
  name: 'ls', // name variable [ls] or [$ls],
  storage: 'local', // storage name session, local, memory
});
app.use(ElementPlus);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount('#app');

const path = require('path');
const fs = require('fs');

// 使用vite打包
const { build, defineConfig } = require('vite');

// 用到的插件
const vue = require('@vitejs/plugin-vue');
const dts = require('vite-plugin-dts');
const DefineOptions = require('unplugin-vue-define-options/vite');

// 根目录
const rootDir = path.resolve(__dirname, './');

// 打包后的目录
const outDir = resolve('lib');

const baseConfig = defineConfig({
  plugins: [
    vue(),
    DefineOptions(),
    dts({
      include: ['src'],
      outputDir: path.resolve(outDir, 'types'),
    }),
  ],
  build: {
    lib: {
      entry: resolve('./src/index.ts'),
      name: 'workflow-designer',
      formats: ['es'],
      fileName: (format) => `index.${format}.js`,
    },
    outDir,
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});

main();

async function main() {
  // build
  await build(baseConfig);

  await copyFiles();
}

async function copyFiles() {
  fs.copyFileSync(resolve('README.md'), resolve('lib/README.md'));
}

function resolve(...urlOrUrls) {
  return path.resolve(rootDir, ...urlOrUrls);
}

/** @type {import('tailwindcss').Config} */
// 替代旧的 cdn.tailwindcss.com（运行时编译，生产会告警 + 首屏 FOUC）。
// content 扫描：HTML 静态壳 + React 源码，JIT 只产出用到的工具类。
export default {
  content: [
    './*.html',
    './liuyao_qigua/**/*.{ts,tsx}',
    './Calendar_zeri/**/*.{ts,tsx}',
    './shared/**/*.{ts,tsx}',
  ],
  // 动态拼接的 class（JIT 扫不到），来自 RelationshipsView 的 text-${color}-{400,900}
  safelist: [
    'text-orange-400', 'text-green-400', 'text-red-400', 'text-blue-400',
    'text-orange-900', 'text-green-900', 'text-red-900', 'text-blue-900',
  ],
  theme: {
    extend: {
      // 与各页面 <style> :root 变量一致；旧 CDN 无 config 时这些自定义色 class 其实未生效，
      // 现在补齐让 text-ink-mid / bg-vermilion 等按设计意图渲染
      colors: {
        vermilion: '#991A1A',
        'ink-deep': '#1A1816',
        'ink-mid': '#5A544E',
        'bg-silk': '#FAF8F5',
      },
    },
  },
  plugins: [],
};

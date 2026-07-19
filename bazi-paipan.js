import { BAZI_LOCATIONS } from './bazi-locations.js';
import { parseBaziClipboard, shichenMidpoint } from './bazi-input-parser.js';
import { buildBaziChart } from './core/baziChart.ts';

const $ = (id) => document.getElementById(id);
const form = $('bazi-form');
const submitButton = $('submit-chart');
const formStatus = $('form-status');
const loading = $('result-loading');
const result = $('chart-result');
const toast = $('toast');

let chartData = null;
let selectedDaYunIndex = 0;
let selectedYearIndex = 0;
let customLocation = false;
let selectedLocation = BAZI_LOCATIONS.find((item) => item.name === '上海市');

const DEFAULT_SAMPLES = [
  { date: '1990-07-12', time: '14:30', gender: 'male', location: '上海市' },
  { date: '1988-10-06', time: '09:18', gender: 'female', location: '成都市' },
  { date: '1995-03-21', time: '22:10', gender: 'male', location: '广州市' },
  { date: '1992-12-08', time: '06:42', gender: 'female', location: '西安市' },
  { date: '2000-05-17', time: '11:26', gender: 'male', location: '杭州市' },
  { date: '1986-08-29', time: '17:35', gender: 'female', location: '北京市' },
];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]);
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.hidden = true; }, 2800);
}

function locationInput() {
  if (customLocation) {
    const longitude = Number($('custom-longitude').value);
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error('请填写 -180 至 180 之间的出生地经度');
    return {
      longitude,
      timezone: $('custom-timezone').value,
      locationName: $('custom-location-name').value.trim() || '自定义地点',
    };
  }
  if (!selectedLocation) throw new Error('请从搜索结果中选择出生城市');
  return { longitude: selectedLocation.longitude, timezone: selectedLocation.timezone, locationName: selectedLocation.name };
}

function getInput() {
  const fd = new FormData(form);
  const timeMode = fd.get('timeMode');
  const time = timeMode === 'shichen' ? shichenMidpoint($('birth-shichen').value) : fd.get('time');
  return {
    name: String(fd.get('name') || '我的命盘').trim() || '我的命盘',
    gender: fd.get('gender'),
    calendarType: fd.get('calendarType'),
    date: fd.get('date'),
    time,
    timeMode,
    shichen: timeMode === 'shichen' ? $('birth-shichen').value : undefined,
    isLeapMonth: $('leap-month').checked,
    ...locationInput(),
    trueSolarTime: $('true-solar').checked,
    dayBoundary: $('day-boundary').value,
    yunSect: Number($('yun-sect').value),
  };
}

function offsetLabel(minutes) {
  const sign = minutes >= 0 ? '+' : '−';
  const abs = Math.abs(minutes);
  return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

function shortTime(value) {
  return String(value || '').slice(0, 16);
}

function renderTime(data) {
  const t = data.time;
  const trueSolar = data.input.trueSolarTime;
  const correctionText = `${t.totalCorrectionMinutes > 0 ? '+' : ''}${t.totalCorrectionMinutes} 分钟`;
  $('time-correction').innerHTML = `
    <div class="time-item"><small>钟表时间 / CIVIL</small><strong>${escapeHtml(shortTime(t.civil))}</strong><span>${offsetLabel(t.actualOffsetMinutes)}${t.daylightSavingMinutes ? ` · 夏令时 ${t.daylightSavingMinutes} 分钟` : ''}</span></div>
    <div class="time-item"><small>${trueSolar ? '真太阳时' : '本次采用时间'} / USED</small><strong>${escapeHtml(shortTime(t.used))}</strong><span>${trueSolar ? `合计校正 ${correctionText}` : '未启用真太阳时校正'}</span></div>
    <div class="time-item"><small>地点 / LOCATION</small><strong>${escapeHtml(data.input.locationName)}</strong><span>${Number(data.input.longitude).toFixed(4)}° · ${escapeHtml(data.input.timezone)}</span></div>
    <div class="time-item"><small>口径 / RULE SET</small><strong>${escapeHtml(data.input.dayBoundary)} 换日</strong><span>${data.input.yunSect === 2 ? '精确分钟起运' : '传统时辰起运'}</span></div>`;
}

function hiddenGanHtml(pillar) {
  return `<div class="hidden-stems">${pillar.hiddenGan.map(h => `<span>${escapeHtml(h.stem)}<small>${escapeHtml(h.shiShen)}</small></span>`).join('')}</div>`;
}

function tagsHtml(items) {
  if (!items?.length) return '<span class="muted">—</span>';
  return items.map(name => `<span class="chart-tag">${escapeHtml(name)}</span>`).join('');
}

function renderPillars(data) {
  const p = data.pillars;
  const row = (label, values, className = '') => `<tr><th class="row-label">${label}</th>${values.map((v, i) => `<td class="${i === 2 ? 'day-column ' : ''}${className}">${v}</td>`).join('')}</tr>`;
  $('pillar-table-body').innerHTML = [
    row('主星 / 十神', p.map(x => `<span class="ten-god">${escapeHtml(x.shiShenGan)}</span>`)),
    row('天干地支', p.map(x => `<div class="pillar-gz"><span>${escapeHtml(x.gan)}</span><span>${escapeHtml(x.zhi)}</span></div>`)),
    row('藏干', p.map(hiddenGanHtml)),
    row('纳音', p.map(x => escapeHtml(x.naYin))),
    row('十二长生', p.map(x => escapeHtml(x.diShi))),
    row('所属旬', p.map(x => escapeHtml(x.xun))),
    row('旬空', p.map(x => `<strong${x.key === 'day' ? ' style="color:#991a1a"' : ''}>${escapeHtml(x.xunKong)}</strong>`)),
    row('神煞', p.map(x => tagsHtml(x.shenSha))),
  ].join('');

  $('mobile-pillars').innerHTML = p.map(x => `
    <article class="pillar-card ${x.key === 'day' ? 'day-card' : ''}">
      <div class="pillar-card-head"><span>${escapeHtml(x.name)}</span><strong>${escapeHtml(x.shiShenGan)}</strong></div>
      <div class="pillar-card-gz"><span>${escapeHtml(x.gan)}</span><span>${escapeHtml(x.zhi)}</span></div>
      <dl>
        <div><dt>藏干</dt><dd>${x.hiddenGan.map(h => `${escapeHtml(h.stem)}·${escapeHtml(h.shiShen)}`).join('　')}</dd></div>
        <div><dt>纳音</dt><dd>${escapeHtml(x.naYin)}</dd></div>
        <div><dt>长生</dt><dd>${escapeHtml(x.diShi)}</dd></div>
        <div><dt>旬空</dt><dd>${escapeHtml(x.xunKong)}</dd></div>
        <div><dt>神煞</dt><dd class="mobile-stars">${tagsHtml(x.shenSha)}</dd></div>
      </dl>
    </article>`).join('');
}

function renderStats(data) {
  const max = Math.max(...Object.values(data.elements), 1);
  $('element-stats').innerHTML = ['木', '火', '土', '金', '水'].map(name => {
    const count = data.elements[name] || 0;
    return `<div class="element-row"><strong>${name}</strong><span class="element-bar"><i style="width:${Math.max(4, count / max * 100)}%"></i></span><span>${count}</span></div>`;
  }).join('');
  const items = [
    ['胎元', data.auxiliary.taiYuan], ['胎息', data.auxiliary.taiXi], ['命宫', data.auxiliary.mingGong],
    ['身宫', data.auxiliary.shenGong], ['日主', data.auxiliary.dayMaster], ['日柱旬空', data.auxiliary.dayXunKong],
  ];
  $('auxiliary-grid').innerHTML = items.map(([label, value]) => `<div class="objective-item"><small>${label}</small><strong>${escapeHtml(value)}</strong></div>`).join('');
}

function currentDaYunIndex(data) {
  const year = new Date().getFullYear();
  const found = data.yun.daYun.findIndex(d => year >= d.startYear && year <= d.endYear);
  return found >= 0 ? found : 0;
}

function renderDaYun(data) {
  const y = data.yun;
  $('yun-summary').textContent = `${y.forward ? '顺排' : '逆排'}大运，出生后 ${y.startYears} 年 ${y.startMonths} 个月 ${y.startDays} 天 ${y.startHours} 小时起运，交运时间为 ${shortTime(y.startAt)}。`;
  selectedDaYunIndex = currentDaYunIndex(data);
  $('dayun-list').innerHTML = y.daYun.map((d, index) => `
    <button class="timeline-tab ${index === selectedDaYunIndex ? 'current' : ''}" type="button" data-dayun="${index}">
      <small>${d.startYear}—${d.endYear}</small><strong>${escapeHtml(d.ganZhi)}</strong><span>${d.startAge}—${d.endAge} 岁</span>
    </button>`).join('');
  $('dayun-list').querySelectorAll('[data-dayun]').forEach(button => button.addEventListener('click', () => {
    selectedDaYunIndex = Number(button.dataset.dayun);
    selectedYearIndex = 0;
    renderDaYunSelection();
  }));
  renderDaYunSelection();
}

function renderDaYunSelection() {
  const daYun = chartData.yun.daYun[selectedDaYunIndex];
  document.querySelectorAll('[data-dayun]').forEach((button, index) => button.classList.toggle('current', index === selectedDaYunIndex));
  $('selected-yun').innerHTML = `<small>第 ${daYun.index} 步大运</small><strong>${escapeHtml(daYun.ganZhi)}</strong><p>${daYun.startYear}—${daYun.endYear}<br>周岁 ${daYun.startAge}—${daYun.endAge}<br>十神：${escapeHtml(daYun.shiShen)}<br>纳音：${escapeHtml(daYun.naYin)}<br>旬空：${escapeHtml(daYun.xunKong)}${daYun.shenSha.length ? `<br>神煞：${escapeHtml(daYun.shenSha.join('、'))}` : ''}</p>`;
  const nowYear = new Date().getFullYear();
  const found = daYun.liuNian.findIndex(y => y.year === nowYear);
  selectedYearIndex = found >= 0 ? found : Math.min(selectedYearIndex, daYun.liuNian.length - 1);
  $('year-grid').innerHTML = daYun.liuNian.map((y, index) => `
    <button class="year-card ${index === selectedYearIndex ? 'active' : ''}" type="button" data-year="${index}">
      <small>${y.year} · ${y.age} 岁</small><strong>${escapeHtml(y.ganZhi)}</strong><span>${escapeHtml(y.shiShen)} · 旬空${escapeHtml(y.xunKong)}</span>${y.shenSha.length ? `<span class="year-stars">${escapeHtml(y.shenSha.join(' · '))}</span>` : ''}
    </button>`).join('');
  $('year-grid').querySelectorAll('[data-year]').forEach(button => button.addEventListener('click', () => {
    selectedYearIndex = Number(button.dataset.year);
    renderMonths();
    document.querySelectorAll('[data-year]').forEach((b, index) => b.classList.toggle('active', index === selectedYearIndex));
  }));
  renderMonths();
}

function renderMonths() {
  const year = chartData.yun.daYun[selectedDaYunIndex].liuNian[selectedYearIndex];
  $('month-title').textContent = `${year.year} ${year.ganZhi}流年 · 流月`;
  const now = new Date();
  $('month-grid').innerHTML = year.liuYue.map(month => {
    const start = new Date(month.startAt.replace(' ', 'T') + '+08:00');
    const end = new Date(month.endAt.replace(' ', 'T') + '+08:00');
    const current = now >= start && now < end;
    return `<article class="month-card ${current ? 'current' : ''}"><small>${shortTime(month.startAt).slice(5)} 起</small><strong>${escapeHtml(month.ganZhi)}月</strong><span>${escapeHtml(month.startJie)} → ${escapeHtml(month.endJie)}<br>${escapeHtml(month.shiShen)} · 旬空${escapeHtml(month.xunKong)}</span>${month.shenSha.length ? `<span class="month-stars">${escapeHtml(month.shenSha.join(' · '))}</span>` : ''}</article>`;
  }).join('');
}

function renderShenSha(data) {
  const list = data.shenSha.length ? data.shenSha : [{ name: '本命盘暂无核心神煞命中', basis: '当前规则集未检出命中项', positions: ['四柱'] }];
  $('shensha-list').innerHTML = list.map(item => `<article class="shensha-item"><h3>${escapeHtml(item.name)}</h3><p>命中位置：${escapeHtml(item.positions.join('、'))}</p><code class="rule-code">${escapeHtml(item.basis)}</code></article>`).join('');
  $('rule-version').textContent = `计算引擎 ${data.meta.engine} ${data.meta.engineVersion}，神煞规则 ${data.meta.ruleSetVersion}。`;
}

function renderChart(data) {
  chartData = data;
  $('result-name').textContent = `${data.input.name} · 四柱原局`;
  $('result-subtitle').textContent = `${data.calendar.solar.slice(0, 16)} · ${data.calendar.lunar} · ${data.input.gender === 'male' ? '男命' : '女命'} · ${data.input.locationName}`;
  renderTime(data);
  renderPillars(data);
  renderStats(data);
  renderDaYun(data);
  renderShenSha(data);
  loading.hidden = true;
  result.hidden = false;
}

async function generateChart(event) {
  event?.preventDefault();
  submitButton.disabled = true;
  submitButton.textContent = '正在排盘…';
  formStatus.className = 'form-status';
  formStatus.textContent = '正在校正出生时间并计算命盘，请稍候。';
  loading.hidden = false;
  result.hidden = true;
  try {
    const data = buildBaziChart(getInput());
    chartData = data;
    localStorage.setItem('xuankong_bazi_result', JSON.stringify(chartData));
    formStatus.className = 'form-status success';
    formStatus.textContent = '命盘已经生成。';
    renderChart(data);
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    loading.hidden = true;
    formStatus.className = 'form-status error';
    formStatus.textContent = error.message || '排盘失败，请检查出生资料';
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = '生成八字命盘 <span class="button-arrow">↓</span>';
  }
}

function updateCalendarControls() {
  const lunar = document.querySelector('input[name="calendarType"]:checked').value === 'lunar';
  $('leap-month').disabled = !lunar;
  if (!lunar) $('leap-month').checked = false;
  $('date-help').textContent = lunar ? '当前按农历年月日填写，闰月请在下方勾选' : '当前按公历年月日填写';
}

function updateTimeControls() {
  const exact = document.querySelector('input[name="timeMode"]:checked').value === 'exact';
  $('exact-time-wrap').classList.toggle('hidden-field', !exact);
  $('shichen-time-wrap').classList.toggle('hidden-field', exact);
  $('birth-time').required = exact;
  $('time-help').textContent = exact ? '知道分钟时请按具体时间填写' : '会按所选时辰的中间时间进行计算';
}

function updateLocationControls() {
  $('custom-location-name-wrap').classList.toggle('hidden-field', !customLocation);
  $('custom-longitude-wrap').classList.toggle('hidden-field', !customLocation);
  $('custom-timezone-wrap').classList.toggle('hidden-field', !customLocation);
  $('location-picker').classList.toggle('custom-active', customLocation);
  $('custom-location-toggle').textContent = customLocation ? '返回省市选择' : '手动填写海外地点';
  if (customLocation) $('location-selected-note').textContent = '请填写地点名称、经度和 IANA 时区';
  else if (selectedLocation) $('location-selected-note').textContent = `${selectedLocation.label} · ${selectedLocation.longitude.toFixed(4)}° · ${selectedLocation.timezone}`;
  else $('location-selected-note').textContent = '先选省份或地区，再选择出生城市';
}

function renderCityOptions(province, selectedId = '') {
  const cities = BAZI_LOCATIONS.filter((item) => item.province === province);
  $('birth-city').innerHTML = cities.length
    ? `<option value="">请选择城市</option>${cities.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join('')}`
    : '<option value="">请先选择省份或地区</option>';
  $('birth-city').disabled = cities.length === 0;
  $('birth-city').value = selectedId;
}

function initLocationCascade() {
  const provinces = [...new Set(BAZI_LOCATIONS.map((item) => item.province))];
  $('birth-province').innerHTML = `<option value="">请选择省份或地区</option>${provinces.map((province) => `<option value="${escapeHtml(province)}">${escapeHtml(province)}</option>`).join('')}`;
  if (selectedLocation) selectLocation(selectedLocation);
}

function selectLocation(location) {
  selectedLocation = location;
  customLocation = false;
  $('birth-province').value = location.province;
  renderCityOptions(location.province, location.id);
  updateLocationControls();
}

function detectLocationInText(text) {
  const clean = String(text || '').replace(/\s+/g, '');
  return BAZI_LOCATIONS
    .map((item) => ({ item, alias: item.name.replace(/(特别行政区|自治州|自治区|地区|市|县|州)$/g, '') }))
    .filter(({ alias }) => alias.length >= 2 && clean.includes(alias))
    .sort((a, b) => b.alias.length - a.alias.length)[0]?.item || null;
}

function applyParsedInput(parsed, rawText) {
  if (!parsed) throw new Error('未识别到完整的出生年月日，请检查后重试');
  $('birth-date').value = parsed.date;
  $('birth-time').value = parsed.time;
  if (parsed.gender) $(`gender-${parsed.gender === 'male' ? 'male' : 'female'}`).checked = true;
  if (parsed.calendarType) $(`calendar-${parsed.calendarType}`).checked = true;
  if (parsed.shichen) {
    $('time-mode-shichen').checked = true;
    $('birth-shichen').value = parsed.shichen;
  } else $('time-mode-exact').checked = true;
  const location = detectLocationInText(rawText);
  if (location) selectLocation(location);
  updateCalendarControls();
  updateTimeControls();
  formStatus.className = 'form-status success';
  formStatus.textContent = `已识别 ${parsed.date} ${parsed.shichen || parsed.time}${location ? ` · ${location.label}` : ''}，正在重新排盘。`;
  generateChart();
}

function openModal(id) { $(id).hidden = false; document.body.style.overflow = 'hidden'; }
function closeModal(id) { $(id).hidden = true; document.body.style.overflow = ''; }

async function importClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (!text.trim()) throw new Error('粘贴板内容为空');
    applyParsedInput(parseBaziClipboard(text), text);
  } catch (error) {
    $('clipboard-text').value = '';
    openModal('clipboard-mask');
    $('clipboard-text').focus();
    formStatus.className = 'form-status';
    formStatus.textContent = error?.message === '粘贴板内容为空' ? '粘贴板内容为空，请在弹窗中粘贴出生资料。' : '浏览器未开放粘贴板读取，请在弹窗中手动粘贴。';
  }
}

function randomizeSample() {
  const array = new Uint32Array(1);
  const index = globalThis.crypto?.getRandomValues ? (crypto.getRandomValues(array)[0] % DEFAULT_SAMPLES.length) : Math.floor(Math.random() * DEFAULT_SAMPLES.length);
  const sample = DEFAULT_SAMPLES[index];
  $('chart-name').value = '演示命盘';
  $('birth-date').value = sample.date;
  $('birth-time').value = sample.time;
  $(`gender-${sample.gender}`).checked = true;
  const location = BAZI_LOCATIONS.find((item) => item.name === sample.location) || selectedLocation;
  if (location) selectLocation(location);
}

async function saveChart() {
  if (!chartData) return;
  const saved = JSON.parse(localStorage.getItem('xuankong_bazi_charts') || '[]');
  saved.unshift({ savedAt: new Date().toISOString(), input: chartData.input, chart: chartData });
  localStorage.setItem('xuankong_bazi_charts', JSON.stringify(saved.slice(0, 20)));
  showToast('命盘已保存到当前浏览器');
}

form.addEventListener('submit', generateChart);
document.querySelectorAll('input[name="calendarType"]').forEach(input => input.addEventListener('change', updateCalendarControls));
document.querySelectorAll('input[name="timeMode"]').forEach(input => input.addEventListener('change', updateTimeControls));
$('birth-province').addEventListener('change', (event) => {
  selectedLocation = null;
  customLocation = false;
  renderCityOptions(event.target.value);
  updateLocationControls();
});
$('birth-city').addEventListener('change', (event) => {
  selectedLocation = BAZI_LOCATIONS.find((item) => item.id === event.target.value) || null;
  customLocation = false;
  updateLocationControls();
});
$('custom-location-toggle').addEventListener('click', () => { customLocation = !customLocation; updateLocationControls(); });
$('clipboard-import').addEventListener('click', importClipboard);
$('clipboard-confirm').addEventListener('click', () => { try { const text = $('clipboard-text').value; applyParsedInput(parseBaziClipboard(text), text); closeModal('clipboard-mask'); } catch (error) { formStatus.className = 'form-status error'; formStatus.textContent = error.message; } });
$('clipboard-close').addEventListener('click', () => closeModal('clipboard-mask'));
$('clipboard-cancel').addEventListener('click', () => closeModal('clipboard-mask'));
$('edit-chart').addEventListener('click', () => {
  $('input').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
$('copy-chart').addEventListener('click', async () => {
  if (!chartData) return;
  const lines = [
    chartData.input.name,
    `公历：${chartData.calendar.solar}`,
    `农历：${chartData.calendar.lunar}`,
    `四柱：${chartData.pillars.map(p => p.ganZhi).join('　')}`,
    `日柱旬空：${chartData.auxiliary.dayXunKong}`,
    `起运：${chartData.yun.startAt}（${chartData.yun.forward ? '顺排' : '逆排'}）`,
  ];
  try { await navigator.clipboard.writeText(lines.join('\n')); showToast('排盘摘要已复制'); }
  catch { showToast('浏览器未允许复制，请手动选择内容'); }
});
$('save-chart').addEventListener('click', saveChart);
$('clipboard-mask').addEventListener('click', (event) => { if (event.target === $('clipboard-mask')) closeModal('clipboard-mask'); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal('clipboard-mask'); });

initLocationCascade();
randomizeSample();
updateCalendarControls();
updateTimeControls();
updateLocationControls();

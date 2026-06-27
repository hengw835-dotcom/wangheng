const clock = document.getElementById('clock');
const pad = n => String(n).padStart(2, '0');
function tick() {
  const d = new Date();
  if (clock) clock.textContent = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
tick();
setInterval(tick, 1000);

const pageMap = {
  '系统总览': 'overview',
  '作业总览': 'ops',
  '任务管理': 'tasks',
  '设备管理': 'machines',
  '实时控制': 'control',
  '视觉识别': 'vision',
  '传感数据': 'sensors',
  '模拟平台': 'simulator',
  '数据报表': 'reports'
};

function setPage(page) {
  document.querySelectorAll('.page-view').forEach(view => view.classList.toggle('active', view.dataset.view === page));
  document.querySelectorAll('.nav-tabs button').forEach(btn => btn.classList.toggle('active', btn.dataset.page === page));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.nav-tabs button').forEach(btn => {
  btn.addEventListener('click', () => setPage(btn.dataset.page));
});

document.querySelectorAll('.quick-grid button').forEach(btn => {
  btn.addEventListener('click', () => {
    const text = btn.textContent.trim();
    setPage(pageMap[text] || 'overview');
  });
});

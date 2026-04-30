var chart = null;
var maxYr = 10;
var simHist = [];
var monthHist = [];
var monthOpen = false;
var monthAge = null;

function tog(id, btn) {
var body = document.getElementById(id);
var arr = btn.querySelector(’.tog-arr’);
var open = body.classList.contains(‘open’);
body.classList.toggle(‘open’, !open);
if (arr) arr.classList.toggle(‘open’, !open);
}

function goResult() {
document.getElementById(‘page-input’).classList.remove(‘active’);
document.getElementById(‘page-result’).classList.add(‘active’);
document.getElementById(‘bottomNav’).classList.add(‘show’);
window.scrollTo(0, 0);
}

function goBack() {
document.getElementById(‘page-result’).classList.remove(‘active’);
document.getElementById(‘page-input’).classList.add(‘active’);
document.getElementById(‘bottomNav’).classList.remove(‘show’);
window.scrollTo(0, 0);
}

function addRate() {
var c = document.getElementById(‘rateContainer’);
var d = document.createElement(‘div’);
d.className = ‘drow rateChangeRow’;
d.innerHTML = ‘<button class="del" onclick="this.parentElement.remove()">削除</button>’
+ ‘<div class="row2" style="padding-right:50px">’
+ ‘<div class="field"><label>何歳から</label><div class="input-wrap"><input type="number" class="rateAge" placeholder="40" inputmode="decimal"><span class="input-unit">歳</span></div></div>’
+ ‘<div class="field"><label>金利</label><div class="input-wrap"><input type="number" class="rateValue" value="1.2" step="0.01" inputmode="decimal"><span class="input-unit">%</span></div></div>’
+ ‘</div>’;
c.appendChild(d);
}

function addPrepay() {
var c = document.getElementById(‘prepayContainer’);
var d = document.createElement(‘div’);
d.className = ‘drow prepayRow’;
d.innerHTML = ‘<button class="del" onclick="this.parentElement.remove()">削除</button>’
+ ‘<div class="row2" style="padding-right:50px">’
+ ‘<div class="field"><label>何歳のとき</label><div class="input-wrap"><input type="number" class="prepayAge" value="40" inputmode="decimal"><span class="input-unit">歳</span></div></div>’
+ ‘<div class="field"><label>返済額</label><div class="input-wrap"><input type="number" class="prepayAmount" value="100" inputmode="decimal"><span class="input-unit">万円</span></div></div>’
+ ‘</div>’;
c.appendChild(d);
}

function addEvent() {
var c = document.getElementById(‘eventList’);
var d = document.createElement(‘div’);
d.className = ‘drow event’;
d.innerHTML = ‘<button class="del" onclick="this.parentElement.remove()">削除</button>’
+ ‘<div class="row2" style="padding-right:50px;margin-bottom:8px">’
+ ‘<div class="field"><label>年齢</label><div class="input-wrap"><input type="number" class="age" value="40" inputmode="decimal"><span class="input-unit">歳</span></div></div>’
+ ‘<div class="field"><label>種類</label><select class="type">’
+ ‘<option value="oneExpense">臨時支出（車・旅行など）</option>’
+ ‘<option value="oneIncome">臨時収入（相続など）</option>’
+ ‘<option value="incomeAdd">収入が増える（昇給・副業）</option>’
+ ‘<option value="incomeSet">収入が変わる（転職）</option>’
+ ‘<option value="expenseAdd">支出が増える（子ども誕生など）</option>’
+ ‘<option value="expenseSet">支出が変わる</option>’
+ ‘</select></div></div>’
+ ‘<div class="row2">’
+ ‘<div class="field"><label>金額</label><div class="input-wrap"><input type="number" class="amount" value="100" inputmode="decimal"><span class="input-unit">万円</span></div></div>’
+ ‘<div class="field"><label>メモ（任意）</label><input type="text" class="note" placeholder="例：子ども大学入学"></div>’
+ ‘</div>’;
c.appendChild(d);
}

function toggleDetail(id) {
var r = document.getElementById(id);
r.style.display = r.style.display === ‘none’ ? ‘table-row’ : ‘none’;
}

function calcMonthly(loan, rate, months, type) {
if (rate === 0) return loan / months;
if (type === ‘equal’) return loan * rate / (1 - Math.pow(1 + rate, -months));
return loan / months + loan * rate;
}

function g(id) { return Number(document.getElementById(id).value); }

function run() {
maxYr = 10;
monthOpen = false;
document.getElementById(‘monthlyCard’).style.display = ‘none’;
document.getElementById(‘monthlyToggleBtn’).textContent = ‘月次’;
document.getElementById(‘monthlyToggleBtn’).style.background = ‘var(–teal-s)’;
document.getElementById(‘monthlyToggleBtn’).style.borderColor = ‘var(–teal)’;
document.getElementById(‘monthlyToggleBtn’).style.color = ‘var(–teal-d)’;
calculate();
goResult();
}

function calculate() {
var startAge      = g(‘startAge’);
var loanStartAge  = g(‘loanStartAge’);
var income        = g(‘income’);
var bonusTimes    = g(‘bonusTimes’);
var bonusAmount   = g(‘bonusAmount’);
var savings       = g(‘savings’);
var expenses      = g(‘expenses’);
var investSet     = g(‘investment’);
var investRet     = g(‘investmentReturn’) / 100;
var emergencyTgt  = g(‘emergencyTarget’);
var loanAmt       = g(‘loanAmount’);
var interestRate  = g(‘interestRate’) / 100;
var loanYears     = g(‘loanYears’);
var repayType     = document.getElementById(‘repaymentType’).value;
var recalcOpt     = document.getElementById(‘recalcOption’).value;

var events = [];
document.querySelectorAll(’.event’).forEach(function(e) {
events.push({
age:    Number(e.querySelector(’.age’).value),
type:   e.querySelector(’.type’).value,
amount: Number(e.querySelector(’.amount’).value),
note:   e.querySelector(’.note’).value
});
});

var bonusMonths = [];
if (bonusTimes > 0) {
var interval = Math.floor(12 / bonusTimes);
for (var i = 1; i <= bonusTimes; i++) bonusMonths.push(i * interval);
}

var rateChanges = [];
document.querySelectorAll(’.rateChangeRow’).forEach(function(r) {
rateChanges.push({ age: Number(r.querySelector(’.rateAge’).value), rate: Number(r.querySelector(’.rateValue’).value) / 100 });
});

var prepays = [];
document.querySelectorAll(’.prepayRow’).forEach(function(r) {
prepays.push({ age: Number(r.querySelector(’.prepayAge’).value), amount: Number(r.querySelector(’.prepayAmount’).value) });
});

var cash = savings;
var invested = 0;
var investedPrincipal = 0;
var remainingLoan = loanAmt;
var curRate = interestRate;
var pastYears = Math.max(0, startAge - loanStartAge);

for (var y = 1; y <= pastYears; y++) {
var age0 = loanStartAge + y - 1;
var ch0 = rateChanges.find(function(c) { return c.age === age0; });
if (ch0) curRate = ch0.rate;
var mr0 = curRate / 12;
var rm0 = (loanYears - y + 1) * 12;
var mp0 = calcMonthly(remainingLoan, mr0, rm0, repayType);
for (var m0 = 1; m0 <= 12; m0++) {
var int0 = remainingLoan * mr0;
var pri0 = Math.min(mp0 - int0, remainingLoan);
remainingLoan -= pri0;
}
}

simHist = [];
monthHist = [];
var curIncome = income;
var curExpenses = expenses;
var monthlyPayment = 0;
var remMonths = loanYears * 12 - pastYears * 12;
var maxYears = loanYears + 20;

for (var year = pastYears + 1; year <= maxYears; year++) {
var loanDone = remainingLoan <= 0;
var curAge = startAge + (year - pastYears - 1);
var appliedEv = [];

```
events.forEach(function(ev) {
  if (ev.age !== curAge) return;
  var note = ev.note ? '\uff08' + ev.note + '\uff09' : '';
  if (ev.type === 'incomeAdd')  { curIncome   += ev.amount; appliedEv.push('収入+' + ev.amount + '万' + note); }
  if (ev.type === 'incomeSet')  { curIncome    = ev.amount; appliedEv.push('収入→' + ev.amount + '万' + note); }
  if (ev.type === 'expenseAdd') { curExpenses += ev.amount; appliedEv.push('支出+' + ev.amount + '万' + note); }
  if (ev.type === 'expenseSet') { curExpenses  = ev.amount; appliedEv.push('支出→' + ev.amount + '万' + note); }
  if (ev.type === 'oneIncome')  { cash        += ev.amount; appliedEv.push('臨時収入+' + ev.amount + '万' + note); }
  if (ev.type === 'oneExpense') { cash        -= ev.amount; appliedEv.push('臨時支出-' + ev.amount + '万' + note); }
});

var rateChanged = false;
var rch = rateChanges.find(function(c) { return c.age === curAge; });
if (rch) { curRate = rch.rate; rateChanged = true; }

var mr = curRate / 12;

if (!loanDone && (year === pastYears + 1 || rateChanged)) {
  monthlyPayment = calcMonthly(remainingLoan, mr, Math.max(1, remMonths), repayType);
}

var yPrincipal = 0;
var yInterest = 0;

for (var month = 1; month <= 12; month++) {
  var isBonus = bonusMonths.indexOf(month) >= 0;
  cash += curIncome;

  if (isBonus) {
    cash += bonusAmount;
    var bonusRepay = g('bonusRepay');
    if (!loanDone && bonusRepay > 0 && remainingLoan > 0) {
      var avail0 = cash - emergencyTgt;
      if (avail0 > 0) {
        var pay0 = Math.min(bonusRepay, remainingLoan, avail0);
        remainingLoan -= pay0;
        cash -= pay0;
        if (remainingLoan < 0.01) remainingLoan = 0;
        if (recalcOpt === 'reduce' && remainingLoan > 0) {
          var newRm0 = Math.max(1, remMonths - (month - 1));
          monthlyPayment = calcMonthly(remainingLoan, mr, newRm0, repayType);
        }
      }
    }
  }

  cash -= curExpenses;

  var mPri = 0;
  var mInt = 0;
  if (!loanDone && remainingLoan > 0) {
    mInt = remainingLoan * mr;
    mPri = Math.min(monthlyPayment - mInt, remainingLoan);
    if (mPri < 0) mPri = 0;
    remainingLoan -= mPri;
    remMonths = Math.max(0, remMonths - 1);
    yPrincipal += mPri;
    yInterest += mInt;
    cash -= (mInt + mPri);
    if (remainingLoan < 0.01) remainingLoan = 0;
    loanDone = remainingLoan <= 0;
  }

  var avail = cash - emergencyTgt;
  if (avail > 0) {
    var inv = Math.min(investSet, avail);
    cash -= inv;
    invested += inv;
    investedPrincipal += inv;
  }
  invested *= (1 + investRet / 12);

  monthHist.push({
    age: curAge,
    month: month,
    income: curIncome + (isBonus ? bonusAmount : 0),
    expenses: curExpenses,
    principal: Math.round(mPri * 10) / 10,
    interest:  Math.round(mInt * 10) / 10,
    cash: Math.round(cash),
    invested: Math.round(invested),
    remainingLoan: Math.round(Math.max(0, remainingLoan)),
    net: Math.round(cash + invested - Math.max(0, remainingLoan)),
    isBonus: isBonus
  });
}

prepays.forEach(function(p) {
  if (p.age !== curAge || remainingLoan <= 0) return;
  var avl = cash - emergencyTgt;
  var rep = Math.min(p.amount, remainingLoan, avl);
  if (rep > 0) {
    remainingLoan -= rep;
    cash -= rep;
    if (remainingLoan < 0.01) remainingLoan = 0;
    if (recalcOpt === 'reduce' && remainingLoan > 0) {
      monthlyPayment = calcMonthly(remainingLoan, mr, Math.max(1, remMonths), repayType);
    }
  }
});

var totalAsset = cash + invested;
var prev = simHist.length > 0 ? simHist[simHist.length - 1].totalAsset : null;

simHist.push({
  age: curAge,
  cash: cash,
  invested: invested,
  investedPrincipal: investedPrincipal,
  remainingLoan: Math.max(0, remainingLoan),
  annualRate: curRate,
  totalAsset: totalAsset,
  diff: prev !== null ? totalAsset - prev : null,
  yPrincipal: yPrincipal,
  yInterest: yInterest,
  events: appliedEv
});

if (year > loanYears && remainingLoan <= 0 && (year - loanYears) >= 10) break;
```

}

renderToday();
renderKPI();
renderComment();
renderTable();
renderChart();
renderAdvice();
renderSaved();
}

function renderToday() {
var sa = g(‘startAge’);
var h0 = simHist[0];
var net = Math.round(h0.cash + h0.invested - h0.remainingLoan);
document.getElementById(‘todayCard’).innerHTML =
‘<div class="today-label">📍 今日の人生資産（’ + sa + ‘歳時点）</div>’
+ ‘<div class="today-value">’ + (net >= 0 ? ‘+’ : ‘’) + net.toLocaleString() + ’ 万円</div>’
+ ‘<div class="today-sub"><span>純資産（現金＋投資−ローン残債）</span><span class="today-chip">’ + sa + ‘歳</span></div>’;
document.getElementById(‘result-sub’).textContent = sa + ‘歳からのシミュレーション（’ + simHist.length + ‘年間）’;
}

function renderKPI() {
var sa = g(‘startAge’);
var exp = g(‘expenses’);
var plusY = null;
for (var i = 0; i < simHist.length; i++) {
if (Math.round(simHist[i].cash + simHist[i].invested - simHist[i].remainingLoan) >= 0) { plusY = simHist[i]; break; }
}
var bottom = simHist[0];
simHist.forEach(function(h) { if (h.totalAsset < bottom.totalAsset) bottom = h; });
var loanFinish = null;
for (var j = 0; j < simHist.length; j++) {
if (simHist[j].remainingLoan <= 0) { loanFinish = simHist[j]; break; }
}
var last = simHist[simHist.length - 1];
var finalNet = Math.round(last.cash + last.invested - last.remainingLoan);
var fireTarget = Math.round(exp * 12 / 0.04);
var loanAge = loanFinish ? loanFinish.age : last.age;

window.latestResult = { net: finalNet, age: last.age };

document.getElementById(‘kpiGrid’).innerHTML =
‘<div class="kpi teal"><span class="ki">🏠</span><div class="kl">ローン完済</div><div class="kv">’ + loanAge + ‘歳</div><div class="ku">あと’ + (loanAge - sa) + ‘年</div></div>’
+ ‘<div class="kpi ' + (plusY ? 'green' : 'red') + '"><span class="ki">📈</span><div class="kl">純資産プラスに転換</div><div class="kv">’ + (plusY ? plusY.age + ‘歳’ : ‘未達成’) + ‘</div><div class="ku">’ + (plusY ? ‘あと’ + (plusY.age - sa) + ‘年’ : ‘’) + ‘</div></div>’
+ ‘<div class="kpi orange"><span class="ki">📊</span><div class="kl">資産ボトム</div><div class="kv">’ + bottom.age + ‘歳</div><div class="ku">’ + Math.round(bottom.totalAsset).toLocaleString() + ‘万円</div></div>’
+ ‘<div class="kpi ' + (finalNet >= 0 ? 'blue' : 'red') + '"><span class="ki">🎯</span><div class="kl">完済時の純資産</div><div class="kv">’ + (finalNet >= 0 ? ‘+’ : ‘’) + finalNet.toLocaleString() + ’万</div><div class="ku">FIRE目標 ’ + fireTarget.toLocaleString() + ‘万円</div></div>’;
}

function renderComment() {
var sa = g(‘startAge’);
var exp = g(‘expenses’);
var plusY = null;
for (var i = 0; i < simHist.length; i++) {
if (Math.round(simHist[i].cash + simHist[i].invested - simHist[i].remainingLoan) >= 0) { plusY = simHist[i]; break; }
}
var collapse = null;
for (var j = 0; j < simHist.length; j++) {
if (simHist[j].cash < 0) { collapse = simHist[j]; break; }
}
var fireTarget = Math.round(exp * 12 / 0.04);
var txt = ‘’;
if (collapse) txt += ‘<b>’ + collapse.age + ‘歳</b>で現金がマイナスになる可能性があります。支出や投資額を見直しましょう。<br>’;
else txt += ‘シミュレーション期間中、現金はプラスを維持できそうです！<br>’;
if (plusY) txt += ‘<b>’ + plusY.age + ‘歳</b>（’ + (plusY.age - sa) + ‘年後）に純資産がプラスに転換します。<br>’;
txt += ‘FIRE達成には <b>’ + fireTarget.toLocaleString() + ‘万円</b> の資産が目標です。’;
document.getElementById(‘commentCard’).innerHTML = txt;
}

function renderTable() {
var disp = Math.min(maxYr, simHist.length);
document.getElementById(‘tableRange’).textContent = simHist[0].age + ‘〜’ + simHist[disp - 1].age + ‘歳’;
var html = ‘<table><tr><th>年齢</th><th>詳細</th><th>現金</th><th>投資</th><th>残債</th><th>金利%</th><th>純資産</th><th>前年比</th></tr>’;
for (var i = 0; i < disp; i++) {
var h = simHist[i];
var net = Math.round(h.cash + h.invested - h.remainingLoan);
var diff = h.diff !== null ? (h.diff >= 0 ? ‘+’ : ‘’) + Math.round(h.diff).toLocaleString() : ‘-’;
var nc = net >= 0 ? ‘color:#106040;font-weight:800’ : ‘color:#c03030;font-weight:800’;
var dc = h.diff !== null && h.diff >= 0 ? ‘color:#106040’ : ‘color:#c03030’;
var hasEv = h.events.length > 0;
html += ‘<tr>’
+ ‘<td>’ + h.age + (hasEv ? ’ 🎉’ : ‘’) + ‘</td>’
+ ‘<td class="clickable" onclick="toggleDetail(\'dt' + i + '\')">▼</td>’
+ ‘<td>’ + Math.round(h.cash).toLocaleString() + ‘</td>’
+ ‘<td>’ + Math.round(h.invested).toLocaleString() + ‘</td>’
+ ‘<td>’ + Math.round(h.remainingLoan).toLocaleString() + ‘</td>’
+ ‘<td>’ + (h.annualRate * 100).toFixed(2) + ‘</td>’
+ ‘<td style="' + nc + '">’ + net.toLocaleString() + ‘</td>’
+ ‘<td style="' + dc + '">’ + diff + ‘</td>’
+ ‘</tr>’
+ ‘<tr id="dt' + i + '" class="drow-detail" style="display:none">’
+ ‘<td colspan="8">’
+ (hasEv ? ‘<b>イベント：</b>’ + h.events.join(’、’) + ‘<br>’ : ‘’)
+ ’<b>投資：</b>元本 ’ + Math.round(h.investedPrincipal).toLocaleString() + ’万 / 運用益 ’ + Math.round(h.invested - h.investedPrincipal).toLocaleString() + ‘万<br>’
+ ’<b>ローン：</b>年間元本 ’ + Math.round(h.yPrincipal).toLocaleString() + ’万 / 利息 ’ + Math.round(h.yInterest).toLocaleString() + ‘万’
+ ‘</td></tr>’;
}
html += ‘</table>’;
document.getElementById(‘tableContainer’).innerHTML = html;
}

function renderChart() {
var disp = Math.min(maxYr, simHist.length);
var labels   = simHist.slice(0, disp).map(function(h) { return h.age + ‘歳’; });
var netData  = simHist.slice(0, disp).map(function(h) { return Math.round(h.cash + h.invested - h.remainingLoan); });
var cashData = simHist.slice(0, disp).map(function(h) { return Math.round(h.cash); });
var invData  = simHist.slice(0, disp).map(function(h) { return Math.round(h.invested); });
var loanData = simHist.slice(0, disp).map(function(h) { return Math.round(h.remainingLoan); });
if (chart) chart.destroy();
chart = new Chart(document.getElementById(‘assetChart’).getContext(‘2d’), {
type: ‘line’,
data: {
labels: labels,
datasets: [
{ label: ‘純資産’, data: netData,  borderColor: ‘#0ea898’, backgroundColor: ‘rgba(14,168,152,.10)’, borderWidth: 3, tension: .4, fill: true,  pointRadius: 3 },
{ label: ‘現金’,   data: cashData, borderColor: ‘#3dba8c’, backgroundColor: ‘transparent’,           borderWidth: 2, tension: .4, fill: false, pointRadius: 2 },
{ label: ‘投資’,   data: invData,  borderColor: ‘#ffc130’, backgroundColor: ‘transparent’,           borderWidth: 2, tension: .4, fill: false, pointRadius: 2 },
{ label: ‘残債’,   data: loanData, borderColor: ‘#ff5f5f’, backgroundColor: ‘transparent’,           borderWidth: 2, tension: .4, fill: false, pointRadius: 2, borderDash: [5,3] }
]
},
options: {
responsive: true,
plugins: { legend: { position: ‘bottom’, labels: { font: { family: ‘Noto Sans JP’, size: 11 }, padding: 12 } } },
scales: {
y: { ticks: { font: { family: ‘Noto Sans JP’, size: 10 } }, grid: { color: ‘#eef4fb’ } },
x: { ticks: { font: { family: ‘Noto Sans JP’, size: 10 }, maxRotation: 45 }, grid: { color: ‘#eef4fb’ } }
}
}
});
}

function toggleMonthly() {
monthOpen = !monthOpen;
var card = document.getElementById(‘monthlyCard’);
var btn  = document.getElementById(‘monthlyToggleBtn’);
if (monthOpen) {
card.style.display = ‘block’;
btn.textContent = ‘月次を閉じる’;
btn.style.background = ‘var(–red-s)’;
btn.style.borderColor = ‘var(–red)’;
btn.style.color = ‘#c03030’;
var firstAge = simHist[0].age;
renderMonthlyTable(firstAge);
setTimeout(function() { card.scrollIntoView({ behavior: ‘smooth’, block: ‘start’ }); }, 100);
} else {
card.style.display = ‘none’;
btn.textContent = ‘月次’;
btn.style.background = ‘var(–teal-s)’;
btn.style.borderColor = ‘var(–teal)’;
btn.style.color = ‘var(–teal-d)’;
}
}

function renderMonthlyTable(age) {
monthAge = age;
var months = monthHist.filter(function(m) { return m.age === age; });
if (!months.length) return;

var disp = Math.min(maxYr, simHist.length);
var ages = simHist.slice(0, disp).map(function(h) { return h.age; });
var btns = ages.map(function(a) {
var cls = a === age ? ‘myb active’ : ‘myb’;
return ‘<button class="' + cls + '" onclick="renderMonthlyTable(' + a + ')">’ + a + ‘歳</button>’;
}).join(’’);
document.getElementById(‘monthlyYearBtns’).innerHTML = btns;
document.getElementById(‘monthlyRange’).textContent = age + ‘歳（’ + months.length + ‘ヶ月分）’;

var mNames = [‘1月’,‘2月’,‘3月’,‘4月’,‘5月’,‘6月’,‘7月’,‘8月’,‘9月’,‘10月’,‘11月’,‘12月’];
var html = ‘<table>’
+ ‘<tr><th>月</th><th>収入</th><th>支出</th><th>元本</th><th>利息</th><th>現金</th><th>投資</th><th>残債</th><th>純資産</th></tr>’;
months.forEach(function(m) {
var nc = m.net >= 0 ? ‘color:#106040;font-weight:700’ : ‘color:#c03030;font-weight:700’;
var trStyle = m.isBonus ? ’ style=“background:#fffbe6”’ : ‘’;
html += ‘<tr’ + trStyle + ‘>’
+ ‘<td style="text-align:center;font-weight:700;color:var(--blue)">’ + mNames[m.month - 1] + (m.isBonus ? ’ 🎁’ : ‘’) + ‘</td>’
+ ‘<td>’ + m.income.toLocaleString() + ‘</td>’
+ ‘<td>’ + m.expenses.toLocaleString() + ‘</td>’
+ ‘<td>’ + (m.principal > 0 ? m.principal.toLocaleString() : ‘-’) + ‘</td>’
+ ‘<td>’ + (m.interest  > 0 ? m.interest.toLocaleString()  : ‘-’) + ‘</td>’
+ ‘<td>’ + m.cash.toLocaleString() + ‘</td>’
+ ‘<td>’ + m.invested.toLocaleString() + ‘</td>’
+ ‘<td>’ + m.remainingLoan.toLocaleString() + ‘</td>’
+ ‘<td style="' + nc + '">’ + m.net.toLocaleString() + ‘</td>’
+ ‘</tr>’;
});
html += ‘</table>’;
document.getElementById(‘monthlyContainer’).innerHTML = html;
}

function saveSim() {
if (!window.latestResult) { alert(‘先にシミュレーションしてください’); return; }
document.getElementById(‘saveTitle’).value = ‘’;
document.getElementById(‘saveModal’).classList.add(‘show’);
setTimeout(function() { document.getElementById(‘saveTitle’).focus(); }, 100);
}

function closeSaveModal() {
document.getElementById(‘saveModal’).classList.remove(‘show’);
}

function confirmSave() {
var title = document.getElementById(‘saveTitle’).value.trim();
if (!title) title = ‘無題（’ + new Date().toLocaleDateString() + ‘）’;
closeSaveModal();
var events = [];
document.querySelectorAll(’.event’).forEach(function(e) {
events.push({ age: e.querySelector(’.age’).value, type: e.querySelector(’.type’).value, amount: e.querySelector(’.amount’).value, note: e.querySelector(’.note’).value });
});
var rates = [];
document.querySelectorAll(’.rateChangeRow’).forEach(function(r) {
rates.push({ age: r.querySelector(’.rateAge’).value, rate: r.querySelector(’.rateValue’).value });
});
var preps = [];
document.querySelectorAll(’.prepayRow’).forEach(function(r) {
preps.push({ age: r.querySelector(’.prepayAge’).value, amount: r.querySelector(’.prepayAmount’).value });
});
var history = JSON.parse(localStorage.getItem(‘lifeRunnerSaved’) || ‘[]’);
history.unshift({
title: title, net: window.latestResult.net, age: window.latestResult.age,
inputs: { startAge: g(‘startAge’), loanStartAge: g(‘loanStartAge’), income: g(‘income’), bonusTimes: g(‘bonusTimes’), bonusAmount: g(‘bonusAmount’), savings: g(‘savings’), expenses: g(‘expenses’), investment: g(‘investment’), investmentReturn: g(‘investmentReturn’), emergencyTarget: g(‘emergencyTarget’), loanAmount: g(‘loanAmount’), interestRate: g(‘interestRate’), loanYears: g(‘loanYears’) },
events: events, rates: rates, prepays: preps
});
localStorage.setItem(‘lifeRunnerSaved’, JSON.stringify(history));
renderSaved();
}

function loadHistory(i) {
var history = JSON.parse(localStorage.getItem(‘lifeRunnerSaved’) || ‘[]’);
var h = history[i];
if (!h) return;
Object.keys(h.inputs).forEach(function(k) { var el = document.getElementById(k); if (el) el.value = h.inputs[k]; });
var ec = document.getElementById(‘eventList’); ec.innerHTML = ‘’;
if (h.events) h.events.forEach(function(ev) { addEvent(); var last = ec.lastElementChild; last.querySelector(’.age’).value = ev.age; last.querySelector(’.type’).value = ev.type; last.querySelector(’.amount’).value = ev.amount; last.querySelector(’.note’).value = ev.note; });
var rc = document.getElementById(‘rateContainer’); rc.innerHTML = ‘’;
if (h.rates) h.rates.forEach(function(r) { addRate(); var last = rc.lastElementChild; last.querySelector(’.rateAge’).value = r.age; last.querySelector(’.rateValue’).value = r.rate; });
var pc = document.getElementById(‘prepayContainer’); pc.innerHTML = ‘’;
if (h.prepays) h.prepays.forEach(function(p) { addPrepay(); var last = pc.lastElementChild; last.querySelector(’.prepayAge’).value = p.age; last.querySelector(’.prepayAmount’).value = p.amount; });
maxYr = 10;
calculate();
goResult();
}

function deleteHistory(i) {
var history = JSON.parse(localStorage.getItem(‘lifeRunnerSaved’) || ‘[]’);
history.splice(i, 1);
localStorage.setItem(‘lifeRunnerSaved’, JSON.stringify(history));
renderSaved();
}

function renderAdvice() {
var income      = g(‘income’);
var expenses    = g(‘expenses’);
var investSet   = g(‘investment’);
var emergencyTgt= g(‘emergencyTarget’);
var investRet   = g(‘investmentReturn’) / 100;
var startAge    = g(‘startAge’);
var loanYears   = g(‘loanYears’);
var loanStartAge= g(‘loanStartAge’);

var cards = ‘’;

// — A: 今日の余裕コメント —
var h0 = simHist[0];
// 月の手残り（収入 - 支出 - ローン返済 - 投資）
var monthNet = income - expenses - (h0.yPrincipal + h0.yInterest) / 12 - investSet;
var dailyYen = Math.round(monthNet * 10000 / 30);

var affirmMsg = ‘’;
if (dailyYen >= 3000) {
affirmMsg = ‘今日は <span class="ac-num">’ + dailyYen.toLocaleString() + ‘円</span> の余裕があります。’
+ ‘美味しいものでも食べてきてください。それだけの余裕を作ったのはあなた自身です。’;
} else if (dailyYen >= 500) {
affirmMsg = ‘今日は <span class="ac-num">’ + dailyYen.toLocaleString() + ‘円</span> の余裕があります。’
+ ‘コーヒーでも飲みながら、ここまで積み上げてきた選択を振り返ってみてください。’;
} else if (dailyYen >= 0) {
affirmMsg = ‘今は余裕が少ない時期ですが、それはローンや投資に回っているからです。’
+ ‘あなたの選択は未来に向かっています。’;
} else if (dailyYen >= -500) {
affirmMsg = ‘今月は収支がほぼトントンです（日あたり約 <span class="ac-num">’ + Math.abs(dailyYen).toLocaleString() + ‘円</span> のマイナス）。’
+ ‘投資額を少し下げると余裕が生まれます。無理しなくていい時期もあります。’;
} else {
var monthMinus = Math.round(Math.abs(monthNet));
affirmMsg = ‘今月は月 <span class="ac-num">’ + monthMinus + ‘万円</span> ほど支出が収入を上回っています。’
+ ’このまま続くと現金が減っていきます。投資額を月 ’ + Math.min(investSet, monthMinus) + ‘万円減らすか、’
+ ‘生活費を見直すと収支が改善します。今の状況を知ることが、最初の一歩です。’;
}
cards += ‘<div class="advice-card affirm">’
+ ‘<div class="ac-head">🎉 今日のあなたへ</div>’
+ ‘<div class="ac-body">’ + affirmMsg + ‘</div>’
+ ‘</div>’;

// — B: 投資増額タイミング —
// 純資産がプラスになった年 or 防衛資金を超えた年を起点に提案
var investUpAge = null;
var investUpAmt = 0;
for (var i = 0; i < simHist.length; i++) {
var h = simHist[i];
var net = h.cash + h.invested - h.remainingLoan;
if (net > 0 && h.cash > emergencyTgt * 1.5 && !investUpAge) {
investUpAge = h.age;
// 月あたりの余剰 = 年間現金増加分の半分を月割り（前年との差から試算）
var idx = i;
var prevCash = idx > 0 ? simHist[idx-1].cash : h.cash;
var annualSurplus = Math.max(0, h.cash - prevCash);
// 月の追加可能額は年間余剰の半分を12で割る、かつ上限5万
var extra = Math.min(5, Math.max(1, Math.round(annualSurplus / 2 / 12)));
investUpAmt = extra;
break;
}
}

if (investUpAge) {
// 投資増額した場合の最終資産を試算
var bonusInvest = investUpAmt;
var projectedGrowth = Math.round(bonusInvest * 12 * ((Math.pow(1 + investRet, loanYears - (investUpAge - startAge)) - 1) / investRet));
cards += ‘<div class="advice-card invest">’
+ ‘<div class="ac-head">📈 投資を増やせるタイミング</div>’
+ ‘<div class="ac-body">’
+ ‘<b>’ + investUpAge + ‘歳</b>頃から、月 <span class="ac-num">+’ + investUpAmt + ‘万円</span> 追加投資できる余力が生まれます。<br>’
+ ‘そのまま続けると、完済時点で資産が約 <b>’ + projectedGrowth.toLocaleString() + ‘万円</b> 上乗せされる試算です。<br>’
+ ‘ただし無理は禁物。生活水準を守りながら増やすのが長続きのコツです。’
+ ‘</div>’
+ ‘</div>’;
} else {
cards += ‘<div class="advice-card invest">’
+ ‘<div class="ac-head">📈 投資タイミングについて</div>’
+ ‘<div class="ac-body">現在の条件では、まずローン返済と防衛資金の確保を優先する時期です。純資産がプラスに転じたタイミングで投資額を見直しましょう。</div>’
+ ‘</div>’;
}

// — C: 繰上げ返済の最適タイミング —
// 防衛資金を超えた余剰が100万以上ある年を繰上げ候補とする
var prepayAdvice = [];
for (var j = 0; j < simHist.length; j++) {
var hj = simHist[j];
if (hj.remainingLoan <= 0) break;
var surplus = hj.cash - emergencyTgt;
if (surplus >= 100) {
var prepayAmt = Math.min(Math.floor(surplus / 100) * 100, Math.round(hj.remainingLoan));
// 繰上げによる短縮年数を簡易試算
var curMr = hj.annualRate / 12;
var remLoanAfter = hj.remainingLoan - prepayAmt;
if (remLoanAfter < 0) remLoanAfter = 0;
// 繰上げ前の残月数と繰上げ後の残月数の差
var remBefore = (loanYears - (hj.age - loanStartAge)) * 12;
var remAfter  = remLoanAfter > 0 && curMr > 0
? Math.ceil(-Math.log(1 - remLoanAfter * curMr / (hj.yPrincipal / 12 + hj.yInterest / 12)) / Math.log(1 + curMr))
: 0;
var shortenMonths = Math.max(0, remBefore - remAfter);
var shortenYears  = Math.round(shortenMonths / 12 * 10) / 10;
if (shortenYears >= 0.5) {
prepayAdvice.push({ age: hj.age, amt: prepayAmt, shorten: shortenYears });
}
break;
}
}

if (prepayAdvice.length > 0) {
var pa = prepayAdvice[0];
cards += ‘<div class="advice-card prepay">’
+ ‘<div class="ac-head">🏠 繰上げ返済のベストタイミング</div>’
+ ‘<div class="ac-body">’
+ ‘<b>’ + pa.age + ‘歳</b>時点で <span class="ac-num">’ + pa.amt.toLocaleString() + ‘万円</span> を繰上げ返済すると、’
+ ‘生活水準を変えずに完済を約 <b>’ + pa.shorten + ‘年</b> 早められます。<br>’
+ ‘防衛資金はそのままキープした上での試算です。無理のない範囲で検討してみてください。’
+ ‘</div>’
+ ‘</div>’;
} else {
cards += ‘<div class="advice-card prepay">’
+ ‘<div class="ac-head">🏠 繰上げ返済について</div>’
+ ‘<div class="ac-body">現在のシミュレーションでは、防衛資金を守りながら繰上げ返済できる余力が生まれるまで少し時間がかかります。まずは現在の収支を安定させることが先決です。</div>’
+ ‘</div>’;
}

document.getElementById(‘adviceCards’).innerHTML = cards;
document.getElementById(‘adviceSection’).style.display = ‘block’;
}

function renderSaved() {
var history = JSON.parse(localStorage.getItem(‘lifeRunnerSaved’) || ‘[]’);
if (history.length === 0) {
document.getElementById(‘savedList’).innerHTML = ‘<div class="empty-saved">保存されたシミュレーションはありません</div>’;
return;
}
var html = history.map(function(h, i) {
return ‘<div class="saved-item">’
+ ‘<div class="saved-info"><div class="saved-title">’ + h.title + ‘</div><div class="saved-meta">’ + h.age + ‘歳時点 | 純資産 ’ + (h.net >= 0 ? ‘+’ : ‘’) + h.net.toLocaleString() + ‘万円</div></div>’
+ ‘<div class="saved-acts"><button class="load-btn" onclick="loadHistory(' + i + ')">読込</button><button class="del-btn" onclick="deleteHistory(' + i + ')">削除</button></div>’
+ ‘</div>’;
}).join(’’);
document.getElementById(‘savedList’).innerHTML = html;
}

document.getElementById(‘runBtn’).addEventListener(‘click’, run);
document.getElementById(‘next5Btn’).addEventListener(‘click’, function() { maxYr += 5; renderTable(); renderChart(); if (monthOpen) renderMonthlyTable(monthAge); });
document.getElementById(‘saveBtn’).addEventListener(‘click’, saveSim);
document.getElementById(‘philoBtn’).addEventListener(‘click’, function() { var b = document.getElementById(‘philoBox’); b.style.display = b.style.display === ‘none’ ? ‘block’ : ‘none’; });

renderSaved();

const API='';let user={id:'admin',username:'admin',display_name:'管理员',role:'admin'},page='dashboard',customers=[];
const $=s=>document.getElementById(s);
const fmtK=n=>{if(n==null)return'0';return n>=10000?(n/10000).toFixed(1)+'万':n>=1000?(n/1000).toFixed(1)+'k':n.toFixed(0)};
const fmtM=n=>(n||0).toFixed(0);
const fmtD=s=>{if(!s)return'—';const d=new Date(s);const diff=Math.ceil((d-new Date())/(86400000));return diff>=0?`还剩${diff}天`:`已超期${Math.abs(diff)}天`};
const fmtDate=s=>{if(!s)return'—';const d=new Date(s);return`${d.getMonth()+1}月${d.getDate()}日`};
const cn=id=>(customers.find(c=>c.id===id)||{}).name||'未知';
const sc=s=>s==='已完成'?'var(--grn)':s==='进行中'?'var(--blu)':s==='待报价'?'var(--red)':s==='待维修'||s==='待确认'?'var(--amb)':'var(--t4)';
const sb=s=>s==='已完成'?'b-ok':s==='进行中'?'b-info':s==='待报价'?'b-err':s==='待维修'||s==='待确认'?'b-warn':s==='通过'?'b-ok':s==='不通过'?'b-err':'b-muted';
const dc=t=>t==='鼠标'?'var(--blu)':t==='键盘'?'var(--grn)':t==='耳机'?'var(--amb)':'var(--t4)';
const lvl=l=>({'钻石':'💎','金牌':'🏅','银牌':'🥈'}[l]||'')+' '+l;
const isM=()=>window.innerWidth<=768;

function toast(msg,type='info'){
  const t=document.createElement('div');t.className='toast '+type;t.textContent=msg;
  $('toastContainer').appendChild(t);
  setTimeout(()=>{t.style.animation='toast-out .3s ease forwards';setTimeout(()=>t.remove(),300)},3000);
}

async function api(p,o){
  try{const r=await fetch(API+p,{headers:{'Content-Type':'application/json'},...o});return r.json()}
  catch(e){toast('网络请求失败','error');return null}
}

document.addEventListener('DOMContentLoaded',()=>{
  $('menuBtn').onclick=toggleMobile;
  $('mOverlay').onclick=toggleMobile;
  document.querySelectorAll('.ri').forEach(i=>i.onclick=()=>go(i.dataset.pg));
  go('dashboard');
});

function toggleMobile(){$('navpane').classList.toggle('open');$('mOverlay').classList.toggle('show')}

const titles={dashboard:'数据看板',orders:'批量工单',customers:'客户管理',parts:'配件库存',reports:'数据报表',settings:'系统设置'};
function go(pg){
  page=pg;
  document.querySelectorAll('.ri').forEach(i=>i.classList.toggle('active',i.dataset.pg===pg));
  $('npTitle').textContent=titles[pg]||'';
  $('mhdrTitle').textContent=titles[pg]||'';
  $('npAdd').style.display=['orders','customers','parts'].includes(pg)?'flex':'none';
  if(isM()){$('navpane').classList.remove('open');$('mOverlay').classList.remove('show')}
  const c=$('content');c.style.opacity='0';c.style.transform='translateY(10px)';
  setTimeout(()=>{({dashboard:rd,orders:ro,customers:rc,parts:rp,reports:rr,settings:rs})[pg](c);
    requestAnimationFrame(()=>{c.style.transition='opacity .3s ease,transform .3s ease';c.style.opacity='1';c.style.transform='none'})},50);
}

const I={
  ref:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
  srch:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  dol:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  chr:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  clk:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  wrn:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  emp:'<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
  up:'<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>',
  down:'<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>'
};
function mr(k,v){return`<span class="lb">${k}</span><span>${v}</span>`}

// ═══ DASHBOARD ═══
async function rd(el){
  const [s,trends,alerts]=await Promise.all([api('/api/stats'),api('/api/trends'),api('/api/alerts')]);
  if(!s)return;
  const rate=s.monthRevenue>0?((s.monthProfit/s.monthRevenue)*100).toFixed(1):'0';
  const maxRev=Math.max(...trends.map(t=>t.revenue),1);
  const prev=trends.length>=2?trends[trends.length-2]:null;
  const cur=trends.length>=1?trends[trends.length-1]:null;
  const revTrend=prev&&prev.revenue>0?((cur.revenue-prev.revenue)/prev.revenue*100).toFixed(0):null;

  $('npBody').innerHTML=`<div class="ni active" onclick="go('dashboard')">${I.dol} 本月概览</div><div class="ni-sep"></div>
    <div class="ni-label">快捷操作</div>
    <div class="ni" onclick="go('orders')">${I.clk} <span style="flex:1">进行中工单</span><span class="ni-badge" style="background:var(--ambbg);color:var(--amb)">${s.activeOrders}</span></div>
    <div class="ni" onclick="go('parts')">${I.wrn} <span style="flex:1">低库存预警</span>${s.lowStockParts>0?`<span class="ni-badge" style="background:var(--redbg);color:var(--red)">${s.lowStockParts}</span>`:''}</div>
    <div class="ni" onclick="go('customers')"><span class="ni-ico">🏢</span> <span style="flex:1">客户</span><span style="font-size:11px;color:var(--t4)">${s.totalCustomers}家</span></div>
    <div class="ni-sep"></div><div class="ni-label">预警</div>
    ${alerts.overdue.length?alerts.overdue.slice(0,3).map(o=>`<div class="ni" onclick="go('orders')" style="color:var(--red)"><span class="ni-ico" style="opacity:1">⚠</span> <span style="flex:1;font-size:11.5px">${o.customer_name||'?'} 超期</span></div>`).join(''):'<div style="padding:6px 14px;font-size:11px;color:var(--t4)">无超期工单 ✓</div>'}
    ${alerts.lowStock.length?alerts.lowStock.slice(0,2).map(p=>`<div class="ni" onclick="go('parts')" style="color:var(--amb)"><span class="ni-ico" style="opacity:1">📦</span> <span style="flex:1;font-size:11.5px">${p.name} 库存${p.current_stock}</span></div>`).join(''):''}
    ${alerts.pendingPayment.length?alerts.pendingPayment.slice(0,2).map(o=>`<div class="ni" onclick="go('orders')" style="color:var(--amb)"><span class="ni-ico" style="opacity:1">💰</span> <span style="flex:1;font-size:11.5px">${o.customer_name||'?'} 待收¥${fmtM(o.actual_amount)}</span></div>`).join(''):''}`;

  el.innerHTML=`<div class="ph"><div><h2>数据看板</h2><p>实时运营概览</p></div><button class="btn btn-s" onclick="rd($('content'))">${I.ref} 刷新</button></div>
    <div class="kg">
      <div class="kpi"><div class="kpi-top"><div class="kpi-icon" style="background:var(--acbg)">${I.clk}</div><span class="kpi-badge">待处理</span></div><div class="kpi-val">${s.pendingReceival}</div><div class="kpi-label">待接单</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-icon" style="background:var(--ambbg)">${I.wrn}</div><span class="kpi-badge">进行中</span></div><div class="kpi-val">${s.pendingRepair}</div><div class="kpi-label">待修/入库</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-icon" style="background:var(--blubg)">${I.chr}</div><span class="kpi-badge">维修中</span></div><div class="kpi-val">${s.inRepair}</div><div class="kpi-label">修理中</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-icon" style="background:var(--grnbg)">${I.dol}</div><span class="kpi-badge">待发货</span></div><div class="kpi-val">${s.pendingShip}</div><div class="kpi-label">复检/待发</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-icon" style="background:var(--amberbg)">${I.dol}</div><span class="kpi-badge">待付款</span></div><div class="kpi-val">${s.pendingPaymentWf||0}</div><div class="kpi-label">待收款</div></div></div>
    <div class="card" style="margin-bottom:14px"><div class="card-h"><span class="card-t">近6个月趋势</span></div>
      <div style="display:flex;align-items:flex-end;gap:10px;height:140px;padding:0 4px">
        ${trends.map(t=>{const h=Math.max((t.revenue/maxRev)*100,4);return`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px">
          <span style="font-size:10px;color:var(--t3);font-variant-numeric:tabular-nums">¥${fmtK(t.revenue)}</span>
          <div style="width:100%;height:${h}px;background:linear-gradient(180deg,#818CF8,#6366F1);border-radius:6px 6px 0 0;position:relative;min-height:4px;transition:height .7s">
            ${t.profit>0?`<div style="position:absolute;bottom:0;left:0;right:0;height:${Math.max((t.profit/t.revenue)*100,8)}%;background:var(--grn);border-radius:0 0 6px 6px;opacity:.5"></div>`:''}
          </div>
          <span style="font-size:10px;color:var(--t4)">${t.label}</span><span style="font-size:9px;color:var(--t4)">${t.orders}单</span></div>`}).join('')}
      </div>
      <div style="display:flex;gap:16px;margin-top:10px;justify-content:center">
        <span style="font-size:10px;color:var(--t4)"><span style="display:inline-block;width:12px;height:4px;background:var(--ac);border-radius:2px;vertical-align:middle;margin-right:5px"></span>营收</span>
        <span style="font-size:10px;color:var(--t4)"><span style="display:inline-block;width:12px;height:4px;background:var(--grn);border-radius:2px;vertical-align:middle;margin-right:5px"></span>毛利</span>
      </div></div>
    <div class="g2">
      <div class="card"><div class="card-h"><span class="card-t">工单状态</span></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">${s.orderDist.map(d=>`<div style="flex:1;min-width:60px;text-align:center;padding:14px 6px;background:var(--glass);border-radius:var(--r);border:1px solid var(--bd)">
          <div style="font-size:22px;font-weight:800;color:${sc(d.status)};font-variant-numeric:tabular-nums">${d.count}</div>
          <div style="font-size:10px;color:var(--t4);margin-top:4px;font-weight:500">${d.status}</div></div>`).join('')}</div></div>
      <div class="card"><div class="card-h"><span class="card-t">概况</span></div>
        <div class="sr"><div class="sd" style="background:var(--blu)"></div><span class="sl">库存总值</span><span class="sv">¥${fmtM(s.totalPartsValue)}</span></div>
        <div class="sr"><div class="sd" style="background:var(--red)"></div><span class="sl">低库存</span><span class="sv ${s.lowStockParts>0?'tc-err':''}">${s.lowStockParts}种</span></div>
        <div class="sr"><div class="sd" style="background:var(--grn)"></div><span class="sl">已完成</span><span class="sv tc-ok">${s.completedOrders}单</span></div>
        ${s.deviceDist.length?`<div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.04)"><div style="font-size:11px;font-weight:600;color:var(--t3);margin-bottom:8px">设备分布</div>${s.deviceDist.map(d=>`<div class="sr"><span class="sl">${d.device_type}</span><div class="sbt"><div class="sbf" style="width:${(d.count/s.totalDevices*100).toFixed(0)}%;background:${dc(d.device_type)}"></div></div><span class="sv" style="min-width:22px;text-align:right">${d.count}</span></div>`).join('')}</div>`:''}</div></div>
    ${(alerts.overdue.length||alerts.pendingPayment.length)?`
    <div class="card mt" style="border-color:rgba(248,113,113,.2)"><div class="card-h"><span class="card-t" style="color:var(--red)">⚠ 需要关注</span></div>
      ${alerts.overdue.map(o=>`<div class="sr"><div class="sd" style="background:var(--red)"></div><span class="sl">${o.customer_name||'未知'} — ${o.order_number}</span><span class="b b-err" style="font-size:10px">已超期</span></div>`).join('')}
      ${alerts.pendingPayment.map(o=>`<div class="sr"><div class="sd" style="background:var(--amb)"></div><span class="sl">${o.customer_name||'未知'} — ¥${fmtM(o.actual_amount)}</span><span class="b b-warn" style="font-size:10px">待收款</span></div>`).join('')}</div>`:''}`;
}

// ═══ ORDERS (Workflow) ═══
const WF=['待接单','已入库','待修中','修理中','复检中','待发货','待付款','已完成'];
const WFBadge=s=>s==='已完成'?'b-ok':s==='修理中'?'b-info':s==='待接单'?'b-purple':s==='已入库'?'b-info':s==='待修中'?'b-warn':s==='复检中'?'b-info':s==='待发货'?'b-ok':s==='待付款'?'b-warn':'b-muted';

async function ro(el,filter){
  const [orders]=await Promise.all([api('/api/orders'+(filter?`?status=${filter}`:'')),api('/api/customers').then(c=>{if(c)customers=c})]);
  if(!orders)return;
  const sc={};orders.forEach(o=>{sc[o.status]=(sc[o.status]||0)+1});
  $('npBody').innerHTML=`<div style="padding:4px 0">${['全部',...WF].map(s=>`<div class="ni ${(!filter&&s==='全部')||filter===s?'active':''}" onclick="ro($('content'),'${s==='全部'?'':s}')">📋 <span style="flex:1">${s}</span>${sc[s]?`<span style="font-size:10.5px;color:var(--t4)">${sc[s]}</span>`:''}</div>`).join('')}</div>`;
  if(isM()){
    el.innerHTML=`<div class="ph"><div><h2>批量工单</h2><p>共${orders.length}单</p></div><button class="btn btn-p" onclick="moNO()">+ 新建</button></div>
      <div class="fb">${['全部',...WF].map(s=>`<button class="fc ${(!filter&&s==='全部')||filter===s?'on':''}" onclick="ro($('content'),'${s==='全部'?'':s}')">${s}</button>`).join('')}</div>
      ${orders.length===0?`<div class="te">${I.emp} 暂无工单</div>`:
      orders.map(o=>`<div class="mcr" onclick="moD('${o.id}')"><div class="mcr-top"><span class="mcr-title" style="color:var(--ac)">${o.order_number}</span><span class="b ${WFBadge(o.status)}">${o.status}</span></div><div class="mcr-grid">${mr('客户',cn(o.customer_id))}${mr('设备',o.total_devices+'台')}${mr('快递',o.inbound_tracking||'未填')}${mr('预计',fmtD(o.expected_completion))}</div></div>`).join('')}`;
  }else{
    el.innerHTML=`<div class="ph"><div><h2>批量工单</h2><p>共${orders.length}单</p></div><button class="btn btn-p" onclick="moNO()">+ 新建</button></div>
      <div class="fb">${['全部',...WF].map(s=>`<button class="fc ${(!filter&&s==='全部')||filter===s?'on':''}" onclick="ro($('content'),'${s==='全部'?'':s}')">${s}</button>`).join('')}</div>
      ${orders.length===0?`<div class="te">${I.emp} 暂无工单</div>`:
      `<div class="tbl-wrap"><div class="tbl-scroll"><table class="tbl"><thead><tr><th>工单号</th><th>客户</th><th>设备</th><th>快递单号</th><th>状态</th><th>技师</th><th>预计</th><th></th></tr></thead><tbody>
      ${orders.map(o=>`<tr onclick="moD('${o.id}')"><td style="color:var(--ac);font-weight:600">${o.order_number}</td><td>${cn(o.customer_id)}</td><td>${o.total_devices}</td><td class="tc2" style="font-size:11px">${o.inbound_tracking||'—'}</td><td><span class="b ${WFBadge(o.status)}">${o.status}</span></td><td>${o.assigned_technician||'—'}</td><td class="tc2">${fmtD(o.expected_completion)}</td><td><button class="btn btn-g btn-sm" onclick="event.stopPropagation();moD('${o.id}')">→</button></td></tr>`).join('')}
      </tbody></table></div></div>`}`;
  }
}

function moNO(){
  const o=document.createElement('div');o.className='mo';// no click-outside close
  o.innerHTML=`<div class="mo-box"><h3>新建工单 — 待接单</h3>
    <div class="fg"><label>选择客户</label><select id="mo_c"><option value="">— 选择已有 —</option>${customers.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
    <div class="fr"><div class="fg"><label>单位名称(新建)</label><input id="mo_co"></div><div class="fg"><label>联系人</label><input id="mo_pe"></div></div>
    <div class="fg"><label>电话</label><input id="mo_ph"></div>
    <div style="height:1px;background:var(--bd);margin:14px 0"></div>
    <div class="fg"><label>发货快递单号</label><input id="mo_track" placeholder="SF1234567890"></div>
    <div class="fr"><div class="fg"><label>鼠标</label><input type="number" id="mo_m" value="5" oninput="calcTotal()"></div><div class="fg"><label>键盘</label><input type="number" id="mo_k" value="3" oninput="calcTotal()"></div><div class="fg"><label>耳机</label><input type="number" id="mo_h" value="2" oninput="calcTotal()"></div></div>
    <div class="fg"><label>故障描述</label><textarea id="mo_f" placeholder="鼠标左键双击5台..."></textarea></div>
    <div class="fr"><div class="fg"><label>维修天数</label><input type="number" id="mo_exp" value="30" min="1"></div><div class="fg"><label>付款方式</label><select id="mo_pay"><option>现结</option></select></div></div>
    <div class="mo-act"><button class="btn btn-s" onclick="this.closest('.mo').remove()">取消</button><button class="btn btn-p" onclick="subNO()">创建</button></div></div>`;
  document.body.appendChild(o);
}
function calcTotal(){
  const t=(+$('mo_m').value||0)+(+$('mo_k').value||0)+(+$('mo_h').value||0);
  if($('mo_t'))$('mo_t').value=t;
}
async function subNO(){
  let cid=$('mo_c').value;
  if(!cid&&$('mo_co').value){cid=await api('/api/customers',{method:'POST',body:JSON.stringify({name:$('mo_co').value,contactPerson:$('mo_pe').value,contactPhone:$('mo_ph').value})})}
  if(!cid)return;
  const t=(+$('mo_m').value||0)+(+$('mo_k').value||0)+(+$('mo_h').value||0);
  await api('/api/orders',{method:'POST',body:JSON.stringify({customerId:cid,totalDevices:t,mouseCount:+$('mo_m').value||0,keyboardCount:+$('mo_k').value||0,headphoneCount:+$('mo_h').value||0,faultSummary:$('mo_f').value,inboundTracking:$('mo_track').value,expectedCompletionDays:+$('mo_exp').value||30,paymentMethod:$('mo_pay').value})});
  document.querySelector('.mo').remove();toast('工单已创建（待接单）','success');ro($('content'));
}

async function moD(oid){
  try{
  const o=await api('/api/orders/'+oid);const devs=await api('/api/orders/'+oid+'/devices');
  if(!o){toast('加载工单失败','error');return;}
  const c=customers.find(x=>x.id===o.customer_id)||{name:'未知'};
  const si=WF.indexOf(o.status);
  const prevStatus=si>0?WF[si-1]:null;
  const nextStatus=si<WF.length-1?WF[si+1]:null;
  const done=devs.filter(d=>d.status==='已完成').length;const total=o.total_devices||1;const pct=total>0?((done/total)*100).toFixed(0):0;

  // Workflow progress bar
  const wfHtml=WF.map((s,i)=>{
    const active=i===si;const done=i<si;
    return`<div style="flex:1;text-align:center;position:relative">
      <div style="width:24px;height:24px;border-radius:50%;margin:0 auto 4px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;${done?'background:var(--grn);color:#fff':active?'background:var(--ac);color:#fff':'background:var(--bg4);color:var(--t4)'}">${done?'✓':i+1}</div>
      <div style="font-size:9px;color:${active?'var(--ac)':'var(--t4)'};font-weight:${active?700:400}">${s}</div></div>`;
  }).join('<div style="flex:0;width:1px;background:var(--bd);margin-top:10px"></div>');

  // Action buttons based on status
  let actionHtml='';
  if(nextStatus){
    const reqFields=[];
    if(o.status==='待接单') reqFields.push('确认收到快递并验货');
    if(o.status==='已入库') reqFields.push('录入实际故障，分配维修区');
    if(o.status==='待修中') reqFields.push('分配维修人员');
    if(o.status==='修理中') reqFields.push('维修完成，转入复检');
    if(o.status==='复检中') reqFields.push('复检通过，转入待发货');
    if(o.status==='待发货') reqFields.push('确认发货，填写快递单号');
    if(o.status==='待付款') reqFields.push('确认收款金额');

    actionHtml=`<div style="background:var(--bg3);border:1px solid var(--bd);border-radius:var(--r);padding:14px;margin-bottom:16px">
      <div style="font-size:13px;font-weight:600;color:var(--t0);margin-bottom:8px">下一步: ${nextStatus}</div>
      <div style="font-size:11px;color:var(--t3);margin-bottom:10px">${reqFields.join(' → ')}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">`;

    if(o.status==='待接单'){
      actionHtml+=`<button class="btn btn-p btn-sm" onclick="moWF('${oid}','已入库',{inboundTracking:true})">确认入库</button>`;
    }else if(o.status==='已入库'){
      actionHtml+=`<button class="btn btn-p btn-sm" onclick="moWF('${oid}','待修中',{inspectionNotes:true,estimatedTotal:true})">首检完成</button>`;
    }else if(o.status==='待修中'){
      actionHtml+=`<div class="fg" style="margin:0;flex:1;min-width:120px"><input id="wf_tech" placeholder="分配技师" value="${o.assigned_technician||''}"></div>
        <button class="btn btn-p btn-sm" style="align-self:flex-end" onclick="assignTech('${oid}')">分配并开始维修</button>`;
    }else if(o.status==='修理中'){
      actionHtml+=`<button class="btn btn-p btn-sm" onclick="moWF('${oid}','复检中',{repairNotes:true})">转入复检</button>`;
    }else if(o.status==='复检中'){
      actionHtml+=`<button class="btn btn-p btn-sm" onclick="moWF('${oid}','待发货',{qcNotes:true})">复检通过</button>`;
    }else if(o.status==='待发货'){
      actionHtml+=`<button class="btn btn-p btn-sm" onclick="moWF('${oid}','待付款',{outboundTracking:true})">确认发货</button>`;
    }else if(o.status==='待付款'){
      actionHtml+=`<button class="btn btn-p btn-sm" onclick="moWF('${oid}','已完成',{actualAmount:true})">确认收款</button>`;
    }
    actionHtml+=`</div></div>`;
  }

  // Time info
  let timeHtml='';
  if(o.received_at) timeHtml+=`<div class="ir"><span class="il">入库时间</span><span class="iv">${fmtDate(o.received_at)}</span></div>`;
  if(o.inspected_at) timeHtml+=`<div class="ir"><span class="il">首检时间</span><span class="iv">${fmtDate(o.inspected_at)}</span></div>`;
  if(o.repair_started_at) timeHtml+=`<div class="ir"><span class="il">维修开始</span><span class="iv">${fmtDate(o.repair_started_at)}</span></div>`;
  if(o.qc_at) timeHtml+=`<div class="ir"><span class="il">复检时间</span><span class="iv">${fmtDate(o.qc_at)}</span></div>`;
  if(o.shipped_at) timeHtml+=`<div class="ir"><span class="il">发货时间</span><span class="iv">${fmtDate(o.shipped_at)}</span></div>`;

  const devHtml=isM?devs.map(d=>`<div class="mcr" onclick="moED('${d.id}','${oid}')" style="cursor:pointer"><div class="mcr-top"><span class="mcr-title">${d.device_type} #${d.sequence_number}</span><span class="b ${sb(d.status)}">${d.status}</span></div><div class="mcr-grid">${mr('型号',d.brand_model)}${mr('故障',d.fault_description)}${mr('QC',d.qc_result)}</div></div>`).join(''):
    `<div class="tbl-wrap" style="max-height:240px;overflow-y:auto"><table class="tbl"><thead><tr><th>#</th><th>类型</th><th>型号</th><th>故障</th><th>状态</th><th>QC</th></tr></thead><tbody>
    ${devs.map(d=>`<tr onclick="moED('${d.id}','${oid}')"><td class="tc2">${d.sequence_number}</td><td>${d.device_type}</td><td>${d.brand_model}</td><td class="tc2">${d.fault_description}</td><td><span class="b ${sb(d.status)}">${d.status}</span></td><td style="font-size:11px;color:${d.qc_result==='通过'?'var(--grn)':d.qc_result==='不通过'?'var(--red)':'var(--t4)'}">${d.qc_result}</td></tr>`).join('')}
    </tbody></table></div>`;

  const ov=document.createElement('div');ov.className='mo';ov.onclick=()=>{};
  ov.innerHTML=`<div class="mo-box" style="width:${isM?'95vw':'720px'}">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h3 style="margin:0">${o.order_number}</h3><button class="btn btn-g" onclick="this.closest('.mo').remove()">✕</button></div>
    <div style="display:flex;gap:2px;margin-bottom:20px">${wfHtml}</div>
    <div class="g2" style="gap:6px;margin-bottom:14px"><div class="ir"><span class="il">客户</span><span class="iv">${c?c.name:'—'}</span></div><div class="ir"><span class="il">状态</span><span class="iv"><span class="b ${WFBadge(o.status)}">${o.status}</span></span></div><div class="ir"><span class="il">鼠标</span><span class="iv">${o.mouse_count||0}台</span></div><div class="ir"><span class="il">键盘</span><span class="iv">${o.keyboard_count||0}台</span></div><div class="ir"><span class="il">耳机</span><span class="iv">${o.headphone_count||0}台</span></div><div class="ir"><span class="il">预估</span><span class="iv fw6">¥${fmtM(o.estimated_total)}</span></div><div class="ir"><span class="il">快递入</span><span class="iv">${o.inbound_tracking||'—'}</span></div><div class="ir"><span class="il">快递出</span><span class="iv">${o.outbound_tracking||'—'}</span></div><div class="ir"><span class="il">技师</span><span class="iv">${o.assigned_technician||'—'}</span></div><div class="ir"><span class="il">故障</span><span class="iv">${o.fault_summary||'—'}</span></div><div class="ir"><span class="il">预计</span><span class="iv">${fmtD(o.expected_completion)}</span></div><div class="ir"><span class="il">实收</span><span class="iv fw6">¥${fmtM(o.actual_amount)}</span></div><div class="ir"><span class="il">付款</span><span class="iv">${o.payment_status||'—'}</span></div><div class="ir"><span class="il">方式</span><span class="iv">${o.payment_method||'—'}</span></div><div class="ir"><span class="il">备注</span><span class="iv">${o.notes||'—'}</span></div><div class="ir"><span class="il">创建</span><span class="iv">${fmtDate(o.created_at)}</span></div></div>
    ${timeHtml?`<div style="margin-bottom:14px">${timeHtml}</div>`:''}
    ${o.inspection_notes?`<div style="margin-bottom:14px;padding:10px;background:var(--bg3);border-radius:var(--r);font-size:12px"><span class="fw6">首检记录：</span>${o.inspection_notes}</div>`:''}
    ${o.repair_notes?`<div style="margin-bottom:14px;padding:10px;background:var(--bg3);border-radius:var(--r);font-size:12px"><span class="fw6">维修记录：</span>${o.repair_notes}</div>`:''}
    ${o.qc_notes?`<div style="margin-bottom:14px;padding:10px;background:var(--bg3);border-radius:var(--r);font-size:12px"><span class="fw6">复检记录：</span>${o.qc_notes}</div>`:''}
    ${o.outbound_tracking?`<div style="margin-bottom:14px;padding:10px;background:var(--grnbg);border-radius:var(--r);font-size:12px"><span class="fw6">发货快递：</span>${o.outbound_tracking}</div>`:''}
    ${actionHtml}
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap"><button class="btn btn-s btn-sm" onclick="moAD('${oid}')">+ 添加设备</button><button class="btn btn-s btn-sm" onclick="moEO('${oid}')">编辑工单</button></div>
    ${devs.length?devHtml:`<div class="te">${I.emp} 暂无设备</div>`}</div>`;
  document.body.appendChild(ov);
  }catch(e){console.error('moD error:',e);toast('操作失败: '+e.message,'error');}
}

// Workflow step modal
async function moWF(oid,nextStatus,fields){
  const o=await api('/api/orders/'+oid);
  let html=`<div class="mo-box" style="width:${isM?'95vw':'420px'}"><h3>推进到: ${nextStatus}</h3>`;
  if(fields.inboundTracking) html+=`<div class="fg"><label>入库快递单号</label><input id="wf_track" value="${o.inbound_tracking||''}"></div>`;
  if(fields.inspectionNotes) html+=`<div class="fg"><label>首检记录 — 实际故障</label><textarea id="wf_inspect" placeholder="录入检测到的实际故障问题...">${o.inspection_notes||'描述符合'}</textarea></div>`;
  if(fields.repairNotes) html+=`<div class="fg"><label>维修记录</label><textarea id="wf_repair" placeholder="维修过程和结果...">${o.repair_notes||''}</textarea></div>`;
  if(fields.qcNotes) html+=`<div class="fg"><label>复检记录</label><textarea id="wf_qc" placeholder="复检结果...">${o.qc_notes||'复检通过'}</textarea></div>`;
  if(fields.estimatedTotal) html+=`<div class="fg"><label>预估总价(¥)</label><input type="number" id="wf_et" value="${o.estimated_total||0}" step="0.01"></div>`;
  if(fields.outboundTracking) html+=`<div class="fg"><label>发货快递单号</label><input id="wf_ship_track" placeholder="SF1234567890"></div>`;
  if(fields.actualAmount) html+=`<div class="fg"><label>实际收款金额(¥)</label><input type="number" id="wf_amount" value="${o.actual_amount||o.estimated_total||0}" step="0.01"></div>`;
  html+=`<div class="mo-act"><button class="btn btn-s" onclick="this.closest('.mo').remove()">取消</button><button class="btn btn-p" onclick="subWF('${oid}','${nextStatus}',${JSON.stringify(Object.keys(fields)).replace(/"/g,"'")})">确认</button></div></div>`;
  const d=document.createElement('div');d.className='mo';d.onclick=()=>{};
  d.innerHTML=html;document.body.appendChild(d);
}
async function subWF(oid,status,fieldKeys){
  const data={status};
  if(fieldKeys.includes('inboundTracking')) data.inboundTracking=$('wf_track').value;
  if(fieldKeys.includes('inspectionNotes')) data.inspectionNotes=$('wf_inspect').value;
  if(fieldKeys.includes('estimatedTotal')) data.estimatedTotal=+$('wf_et').value||0;
  if(fieldKeys.includes('repairNotes')) data.repairNotes=$('wf_repair').value;
  if(fieldKeys.includes('qcNotes')) data.qcNotes=$('wf_qc').value;
  if(fieldKeys.includes('outboundTracking')) data.outboundTracking=$('wf_ship_track').value;
  if(fieldKeys.includes('actualAmount')){data.actualAmount=+$('wf_amount').value||0;data.paymentStatus='待付款';}
  await api('/api/orders/'+oid,{method:'PUT',body:JSON.stringify(data)});
  document.querySelectorAll('.mo').forEach(m=>m.remove());toast(`状态已更新: ${status}`,'success');moD(oid);
}

async function assignTech(oid){
  const tech=$('wf_tech')?.value;
  const data={status:'修理中'};
  if(tech) data.assignedTechnician=tech;
  await api('/api/orders/'+oid,{method:'PUT',body:JSON.stringify(data)});
  document.querySelectorAll('.mo').forEach(m=>m.remove());toast('已分配并开始维修','success');ro($('content'));
}

// Edit order
async function moEO(oid){
  const o=await api('/api/orders/'+oid);
  document.querySelector('.mo')?.remove();
  const d=document.createElement('div');d.className='mo';d.onclick=()=>{};
  d.innerHTML=`<div class="mo-box"><h3>编辑工单</h3>
    <div class="fg"><label>发货快递单号</label><input id="eo_track" value="${o.inbound_tracking||''}"></div>
    <div class="fr"><div class="fg"><label>鼠标</label><input type="number" id="eo_m" value="${o.mouse_count}"></div><div class="fg"><label>键盘</label><input type="number" id="eo_k" value="${o.keyboard_count}"></div><div class="fg"><label>耳机</label><input type="number" id="eo_h" value="${o.headphone_count}"></div></div>
    <div class="fg"><label>故障摘要</label><textarea id="eo_f">${o.fault_summary||''}</textarea></div>
    <div class="fr"><div class="fg"><label>预估单价(¥)</label><input type="number" id="eo_up" value="${o.estimated_unit_price}" step="0.1"></div><div class="fg"><label>预估总价(¥)</label><input type="number" id="eo_tot" value="${o.estimated_total}" step="0.1"></div></div>
    <div class="fr"><div class="fg"><label>技师</label><input id="eo_tech" value="${o.assigned_technician||'轮班'}"></div><div class="fg"><label>维修天数</label><input type="number" id="eo_exp" value="${o.expected_completion?Math.ceil((new Date(o.expected_completion)-new Date())/(86400000)):30}" min="1"></div></div>
    <div class="fr"><div class="fg"><label>实收金额(¥)</label><input type="number" id="eo_amt" value="${o.actual_amount}" step="0.1"></div><div class="fg"><label>付款状态</label><select id="eo_ps">${['待付款','已付款'].map(s=>`<option ${o.payment_status===s?'selected':''}>${s}</option>`).join('')}</select></div></div>
    <div class="fg"><label>备注</label><textarea id="eo_n">${o.notes||''}</textarea></div>
    <div class="mo-act"><button class="btn btn-d btn-sm" onclick="delOrder('${oid}')">删除</button><div style="flex:1"></div><button class="btn btn-s" onclick="moD('${oid}')">取消</button><button class="btn btn-p" onclick="subEO('${oid}')">保存</button></div></div>`;
  document.body.appendChild(d);
}
async function subEO(oid){
  const t=(+$('eo_m').value||0)+(+$('eo_k').value||0)+(+$('eo_h').value||0);
  const data={inboundTracking:$('eo_track').value,totalDevices:t,mouseCount:+$('eo_m').value||0,keyboardCount:+$('eo_k').value||0,headphoneCount:+$('eo_h').value||0,faultSummary:$('eo_f').value,estimatedUnitPrice:+$('eo_up').value||0,estimatedTotal:+$('eo_tot').value||0,assignedTechnician:$('eo_tech').value,expectedCompletionDays:+$('eo_exp').value||0,actualAmount:+$('eo_amt').value||0,paymentStatus:$('eo_ps').value,notes:$('eo_n').value};
  await api('/api/orders/'+oid,{method:'PUT',body:JSON.stringify(data)});
  document.querySelectorAll('.mo').forEach(m=>m.remove());toast('工单已更新','success');moD(oid);
}
async function delOrder(oid){if(!confirm('确定删除工单？'))return;await api('/api/orders/'+oid,{method:'DELETE'});document.querySelectorAll('.mo').forEach(m=>m.remove());toast('工单已删除','success');ro($('content'));}

function moAD(oid){
  document.querySelector('.mo')?.remove();
  const o=document.createElement('div');o.className='mo';// no click-outside close
  o.innerHTML=`<div class="mo-box" style="width:${isM?'95vw':'420px'}"><h3>添加设备</h3>
    <div class="fr"><div class="fg"><label>类型</label><select id="ad_t"><option>鼠标</option><option>键盘</option><option>耳机</option><option>其他</option></select></div><div class="fg"><label>品牌型号</label><input id="ad_b"></div></div>
    <div class="fg"><label>序列号</label><input id="ad_s"></div><div class="fg"><label>故障描述</label><textarea id="ad_f"></textarea></div>
    <div class="mo-act"><button class="btn btn-s" onclick="this.closest('.mo').remove()">取消</button><button class="btn btn-p" onclick="subAD('${oid}')">添加</button></div></div>`;
  document.body.appendChild(o);
}
async function subAD(oid){
  const devs=await api('/api/orders/'+oid+'/devices');
  await api('/api/devices',{method:'POST',body:JSON.stringify({batchOrderId:oid,sequenceNumber:String(devs.length+1).padStart(2,'0'),deviceType:$('ad_t').value,brandModel:$('ad_b').value,serialNumber:$('ad_s').value,faultDescription:$('ad_f').value})});
  document.querySelectorAll('.mo').forEach(m=>m.remove());toast('设备已添加','success');moD(oid);
}

async function moED(did,oid){
  document.querySelector('.mo')?.remove();
  const devs=await api('/api/orders/'+oid+'/devices');const d=devs.find(x=>x.id===did);if(!d)return;
  const o=document.createElement('div');o.className='mo';// no click-outside close
  o.innerHTML=`<div class="mo-box" style="width:${isM?'95vw':'540px'}"><h3>编辑设备 #${d.sequence_number}</h3>
    <div class="fr"><div class="fg"><label>类型</label><select id="ed_t">${['鼠标','键盘','耳机','手柄','其他'].map(t=>`<option ${d.device_type===t?'selected':''}>${t}</option>`).join('')}</select></div><div class="fg"><label>品牌型号</label><input id="ed_b" value="${d.brand_model}"></div></div>
    <div class="fg"><label>序列号</label><input id="ed_s" value="${d.serial_number}"></div>
    <div class="fr"><div class="fg"><label>外观</label><select id="ed_ap">${['良好','轻微磨损','明显磨损','破损'].map(t=>`<option ${d.appearance===t?'selected':''}>${t}</option>`).join('')}</select></div><div class="fg"><label>预检结果</label><input id="ed_pre" value="${d.precheck_result}"></div></div>
    <div class="fg"><label>故障描述</label><textarea id="ed_f">${d.fault_description}</textarea></div>
    <div class="fr"><div class="fg"><label>维修措施</label><input id="ed_ra" value="${d.repair_action}"></div><div class="fg"><label>更换配件</label><input id="ed_rp" value="${d.replaced_parts}"></div></div>
    <div class="fr"><div class="fg"><label>配件费(¥)</label><input type="number" id="ed_pc" value="${d.parts_cost}" step="0.1"></div><div class="fg"><label>工时费(¥)</label><input type="number" id="ed_lc" value="${d.labor_cost}" step="0.1"></div></div>
    <div class="fr"><div class="fg"><label>维修技师</label><input id="ed_tech" value="${d.technician}"></div><div class="fg"><label>备注</label><input id="ed_n" value="${d.notes}"></div></div>
    <div class="fr"><div class="fg"><label>维修状态</label><select id="ed_st">${['待检','维修中','已完成','无法修复'].map(s=>`<option ${d.status===s?'selected':''}>${s}</option>`).join('')}</select></div><div class="fg"><label>质检结果</label><select id="ed_qc">${['待检','通过','不通过'].map(s=>`<option ${d.qc_result===s?'selected':''}>${s}</option>`).join('')}</select></div></div>
    <div class="mo-act"><button class="btn btn-d btn-sm" onclick="delDev('${did}','${oid}')">删除</button><div style="flex:1"></div><button class="btn btn-s" onclick="this.closest('.mo').remove();moD('${oid}')">取消</button><button class="btn btn-p" onclick="subED('${did}','${oid}')">保存</button></div></div>`;
  document.body.appendChild(o);
}
async function subED(did,oid){
  const pc=+$('ed_pc').value||0,lc=+$('ed_lc').value||0;
  await api('/api/devices/'+did,{method:'PUT',body:JSON.stringify({deviceType:$('ed_t').value,brandModel:$('ed_b').value,serialNumber:$('ed_s').value,appearance:$('ed_ap').value,faultDescription:$('ed_f').value,precheckResult:$('ed_pre').value,repairAction:$('ed_ra').value,replacedParts:$('ed_rp').value,partsCost:pc,laborCost:lc,subtotal:pc+lc,technician:$('ed_tech').value,status:$('ed_st').value,qcResult:$('ed_qc').value,notes:$('ed_n').value})});
  document.querySelectorAll('.mo').forEach(m=>m.remove());toast('设备已更新','success');moD(oid);
}
async function delDev(did,oid){
  if(!confirm('确定删除该设备？'))return;
  await api('/api/devices/'+did,{method:'DELETE'});
  document.querySelectorAll('.mo').forEach(m=>m.remove());toast('设备已删除','success');moD(oid);
}

// ═══ CUSTOMERS ═══
async function rc(el,search){
  const list=await api('/api/customers'+(search?`?search=${search}`:''));
  if(!list)return;
  $('npBody').innerHTML=`<div style="padding:4px 0">${list.slice(0,25).map(c=>`<div class="ni" onclick="moEC('${c.id}')"><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px">${c.name}</span><span class="b ${c.level==='钻石'?'b-purple':c.level==='金牌'?'b-warn':'b-muted'}" style="font-size:9px;padding:1px 6px">${c.level}</span></div>`).join('')}${list.length===0?'<div class="te" style="padding:20px">暂无客户</div>':''}</div>`;
  if(isM()){
    el.innerHTML=`<div class="ph"><div><h2>客户管理</h2><p>共${list.length}家</p></div><button class="btn btn-p" onclick="moNC()">+ 新增</button></div>
      <div class="fb"><div class="sw">${I.srch}<input placeholder="搜索..." onkeyup="if(event.key==='Enter')rc($('content'),this.value)"></div></div>
      ${list.length===0?`<div class="te">${I.emp} 暂无客户</div>`:
      list.map(c=>`<div class="mcr" onclick="moEC('${c.id}')"><div class="mcr-top"><span class="mcr-title">${c.name}</span><span class="b ${c.level==='钻石'?'b-purple':c.level==='金牌'?'b-warn':'b-muted'}">${c.level}</span></div><div class="mcr-grid">${mr('联系人',c.contact_person)}${mr('电话',c.contact_phone)}${mr('消费','¥'+c.total_spent.toFixed(0))}${mr('合同',c.contract_status)}</div></div>`).join('')}`;
  }else{
    el.innerHTML=`<div class="ph"><div><h2>客户管理</h2><p>共${list.length}家</p></div><button class="btn btn-p" onclick="moNC()">+ 新增</button></div>
      <div class="fb"><div class="sw">${I.srch}<input placeholder="搜索..." onkeyup="if(event.key==='Enter')rc($('content'),this.value)"></div></div>
      ${list.length===0?`<div class="te">${I.emp} 暂无客户</div>`:
      `<div class="tbl-wrap"><div class="tbl-scroll"><table class="tbl"><thead><tr><th>编号</th><th>名称</th><th>类型</th><th>联系人</th><th>等级</th><th>消费</th><th>欠款</th><th>合同</th><th></th></tr></thead><tbody>
      ${list.map(c=>`<tr onclick="moEC('${c.id}')"><td class="fmono tc2">${c.code}</td><td class="fw6">${c.name}</td><td>${c.type}</td><td>${c.contact_person}</td><td>${lvl(c.level)}</td><td class="fw6">¥${fmtM(c.total_spent)}</td><td class="${c.current_debt>0?'tc-err':'tc2'}">${c.current_debt>0?'¥'+fmtM(c.current_debt):'—'}</td><td style="color:${c.contract_status==='有效合同'?'var(--grn)':'var(--t4)'};font-size:11px">${c.contract_status}</td><td><button class="btn btn-g btn-sm" onclick="event.stopPropagation();moEC('${c.id}')">→</button></td></tr>`).join('')}
      </tbody></table></div></div>`}`;
  }
}
function moNC(){
  const o=document.createElement('div');o.className='mo';// no click-outside close
  o.innerHTML=`<div class="mo-box"><h3>新增客户</h3>
    <div class="fg"><label>单位名称 *</label><input id="nc_n"></div>
    <div class="fr"><div class="fg"><label>类型</label><select id="nc_t"><option>网吧</option><option>企业</option><option>电竞馆</option><option>其他</option></select></div><div class="fg"><label>等级</label><select id="nc_l"><option>普通</option><option>银牌</option><option>金牌</option><option>钻石</option></select></div></div>
    <div class="fr"><div class="fg"><label>联系人</label><input id="nc_p"></div><div class="fg"><label>电话</label><input id="nc_ph"></div></div>
    <div class="fg"><label>微信</label><input id="nc_w" placeholder="选填"></div>
    <div class="fg"><label>地址</label><input id="nc_a"></div>
    <div class="mo-act"><button class="btn btn-s" onclick="this.closest('.mo').remove()">取消</button><button class="btn btn-p" onclick="subNC()">保存</button></div></div>`;
  document.body.appendChild(o);
}
async function subNC(){
  const cnt=(await api('/api/customers')).length;
  await api('/api/customers',{method:'POST',body:JSON.stringify({code:'U-'+String(cnt+1).padStart(3,'0'),name:$('nc_n').value,type:$('nc_t').value,contactPerson:$('nc_p').value,contactPhone:$('nc_ph').value,wechat:$('nc_w').value,address:$('nc_a').value,level:$('nc_l').value})});
  document.querySelector('.mo').remove();toast('客户已创建','success');rc($('content'));
}
async function moEC(id){
  const list=await api('/api/customers');const c=list.find(x=>x.id===id);if(!c)return;
  const o=document.createElement('div');o.className='mo';// no click-outside close
  o.innerHTML=`<div class="mo-box"><h3>编辑客户</h3>
    <div class="fg"><label>名称</label><input id="ec_n" value="${c.name}"></div>
    <div class="fr"><div class="fg"><label>类型</label><select id="ec_t">${['网吧','企业','电竞馆','其他'].map(t=>`<option ${c.type===t?'selected':''}>${t}</option>`).join('')}</select></div><div class="fg"><label>等级</label><select id="ec_l">${['普通','银牌','金牌','钻石'].map(t=>`<option ${c.level===t?'selected':''}>${t}</option>`).join('')}</select></div></div>
    <div class="fr"><div class="fg"><label>联系人</label><input id="ec_p" value="${c.contact_person}"></div><div class="fg"><label>电话</label><input id="ec_ph" value="${c.contact_phone}"></div></div>
    <div class="fg"><label>微信</label><input id="ec_w" value="${c.wechat||''}"></div>
    <div class="fg"><label>地址</label><input id="ec_a" value="${c.address||''}"></div>
    <div class="mo-act"><button class="btn btn-d btn-sm" onclick="delC('${id}')">删除</button><div style="flex:1"></div><button class="btn btn-s" onclick="this.closest('.mo').remove()">取消</button><button class="btn btn-p" onclick="subEC('${id}')">保存</button></div></div>`;
  document.body.appendChild(o);
}
async function subEC(id){
  await api('/api/customers/'+id,{method:'PUT',body:JSON.stringify({name:$('ec_n').value,type:$('ec_t').value,contactPerson:$('ec_p').value,contactPhone:$('ec_ph').value,wechat:$('ec_w').value,address:$('ec_a').value,level:$('ec_l').value})});
  document.querySelector('.mo').remove();toast('客户已更新','success');rc($('content'));
}
async function delC(id){if(!confirm('确定删除？'))return;await api('/api/customers/'+id,{method:'DELETE'});document.querySelector('.mo').remove();toast('客户已删除','success');rc($('content'))}

// ═══ PARTS ═══
async function rp(el,search){
  const [parts,txns]=await Promise.all([api('/api/parts'+(search?`?search=${search}`:'')),api('/api/transactions')]);
  if(!parts)return;
  const low=parts.filter(p=>p.current_stock<p.safety_stock).length;
  const cats={};parts.forEach(p=>{const c=p.category.split('-')[0];if(!cats[c])cats[c]=[];cats[c].push(p)});
  $('npBody').innerHTML=`<div style="padding:4px 0">${Object.entries(cats).map(([cat,items])=>`<div class="ni-label">${cat}</div>${items.map(p=>`<div class="ni" onclick="moSK('${p.id}','${p.name}',${p.current_stock})"><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px">${p.name}</span><span style="font-size:10.5px;font-weight:600;color:${p.current_stock<p.safety_stock?'var(--red)':'var(--t4)'}">${p.current_stock}</span></div>`).join('')}`).join('')}
    <div class="ni-sep"></div><div class="ni" onclick="showTxnLog()"><span class="ni-ico">📋</span> <span style="flex:1;font-size:12px">交易记录</span><span style="font-size:10px;color:var(--t4)">${txns.length}</span></div></div>`;
  if(isM()){
    el.innerHTML=`<div class="ph"><div><h2>配件库存</h2><p>共${parts.length}种 ${low?`<span class="tc-err">· ⚠ ${low}种低库存</span>`:''}</p></div><button class="btn btn-p" onclick="moNP()">+ 新增</button></div>
      <div class="fb"><div class="sw">${I.srch}<input placeholder="搜索..." onkeyup="if(event.key==='Enter')rp($('content'),this.value)"></div></div>
      ${parts.map(p=>`<div class="mcr" style="${p.current_stock<p.safety_stock?'border-color:var(--red);background:var(--redbg)':''}"><div class="mcr-top"><span class="mcr-title">${p.name}</span><span class="fw6" style="color:${p.current_stock<p.safety_stock?'var(--red)':'var(--t1)'}">${p.current_stock} ${p.unit}</span></div><div class="mcr-grid">${mr('编码',p.code)}${mr('类别',p.category)}${mr('成本','¥'+p.cost_price)}${mr('库位',p.location)}</div><div style="margin-top:8px"><button class="btn btn-p btn-sm" onclick="moSK('${p.id}','${p.name}',${p.current_stock})">出入库</button></div></div>`).join('')}`;
  }else{
    el.innerHTML=`<div class="ph"><div><h2>配件库存</h2><p>共${parts.length}种 ${low?`<span class="tc-err">· ⚠ ${low}种低库存</span>`:''}</p></div><button class="btn btn-p" onclick="moNP()">+ 新增</button></div>
      <div class="fb"><div class="sw">${I.srch}<input placeholder="搜索..." onkeyup="if(event.key==='Enter')rp($('content'),this.value)"></div></div>
      <div class="tbl-wrap"><div class="tbl-scroll"><table class="tbl"><thead><tr><th>编码</th><th>名称</th><th>类别</th><th>库存</th><th>安全</th><th>成本</th><th>库存值</th><th>入</th><th>出</th><th>位</th><th></th></tr></thead><tbody>
      ${parts.map(p=>`<tr style="${p.current_stock<p.safety_stock?'background:var(--redbg)':''}" onclick="moSK('${p.id}','${p.name}',${p.current_stock})"><td class="fmono" style="font-size:10px">${p.code}</td><td class="fw6">${p.name}</td><td class="tc2">${p.category}</td><td style="font-weight:700;${p.current_stock<p.safety_stock?'color:var(--red)':''}">${p.current_stock}</td><td class="tc2">${p.safety_stock}</td><td>¥${p.cost_price}</td><td>¥${fmtM(p.current_stock*p.cost_price)}</td><td>${p.month_in}</td><td>${p.month_out}</td><td class="tc2">${p.location}</td><td><button class="btn btn-g btn-sm" onclick="event.stopPropagation();moSK('${p.id}','${p.name}',${p.current_stock})">→</button></td></tr>`).join('')}
      </tbody></table></div></div>`;
  }
  el.innerHTML+=`<div class="card mt"><div class="card-h"><span class="card-t">最近交易</span><span style="font-size:11px;color:var(--t4)">${txns.length}条</span></div>
    ${txns.length===0?'<div class="te" style="padding:28px">暂无记录</div>':
    `<div class="tbl-wrap"><div class="tbl-scroll" style="max-height:200px"><table class="tbl"><thead><tr><th>时间</th><th>类型</th><th>配件</th><th>数量</th><th>单价</th><th>金额</th><th>备注</th></tr></thead><tbody>
    ${txns.slice(0,20).map(t=>`<tr><td class="tc2" style="font-size:11px">${new Date(t.date).toLocaleDateString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}</td><td><span class="b ${t.type==='入库'?'b-ok':t.type==='出库'?'b-info':'b-err'}">${t.type}</span></td><td style="font-size:12px">${t.part_name}</td><td style="font-size:12px">${t.quantity>0?'+':''}${t.quantity}</td><td class="tc2" style="font-size:11px">¥${t.unit_price}</td><td class="fw6" style="font-size:12px">¥${fmtM(t.amount)}</td><td class="tc2" style="font-size:11px">${t.notes||'—'}</td></tr>`).join('')}
    </tbody></table></div></div>`}</div>`;
}
async function showTxnLog(){
  const txns=await api('/api/transactions');
  const o=document.createElement('div');o.className='mo';// no click-outside close
  o.innerHTML=`<div class="mo-box" style="width:${isM?'95vw':'720px'}">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px"><h3 style="margin:0">交易记录</h3><button class="btn btn-g" onclick="this.closest('.mo').remove()">✕</button></div>
    ${txns.length===0?'<div class="te">暂无交易记录</div>':
    `<div class="tbl-wrap"><div class="tbl-scroll" style="max-height:60vh"><table class="tbl"><thead><tr><th>时间</th><th>类型</th><th>配件</th><th>数量</th><th>单价</th><th>金额</th><th>备注</th></tr></thead><tbody>
    ${txns.map(t=>`<tr><td class="tc2" style="font-size:11px">${new Date(t.date).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}</td><td><span class="b ${t.type==='入库'?'b-ok':t.type==='出库'?'b-info':'b-err'}">${t.type}</span></td><td style="font-size:12px">${t.part_name}</td><td style="font-size:12px;font-weight:600;color:${t.quantity>0?'var(--grn)':'var(--red)'}">${t.quantity>0?'+':''}${t.quantity}</td><td class="tc2" style="font-size:11px">¥${t.unit_price}</td><td class="fw6" style="font-size:12px">¥${fmtM(t.amount)}</td><td class="tc2" style="font-size:11px">${t.notes||t.batch_order_number||'—'}</td></tr>`).join('')}
    </tbody></table></div></div>`}</div>`;
  document.body.appendChild(o);
}
function moNP(){
  const o=document.createElement('div');o.className='mo';// no click-outside close
  o.innerHTML=`<div class="mo-box"><h3>新增配件</h3>
    <div class="fr"><div class="fg"><label>编码 *</label><input id="np_c" placeholder="SW-OMRON-D2F01"></div><div class="fg"><label>名称 *</label><input id="np_n"></div></div>
    <div class="fr"><div class="fg"><label>类别</label><select id="np_ca"><option>鼠标-微动</option><option>键盘-轴体</option><option>耳机-耳罩</option><option>耳机-电池</option><option>通用-线材</option><option>通用-清洁</option></select></div><div class="fg"><label>规格</label><input id="np_s"></div></div>
    <div class="fr"><div class="fg"><label>库存</label><input type="number" id="np_st" value="20"></div><div class="fg"><label>成本(¥)</label><input type="number" id="np_p" step="0.1"></div></div>
    <div class="fg"><label>供应商</label><input id="np_su"></div>
    <div class="mo-act"><button class="btn btn-s" onclick="this.closest('.mo').remove()">取消</button><button class="btn btn-p" onclick="subNP()">保存</button></div></div>`;
  document.body.appendChild(o);
}
async function subNP(){
  await api('/api/parts',{method:'POST',body:JSON.stringify({code:$('np_c').value,name:$('np_n').value,category:$('np_ca').value,spec:$('np_s').value,currentStock:+$('np_st').value||0,costPrice:+$('np_p').value||0,supplier:$('np_su').value})});
  document.querySelector('.mo').remove();toast('配件已添加','success');rp($('content'));
}
function moSK(id,name,cur){
  const o=document.createElement('div');o.className='mo';// no click-outside close
  o.innerHTML=`<div class="mo-box" style="width:${isM?'95vw':'380px'}"><h3>${name}</h3>
    <p style="margin-bottom:16px;font-size:14px">当前库存: <strong>${cur}</strong></p>
    <div class="fg"><label>类型</label><select id="sk_t"><option>入库</option><option>出库</option><option>报废</option></select></div>
    <div class="fr"><div class="fg"><label>数量</label><input type="number" id="sk_q" min="1"></div><div class="fg"><label>单价(¥)</label><input type="number" id="sk_p" step="0.1"></div></div>
    <div class="fg"><label>关联工单号</label><input id="sk_ord" placeholder="选填 BL-xxxx"></div>
    <div class="fg"><label>备注</label><input id="sk_n"></div>
    <div class="mo-act"><button class="btn btn-s" onclick="this.closest('.mo').remove()">取消</button><button class="btn btn-p" onclick="subSK('${id}','${name}')">确认</button></div></div>`;
  document.body.appendChild(o);
}
async function subSK(id,name){
  const type=$('sk_t').value,qty=+$('sk_q').value||0,price=+$('sk_p').value||0;if(qty<=0)return;
  await api(`/api/parts/${id}/stock`,{method:'POST',body:JSON.stringify({qtyChange:type==='入库'?qty:-qty,type,unitPrice:price,batchOrderNumber:$('sk_ord').value,notes:$('sk_n').value})});
  document.querySelector('.mo').remove();toast('库存已更新','success');rp($('content'));
}

// ═══ REPORTS ═══
async function rr(el){
  const [s,trends]=await Promise.all([api('/api/stats'),api('/api/trends')]);
  if(!s)return;
  const rate=s.monthRevenue>0?((s.monthProfit/s.monthRevenue)*100).toFixed(1):'0';
  const maxRev=Math.max(...trends.map(t=>t.revenue),1);
  $('npBody').innerHTML=`<div style="padding:8px 14px"><div class="card" style="padding:16px"><div class="card-t" style="margin-bottom:12px">本月概览</div>
    <div class="sr"><span class="sl">营收</span><span class="sv">¥${fmtK(s.monthRevenue)}</span></div>
    <div class="sr"><span class="sl">成本</span><span class="sv">¥${fmtK(s.monthPartsCost)}</span></div>
    <div class="sr"><span class="sl">毛利</span><span class="sv tc-ok">¥${fmtK(s.monthProfit)}</span></div>
    <div class="sr"><span class="sl">毛利率</span><span class="sv">${rate}%</span></div>
    <div style="height:1px;background:var(--bd);margin:10px 0"></div>
    <div class="sr"><span class="sl">总工单</span><span class="sv">${s.totalOrders}</span></div>
    <div class="sr"><span class="sl">总设备</span><span class="sv">${s.totalDevices}</span></div>
    <div style="height:1px;background:var(--bd);margin:10px 0"></div>
    <div class="ni" onclick="doExport()" style="margin:0"><span class="ni-ico">📥</span> <span style="flex:1;font-size:12px">导出数据</span></div></div></div>`;
  el.innerHTML=`<div class="ph"><div><h2>数据报表</h2><p>运营数据分析</p></div><button class="btn btn-s" onclick="doExport()">📥 导出JSON</button></div>
    <div class="kg">
      <div class="kpi"><div class="kpi-top"><div class="kpi-icon" style="background:var(--grnbg)">${I.dol}</div></div><div class="kpi-val">¥${fmtK(s.monthRevenue)}</div><div class="kpi-label">本月营收</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-icon" style="background:var(--ambbg)">${I.chr}</div></div><div class="kpi-val">¥${fmtK(s.monthPartsCost)}</div><div class="kpi-label">配件成本</div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-icon" style="background:var(--blubg)">${I.chr}</div></div><div class="kpi-val">¥${fmtK(s.monthProfit)}</div><div class="kpi-label">毛利 <span class="tc2" style="font-size:10px">${rate}%</span></div></div>
      <div class="kpi"><div class="kpi-top"><div class="kpi-icon" style="background:var(--acbg)">${I.clk}</div></div><div class="kpi-val">${s.totalOrders}</div><div class="kpi-label">总工单</div></div></div>
    <div class="card" style="margin-bottom:14px"><div class="card-h"><span class="card-t">月度趋势</span></div>
      <div style="display:flex;align-items:flex-end;gap:10px;height:160px;padding:0 4px">
        ${trends.map(t=>{const h=Math.max((t.revenue/maxRev)*100,4);return`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px">
          <span style="font-size:10px;color:var(--t3);font-variant-numeric:tabular-nums">¥${fmtK(t.revenue)}</span>
          <div style="width:100%;height:${h}px;background:linear-gradient(180deg,#818CF8,#6366F1);border-radius:6px 6px 0 0;position:relative;min-height:4px">
            ${t.profit>0?`<div style="position:absolute;bottom:0;left:0;right:0;height:${Math.max((t.profit/t.revenue)*100,8)}%;background:var(--grn);border-radius:0 0 6px 6px;opacity:.5"></div>`:''}
          </div>
          <span style="font-size:10px;color:var(--t4)">${t.label}</span><span style="font-size:9px;color:var(--t4)">${t.orders}单</span></div>`}).join('')}
      </div>
      <div style="display:flex;gap:16px;margin-top:12px;justify-content:center"><span style="font-size:10px;color:var(--t4)"><span style="display:inline-block;width:12px;height:4px;background:var(--ac);border-radius:2px;vertical-align:middle;margin-right:5px"></span>营收</span><span style="font-size:10px;color:var(--t4)"><span style="display:inline-block;width:12px;height:4px;background:var(--grn);border-radius:2px;vertical-align:middle;margin-right:5px"></span>毛利</span></div></div>
    <div class="g2"><div class="card"><div class="card-h"><span class="card-t">运营</span></div>
      <div class="sr"><div class="sd" style="background:var(--blu)"></div><span class="sl">进行中</span><span class="sv">${s.activeOrders}</span></div>
      <div class="sr"><div class="sd" style="background:var(--grn)"></div><span class="sl">已完成</span><span class="sv tc-ok">${s.completedOrders}</span></div>
      <div class="sr"><div class="sd" style="background:var(--ac)"></div><span class="sl">总设备</span><span class="sv">${s.totalDevices}</span></div></div>
    <div class="card"><div class="card-h"><span class="card-t">库存</span></div>
      <div class="sr"><div class="sd" style="background:var(--blu)"></div><span class="sl">总值</span><span class="sv">¥${fmtM(s.totalPartsValue)}</span></div>
      <div class="sr"><div class="sd" style="background:var(--red)"></div><span class="sl">低库存</span><span class="sv ${s.lowStockParts>0?'tc-err':''}">${s.lowStockParts}种</span></div>
      <div class="sr"><div class="sd" style="background:var(--grn)"></div><span class="sl">客户</span><span class="sv">${s.totalCustomers}家</span></div></div></div>`;
}
async function doExport(){
  const data=await api('/api/export');
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');
  a.href=url;a.download=`repair_export_${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);
  toast('数据已导出','success');
}

// ═══ SETTINGS ═══
function rs(el){
  $('npBody').innerHTML=`<div style="padding:8px 14px"><div class="ni active">⚙️ 系统设置</div><div class="ni-sep"></div>
    <div class="ni" onclick="doExport()"><span class="ni-ico">📥</span> <span style="flex:1;font-size:12px">导出数据</span></div></div>`;
  el.innerHTML=`<div class="ph"><h2>系统设置</h2></div>
    <div class="g2"><div class="card"><div class="card-h"><span class="card-t">👤 账户</span></div>
      <div class="ir"><span class="il">用户名</span><span class="iv">admin</span></div>
      <div class="ir"><span class="il">名称</span><span class="iv">管理员</span></div>
      <div class="ir"><span class="il">角色</span><span class="iv">管理员</span></div></div>
    <div class="card"><div class="card-h"><span class="card-t">💾 数据库</span></div>
      <div class="ir"><span class="il">类型</span><span class="iv">SQLite</span></div>
      <div class="ir"><span class="il">存储</span><span class="iv">本地 data/repair.db</span></div>
      <div class="ir"><span class="il">安全</span><span class="iv">数据不离开本机</span></div></div></div>
    <div class="card mt"><div class="card-h"><span class="card-t">📥 数据导出</span></div>
      <p style="font-size:12px;color:var(--t3);margin-bottom:14px">导出所有数据为JSON文件</p>
      <button class="btn btn-s" onclick="doExport()">导出JSON</button></div>`;
}
function doBackup(){doExport();toast('数据已导出为JSON文件','success')}

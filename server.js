const express = require('express');
const Database = require('better-sqlite3');
const crypto = require('crypto');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3456;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ═══ Database ═══
const dbPath = path.join(__dirname, 'data', 'repair.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = crypto.randomBytes(1)[0] % 16;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// ═══ Init Tables ═══
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
    salt TEXT NOT NULL, role TEXT DEFAULT 'admin', display_name TEXT NOT NULL, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY, code TEXT, name TEXT NOT NULL, type TEXT DEFAULT '企业',
    contact_person TEXT, contact_phone TEXT, wechat TEXT, address TEXT,
    total_devices INTEGER DEFAULT 0, total_orders INTEGER DEFAULT 0, total_spent REAL DEFAULT 0,
    contract_status TEXT DEFAULT '无合同', payment_method TEXT DEFAULT '现结',
    credit_days INTEGER DEFAULT 0, credit_limit REAL DEFAULT 0, current_debt REAL DEFAULT 0,
    level TEXT DEFAULT '普通', created_at TEXT NOT NULL, last_order_at TEXT NOT NULL, notes TEXT
  );
  CREATE TABLE IF NOT EXISTS batch_orders (
    id TEXT PRIMARY KEY, order_number TEXT UNIQUE NOT NULL, customer_id TEXT NOT NULL,
    status TEXT DEFAULT '待接单', total_devices INTEGER DEFAULT 0,
    mouse_count INTEGER DEFAULT 0, keyboard_count INTEGER DEFAULT 0,
    headphone_count INTEGER DEFAULT 0, other_count INTEGER DEFAULT 0,
    fault_summary TEXT, repair_plan TEXT,
    inbound_tracking TEXT, outbound_tracking TEXT,
    inspection_notes TEXT, repair_notes TEXT, qc_notes TEXT,
    estimated_unit_price REAL DEFAULT 0, estimated_total REAL DEFAULT 0,
    assigned_technician TEXT, expected_completion TEXT,
    received_at TEXT, inspected_at TEXT, repair_started_at TEXT, qc_at TEXT, shipped_at TEXT, actual_completion TEXT,
    actual_amount REAL DEFAULT 0, payment_method TEXT DEFAULT '月结',
    payment_status TEXT DEFAULT '待付款', notes TEXT, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY, batch_order_id TEXT NOT NULL, sequence_number TEXT,
    device_type TEXT DEFAULT '鼠标', brand_model TEXT, serial_number TEXT,
    appearance TEXT DEFAULT '良好', fault_description TEXT, precheck_result TEXT,
    repair_action TEXT, replaced_parts TEXT, parts_cost REAL DEFAULT 0,
    labor_cost REAL DEFAULT 0, subtotal REAL DEFAULT 0, technician TEXT,
    status TEXT DEFAULT '待检', qc_result TEXT DEFAULT '待检', notes TEXT
  );
  CREATE TABLE IF NOT EXISTS parts (
    id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, spec TEXT,
    category TEXT, unit TEXT DEFAULT '个', safety_stock INTEGER DEFAULT 20,
    max_stock INTEGER DEFAULT 100, current_stock INTEGER DEFAULT 0,
    cost_price REAL DEFAULT 0, month_in INTEGER DEFAULT 0, month_out INTEGER DEFAULT 0,
    supplier TEXT, last_in_date TEXT NOT NULL, location TEXT
  );
  CREATE TABLE IF NOT EXISTS part_transactions (
    id TEXT PRIMARY KEY, date TEXT NOT NULL, type TEXT NOT NULL,
    batch_order_number TEXT, part_code TEXT NOT NULL, part_name TEXT NOT NULL,
    quantity INTEGER NOT NULL, unit_price REAL NOT NULL, amount REAL NOT NULL,
    operator TEXT, counterparty TEXT, notes TEXT
  );
`);

// Migrations
try { db.exec("ALTER TABLE customers ADD COLUMN wechat TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE batch_orders ADD COLUMN inbound_tracking TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE batch_orders ADD COLUMN outbound_tracking TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE batch_orders ADD COLUMN inspection_notes TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE batch_orders ADD COLUMN repair_notes TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE batch_orders ADD COLUMN qc_notes TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE batch_orders ADD COLUMN received_at TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE batch_orders ADD COLUMN inspected_at TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE batch_orders ADD COLUMN repair_started_at TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE batch_orders ADD COLUMN qc_at TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE batch_orders ADD COLUMN shipped_at TEXT"); } catch(e) {}

// Seed admin
if (!db.prepare('SELECT id FROM users WHERE username=?').get('admin')) {
  const salt = crypto.randomBytes(8).toString('hex');
  db.prepare('INSERT INTO users (id,username,password_hash,salt,role,display_name,created_at) VALUES (?,?,?,?,?,?,?)')
    .run(uuid(), 'admin', require('crypto').createHash('sha256').update('admin123' + salt).digest('hex'), salt, 'admin', '管理员', new Date().toISOString());
}

// Seed parts
if (db.prepare('SELECT COUNT(*) as c FROM parts').get().c === 0) {
  const ins = db.prepare('INSERT INTO parts (id,code,name,spec,category,unit,safety_stock,max_stock,current_stock,cost_price,supplier,last_in_date,location) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)');
  const now = new Date().toISOString();
  [['SW-OMRON-D2F01','欧姆龙微动开关','D2F-01','鼠标-微动','个',30,200,85,2.5,'深圳微动电子','A1'],
   ['SW-TTC-GOLD','TTC金粉微动','3pin','鼠标-微动','个',20,100,45,4.0,'TTC官方','A1'],
   ['KS-GATERON-RED','佳达隆红轴','G Pro','键盘-轴体','个',50,300,120,2.8,'佳达隆官方','A2'],
   ['KS-CHERRY-MX','Cherry MX红轴','MX Red','键盘-轴体','个',30,150,65,5.0,'Cherry代理','A2'],
   ['EA-HYPERX-C2','HyperX Cloud II耳罩','原装','耳机-耳罩','对',10,40,22,12.0,'HyperX代理','A3'],
   ['BA-3.7V-800','锂电池','3.7V 800mAh','耳机-电池','个',15,60,28,8.0,'深圳电池厂','A3'],
   ['CB-USBC-1M','Type-C数据线','1m编织','通用-线材','根',20,80,45,3.5,'线材批发','B4'],
   ['FD-ALCOHOL','无水酒精','99.5% 500ml','通用-清洁','瓶',5,15,8,15.0,'化学试剂','B4'],
  ].forEach(s => ins.run(uuid(), s[0],s[1],s[2],s[3],s[4],s[5],s[6],s[7],s[8],s[9],now,s[10]));
}

// ═══ Customers ═══
app.get('/api/customers', (req, res) => {
  const { search } = req.query;
  if (search) {
    res.json(db.prepare('SELECT * FROM customers WHERE name LIKE ? OR contact_person LIKE ? OR contact_phone LIKE ? ORDER BY last_order_at DESC')
      .all(`%${search}%`, `%${search}%`, `%${search}%`));
  } else {
    res.json(db.prepare('SELECT * FROM customers ORDER BY last_order_at DESC').all());
  }
});

app.post('/api/customers', (req, res) => {
  const d = req.body; const id = uuid(); const now = new Date().toISOString();
  db.prepare('INSERT INTO customers (id,code,name,type,contact_person,contact_phone,wechat,address,contract_status,payment_method,level,created_at,last_order_at,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, d.code||'', d.name, d.type||'企业', d.contactPerson||'', d.contactPhone||'', d.wechat||'', d.address||'', d.contractStatus||'无合同', d.paymentMethod||'现结', d.level||'普通', now, now, d.notes||'');
  res.json(id);
});

app.put('/api/customers/:id', (req, res) => {
  const d = req.body;
  db.prepare('UPDATE customers SET name=?,type=?,contact_person=?,contact_phone=?,wechat=?,address=?,contract_status=?,payment_method=?,level=?,notes=?,last_order_at=? WHERE id=?')
    .run(d.name, d.type, d.contactPerson, d.contactPhone, d.wechat||'', d.address||'', d.contractStatus||'无合同', d.paymentMethod||'现结', d.level||'普通', d.notes||'', new Date().toISOString(), req.params.id);
  res.json(true);
});

app.delete('/api/customers/:id', (req, res) => {
  db.prepare('DELETE FROM customers WHERE id=?').run(req.params.id);
  res.json(true);
});

// ═══ Batch Orders (Workflow) ═══
const STATUS_FLOW = ['待接单','已入库','待修中','修理中','复检中','待发货','待付款','已完成'];

app.get('/api/orders', (req, res) => {
  const { status } = req.query;
  if (status && status !== '全部') {
    res.json(db.prepare('SELECT * FROM batch_orders WHERE status=? ORDER BY created_at DESC').all(status));
  } else {
    res.json(db.prepare('SELECT * FROM batch_orders ORDER BY created_at DESC').all());
  }
});

app.get('/api/orders/:id', (req, res) => {
  res.json(db.prepare('SELECT * FROM batch_orders WHERE id=?').get(req.params.id));
});

app.post('/api/orders', (req, res) => {
  const d = req.body; const id = uuid(); const now = new Date();
  const prefix = `BL-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
  // Use transaction to prevent duplicate order numbers
  const orderNum = db.transaction(() => {
    const cnt = db.prepare("SELECT COUNT(*) as c FROM batch_orders WHERE order_number LIKE ?").get(prefix+'%').c + 1;
    const num = `${prefix}-${String(cnt).padStart(3,'0')}`;
    db.prepare(`INSERT INTO batch_orders (id,order_number,customer_id,status,total_devices,mouse_count,keyboard_count,headphone_count,other_count,fault_summary,inbound_tracking,repair_plan,estimated_unit_price,estimated_total,assigned_technician,expected_completion,payment_method,notes,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, num, d.customerId, '待接单', d.totalDevices||0, d.mouseCount||0, d.keyboardCount||0, d.headphoneCount||0, d.otherCount||0, d.faultSummary||'', d.inboundTracking||'', d.repairPlan||'', d.estimatedUnitPrice||0, d.estimatedTotal||0, d.assignedTechnician||'轮班', d.expectedCompletionDays ? new Date(Date.now() + d.expectedCompletionDays * 86400000).toISOString() : '', d.paymentMethod||'月结', d.notes||'', now.toISOString());
    return num;
  })();
  if (d.customerId) {
    const cs = db.prepare('SELECT COUNT(*) as cnt, COALESCE(SUM(total_devices),0) as dev FROM batch_orders WHERE customer_id=?').get(d.customerId);
    db.prepare('UPDATE customers SET total_orders=?,total_devices=?,last_order_at=? WHERE id=?').run(cs.cnt, cs.dev, now.toISOString(), d.customerId);
  }
  res.json({ id, orderNumber: orderNum });
});

app.put('/api/orders/:id', (req, res) => {
  const d = req.body; const now = new Date().toISOString();

  // Validate status transition if status is being changed
  if (d.status) {
    const current = db.prepare('SELECT status FROM batch_orders WHERE id=?').get(req.params.id);
    if (current) {
      const curIdx = STATUS_FLOW.indexOf(current.status);
      const newIdx = STATUS_FLOW.indexOf(d.status);
      if (newIdx !== -1 && curIdx !== -1 && newIdx < curIdx) {
        return res.status(400).json({ error: `不能从「${current.status}」回退到「${d.status}」` });
      }
    }
  }

  const map = {
    status: 'status', totalDevices: 'total_devices', mouseCount: 'mouse_count',
    keyboardCount: 'keyboard_count', headphoneCount: 'headphone_count', otherCount: 'other_count',
    faultSummary: 'fault_summary', repairPlan: 'repair_plan',
    inboundTracking: 'inbound_tracking', outboundTracking: 'outbound_tracking',
    inspectionNotes: 'inspection_notes', repairNotes: 'repair_notes', qcNotes: 'qc_notes',
    estimatedUnitPrice: 'estimated_unit_price', estimatedTotal: 'estimated_total',
    assignedTechnician: 'assigned_technician', actualAmount: 'actual_amount',
    paymentMethod: 'payment_method', paymentStatus: 'payment_status', notes: 'notes'
  };
  const sets = []; const vals = [];
  for (const [camel, snake] of Object.entries(map)) {
    if (d[camel] !== undefined) { sets.push(`${snake}=?`); vals.push(d[camel]); }
  }
  if (d.expectedCompletionDays) {
    sets.push('expected_completion=?'); vals.push(new Date(Date.now() + d.expectedCompletionDays * 86400000).toISOString());
  }
  if (sets.length === 0) return res.json(true);
  db.prepare(`UPDATE batch_orders SET ${sets.join(',')} WHERE id=?`).run(...vals, req.params.id);

  if (d.status) {
    const cur = db.prepare('SELECT status, received_at, inspected_at, repair_started_at, qc_at FROM batch_orders WHERE id=?').get(req.params.id);
    if (d.status === '已入库' && !cur?.received_at) db.prepare('UPDATE batch_orders SET received_at=? WHERE id=?').run(now, req.params.id);
    if (d.status === '待修中' && !cur?.inspected_at) db.prepare('UPDATE batch_orders SET inspected_at=? WHERE id=?').run(now, req.params.id);
    if (d.status === '修理中' && !cur?.repair_started_at) db.prepare('UPDATE batch_orders SET repair_started_at=? WHERE id=?').run(now, req.params.id);
    if (d.status === '复检中' && !cur?.qc_at) db.prepare('UPDATE batch_orders SET qc_at=? WHERE id=?').run(now, req.params.id);
    if (d.status === '已完成') {
      db.prepare('UPDATE batch_orders SET shipped_at=?, actual_completion=? WHERE id=?').run(now, now, req.params.id);
      const order = db.prepare('SELECT customer_id FROM batch_orders WHERE id=?').get(req.params.id);
      if (order?.customer_id) {
        const cs = db.prepare("SELECT COUNT(*) as cnt, COALESCE(SUM(actual_amount),0) as spent FROM batch_orders WHERE customer_id=? AND status='已完成'").get(order.customer_id);
        const debt = db.prepare("SELECT COALESCE(SUM(actual_amount),0) as unpaid FROM batch_orders WHERE customer_id=? AND status='已完成' AND payment_status='待付款'").get(order.customer_id);
        db.prepare('UPDATE customers SET total_orders=?,total_spent=?,current_debt=? WHERE id=?').run(cs.cnt, cs.spent, debt.unpaid, order.customer_id);
      }
    }
  }
  res.json(true);
});

// ═══ Devices ═══
app.get('/api/orders/:oid/devices', (req, res) => {
  res.json(db.prepare('SELECT * FROM devices WHERE batch_order_id=? ORDER BY sequence_number').all(req.params.oid));
});

app.post('/api/devices', (req, res) => {
  const d = req.body; const id = uuid();
  db.prepare('INSERT INTO devices (id,batch_order_id,sequence_number,device_type,brand_model,serial_number,appearance,fault_description,precheck_result,repair_action,replaced_parts,parts_cost,labor_cost,subtotal,technician,status,qc_result,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, d.batchOrderId, d.sequenceNumber||'', d.deviceType||'鼠标', d.brandModel||'', d.serialNumber||'', d.appearance||'良好', d.faultDescription||'', d.precheckResult||'', d.repairAction||'', d.replacedParts||'', d.partsCost||0, d.laborCost||0, d.subtotal||0, d.technician||'', d.status||'待检', d.qcResult||'待检', d.notes||'');
  res.json(id);
});

app.put('/api/devices/:id', (req, res) => {
  const d = req.body;
  db.prepare('UPDATE devices SET device_type=?,brand_model=?,serial_number=?,appearance=?,fault_description=?,precheck_result=?,repair_action=?,replaced_parts=?,parts_cost=?,labor_cost=?,subtotal=?,technician=?,status=?,qc_result=?,notes=? WHERE id=?')
    .run(d.deviceType, d.brandModel, d.serialNumber, d.appearance, d.faultDescription, d.precheckResult, d.repairAction, d.replacedParts, d.partsCost, d.laborCost, d.subtotal, d.technician, d.status, d.qcResult, d.notes, req.params.id);
  res.json(true);
});

app.delete('/api/devices/:id', (req, res) => {
  db.prepare('DELETE FROM devices WHERE id=?').run(req.params.id);
  res.json(true);
});

// ═══ Parts ═══
app.get('/api/parts', (req, res) => {
  const { search } = req.query;
  if (search) {
    res.json(db.prepare('SELECT * FROM parts WHERE name LIKE ? OR code LIKE ? ORDER BY category,name').all(`%${search}%`, `%${search}%`));
  } else {
    res.json(db.prepare('SELECT * FROM parts ORDER BY category,name').all());
  }
});

app.post('/api/parts', (req, res) => {
  const d = req.body; const id = uuid();
  db.prepare('INSERT INTO parts (id,code,name,spec,category,unit,safety_stock,max_stock,current_stock,cost_price,supplier,last_in_date,location) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, d.code, d.name, d.spec||'', d.category||'', d.unit||'个', d.safetyStock||20, d.maxStock||100, d.currentStock||0, d.costPrice||0, d.supplier||'', new Date().toISOString(), d.location||'');
  res.json(id);
});

app.post('/api/parts/:id/stock', (req, res) => {
  const { qtyChange, type, batchOrderNumber } = req.body;
  const part = db.prepare('SELECT * FROM parts WHERE id=?').get(req.params.id);
  if (!part) return res.status(404).json({ error: 'Part not found' });
  const newStock = part.current_stock + qtyChange;
  // Prevent negative stock
  if (newStock < 0) return res.status(400).json({ error: '库存不足', current: part.current_stock });
  const newIn = type === '入库' ? part.month_in + qtyChange : part.month_in;
  const newOut = type === '出库' ? part.month_out + Math.abs(qtyChange) : part.month_out;
  db.prepare('UPDATE parts SET current_stock=?,month_in=?,month_out=? WHERE id=?').run(newStock, newIn, newOut, req.params.id);
  const d = req.body;
  db.prepare('INSERT INTO part_transactions (id,date,type,batch_order_number,part_code,part_name,quantity,unit_price,amount,operator,counterparty,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(uuid(), new Date().toISOString(), type, batchOrderNumber||'', part.code, part.name, Math.abs(qtyChange), d.unitPrice||0, Math.abs(qtyChange)*(d.unitPrice||0), d.operator||'', d.counterparty||'', d.notes||'');
  res.json(true);
});

// ═══ Stats ═══
app.get('/api/stats', (req, res) => {
  const now = new Date(); const ms = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const r = (q, ...a) => db.prepare(q).get(...a);
  const totalOrders = r('SELECT COUNT(*) as c FROM batch_orders').c;
  const activeOrders = r("SELECT COUNT(*) as c FROM batch_orders WHERE status NOT IN ('已完成','已取消')").c;
  const completedOrders = r("SELECT COUNT(*) as c FROM batch_orders WHERE status='已完成'").c;
  const totalCustomers = r('SELECT COUNT(*) as c FROM customers').c;
  const totalDevices = r('SELECT COUNT(*) as c FROM devices').c;
  const activeDevices = r("SELECT COUNT(*) as c FROM devices WHERE status IN ('待检','维修中')").c;
  const monthRevenue = r("SELECT COALESCE(SUM(actual_amount),0) as t FROM batch_orders WHERE created_at>=? AND status='已完成'", ms).t;
  const monthPartsCost = r("SELECT COALESCE(SUM(amount),0) as t FROM part_transactions WHERE date>=? AND type='出库'", ms).t;
  const lowStockParts = r('SELECT COUNT(*) as c FROM parts WHERE current_stock<safety_stock').c;
  const totalPartsValue = r('SELECT COALESCE(SUM(current_stock*cost_price),0) as t FROM parts').t;
  const orderDist = db.prepare('SELECT status,COUNT(*) as count FROM batch_orders GROUP BY status').all();
  const deviceDist = db.prepare('SELECT device_type,COUNT(*) as count FROM devices GROUP BY device_type').all();
  // Workflow counts
  const pendingReceival = r("SELECT COUNT(*) as c FROM batch_orders WHERE status='待接单'").c;
  const pendingRepair = r("SELECT COUNT(*) as c FROM batch_orders WHERE status IN ('已入库','待修中')").c;
  const inRepair = r("SELECT COUNT(*) as c FROM batch_orders WHERE status='修理中'").c;
  const pendingShip = r("SELECT COUNT(*) as c FROM batch_orders WHERE status='待发货'").c;
  const pendingPayment = r("SELECT COUNT(*) as c FROM batch_orders WHERE status='待付款'").c;
  res.json({ totalOrders, activeOrders, completedOrders, totalCustomers, totalDevices, activeDevices, monthRevenue, monthPartsCost, monthProfit: monthRevenue - monthPartsCost, lowStockParts, totalPartsValue, orderDist, deviceDist, pendingReceival, pendingRepair, inRepair, pendingShip, pendingPaymentWf: pendingPayment });
});

// ═══ Transactions ═══
app.get('/api/transactions', (req, res) => {
  const { partCode, days } = req.query;
  let q = 'SELECT * FROM part_transactions';
  const conditions = []; const args = [];
  if (partCode) { conditions.push('part_code=?'); args.push(partCode); }
  if (days) { conditions.push('date>=?'); args.push(new Date(Date.now() - days * 86400000).toISOString()); }
  if (conditions.length) q += ' WHERE ' + conditions.join(' AND ');
  q += ' ORDER BY date DESC LIMIT 200';
  res.json(db.prepare(q).all(...args));
});

// ═══ Monthly Trends ═══
app.get('/api/trends', (req, res) => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const ms = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
    const me = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();
    const label = `${d.getMonth() + 1}月`;
    const revenue = db.prepare("SELECT COALESCE(SUM(actual_amount),0) as t FROM batch_orders WHERE created_at>=? AND created_at<=? AND status='已完成'").get(ms, me).t;
    const cost = db.prepare("SELECT COALESCE(SUM(amount),0) as t FROM part_transactions WHERE date>=? AND date<=? AND type='出库'").get(ms, me).t;
    const orders = db.prepare("SELECT COUNT(*) as c FROM batch_orders WHERE created_at>=? AND created_at<=?").get(ms, me).c;
    const devices = db.prepare("SELECT COUNT(*) as c FROM devices d JOIN batch_orders o ON d.batch_order_id=o.id WHERE o.created_at>=? AND o.created_at<=?").get(ms, me).c;
    months.push({ label, revenue, cost, profit: revenue - cost, orders, devices });
  }
  res.json(months);
});

// ═══ Alerts ═══
app.get('/api/alerts', (req, res) => {
  const lowStock = db.prepare('SELECT * FROM parts WHERE current_stock < safety_stock ORDER BY (current_stock * 1.0 / safety_stock) ASC').all();
  const overdue = db.prepare("SELECT o.*, c.name as customer_name FROM batch_orders o LEFT JOIN customers c ON o.customer_id=c.id WHERE o.status NOT IN ('已完成','已取消') AND o.expected_completion != '' AND date(o.expected_completion) < date('now') ORDER BY o.expected_completion ASC").all();
  const pendingPayment = db.prepare("SELECT o.*, c.name as customer_name FROM batch_orders o LEFT JOIN customers c ON o.customer_id=c.id WHERE o.payment_status='待付款' AND o.status='已完成' ORDER BY o.created_at DESC").all();
  res.json({ lowStock, overdue, pendingPayment });
});

// ═══ Batch Delete ═══
app.delete('/api/orders/:id', (req, res) => {
  const order = db.prepare('SELECT customer_id FROM batch_orders WHERE id=?').get(req.params.id);
  db.prepare('DELETE FROM part_transactions WHERE batch_order_number IN (SELECT order_number FROM batch_orders WHERE id=?)').run(req.params.id);
  db.prepare('DELETE FROM devices WHERE batch_order_id=?').run(req.params.id);
  db.prepare('DELETE FROM batch_orders WHERE id=?').run(req.params.id);
  if (order && order.customer_id) {
    const cs = db.prepare("SELECT COUNT(*) as cnt, COALESCE(SUM(actual_amount),0) as spent FROM batch_orders WHERE customer_id=? AND status='已完成'").get(order.customer_id);
    const debt = db.prepare("SELECT COALESCE(SUM(actual_amount),0) as unpaid FROM batch_orders WHERE customer_id=? AND status='已完成' AND payment_status='待付款'").get(order.customer_id);
    db.prepare('UPDATE customers SET total_orders=?,total_spent=?,current_debt=? WHERE id=?').run(cs.cnt, cs.spent, debt.unpaid, order.customer_id);
  }
  res.json(true);
});

// ═══ Export ═══
app.get('/api/export', (req, res) => {
  const orders = db.prepare('SELECT * FROM batch_orders ORDER BY created_at DESC').all();
  const customers = db.prepare('SELECT * FROM customers ORDER BY name').all();
  const parts = db.prepare('SELECT * FROM parts ORDER BY category, name').all();
  const txns = db.prepare('SELECT * FROM part_transactions ORDER BY date DESC LIMIT 500').all();
  res.json({ orders, customers, parts, transactions: txns, exportDate: new Date().toISOString() });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  🔧 外设维修工坊管理系统`);
  console.log(`  ─────────────────────`);
  console.log(`  本机访问: http://localhost:${PORT}`);
  console.log(`  局域网:   http://<局域网-IP>:${PORT}\n`);
});

"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Status = "待开始" | "进行中" | "待确认" | "已完成";
type Priority = "高" | "中" | "低";

type Member = {
  id: number;
  name: string;
  role: string;
  avatar: string;
  color: string;
  weeklyLoad: number[];
  note: string;
};

type Task = {
  id: number;
  title: string;
  category: string;
  owner: string;
  quantity: number;
  status: Status;
  priority: Priority;
  due: string;
  risk: string;
};

const days = [
  { label: "周一", date: "24" },
  { label: "周二", date: "25" },
  { label: "周三", date: "26" },
  { label: "周四", date: "27" },
  { label: "周五", date: "28" },
  { label: "周六", date: "29" },
];

const initialMembers: Member[] = [
  { id: 1, name: "林知夏", role: "内容策划", avatar: "林", color: "#397c67", weeklyLoad: [3, 4, 2, 3, 4, 2], note: "周三下午选题会" },
  { id: 2, name: "周予安", role: "视频制作", avatar: "周", color: "#406f8f", weeklyLoad: [4, 4, 3, 4, 3, 2], note: "周二全天拍摄" },
  { id: 3, name: "陈念", role: "视觉设计", avatar: "陈", color: "#b87854", weeklyLoad: [2, 3, 4, 3, 2, 2], note: "周五上午外出" },
  { id: 4, name: "宋一川", role: "账号运营", avatar: "宋", color: "#7b6ba7", weeklyLoad: [3, 2, 3, 4, 3, 3], note: "本周正常" },
];

const initialTasks: Task[] = [
  { id: 1, title: "秋季新品内容策划", category: "品牌内容", owner: "林知夏", quantity: 8, status: "进行中", priority: "高", due: "周三", risk: "等待产品卖点确认" },
  { id: 2, title: "新品开箱短视频", category: "短视频", owner: "周予安", quantity: 12, status: "进行中", priority: "高", due: "周五", risk: "样品周二上午到达" },
  { id: 3, title: "会员日视觉套图", category: "平面设计", owner: "陈念", quantity: 9, status: "待确认", priority: "中", due: "周四", risk: "等待活动价格确认" },
  { id: 4, title: "达人素材二次分发", category: "社媒运营", owner: "宋一川", quantity: 14, status: "待开始", priority: "中", due: "周六", risk: "素材包待补齐" },
  { id: 5, title: "品牌栏目脚本优化", category: "内容策划", owner: "林知夏", quantity: 6, status: "已完成", priority: "低", due: "周二", risk: "无" },
  { id: 6, title: "直播切片包装", category: "视频剪辑", owner: "周予安", quantity: 7, status: "待确认", priority: "高", due: "周五", risk: "需确认字幕样式" },
];

const filters = ["全部", "进行中", "有风险", "已完成"] as const;
type Filter = (typeof filters)[number];

function statusClass(status: Status) {
  return `status status-${status}`;
}

function loadClass(load: number) {
  if (load >= 4) return "load-full";
  if (load >= 3) return "load-busy";
  return "load-open";
}

export default function Home() {
  const [members, setMembers] = useState(initialMembers);
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<Filter>("全部");
  const [editMode, setEditMode] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [modal, setModal] = useState<"task" | "member" | null>(null);
  const [toast, setToast] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem("north-team-tasks");
      const savedMembers = localStorage.getItem("north-team-members");
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedMembers) setMembers(JSON.parse(savedMembers));
    } catch {
      // Invalid local data falls back to the curated demo state.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("north-team-tasks", JSON.stringify(tasks));
    localStorage.setItem("north-team-members", JSON.stringify(members));
  }, [tasks, members, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const totalCapacity = members.length * days.length * 4;
  const booked = members.reduce((sum, member) => sum + member.weeklyLoad.reduce((a, b) => a + b, 0), 0);
  const remaining = Math.max(0, totalCapacity - booked);
  const utilization = totalCapacity ? Math.round((booked / totalCapacity) * 100) : 0;
  const completed = tasks.filter((task) => task.status === "已完成").length;
  const risky = tasks.filter((task) => task.risk !== "无" && task.status !== "已完成").length;

  const visibleTasks = useMemo(() => {
    if (filter === "进行中") return tasks.filter((task) => task.status === "进行中");
    if (filter === "有风险") return tasks.filter((task) => task.risk !== "无" && task.status !== "已完成");
    if (filter === "已完成") return tasks.filter((task) => task.status === "已完成");
    return tasks;
  }, [filter, tasks]);

  function updateStatus(id: number, status: Status) {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, status } : task)));
    setToast("任务状态已更新");
  }

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const task: Task = {
      id: Date.now(),
      title: String(data.get("title") || "新任务"),
      category: String(data.get("category") || "团队任务"),
      owner: String(data.get("owner") || members[0]?.name || "待分配"),
      quantity: Number(data.get("quantity") || 1),
      status: "待开始",
      priority: String(data.get("priority") || "中") as Priority,
      due: String(data.get("due") || "本周"),
      risk: String(data.get("risk") || "无"),
    };
    setTasks((current) => [task, ...current]);
    setModal(null);
    setToast("新任务已加入排期");
  }

  function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "新成员");
    const member: Member = {
      id: Date.now(),
      name,
      role: String(data.get("role") || "团队成员"),
      avatar: name.slice(0, 1),
      color: "#397c67",
      weeklyLoad: [0, 0, 0, 0, 0, 0],
      note: "等待安排本周工作",
    };
    setMembers((current) => [...current, member]);
    setModal(null);
    setToast("新成员已加入团队");
  }

  async function shareBoard() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast("看板链接已复制");
    } catch {
      setToast("可直接复制浏览器地址分享");
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#overview" aria-label="向北团队工作台首页">
          <span className="brand-mark">向</span>
          <span className="brand-copy"><strong>向北团队</strong><small>NORTH TEAM OFFICE</small></span>
        </a>
        <nav className="topnav" aria-label="主要导航">
          <a className="active" href="#overview">总览</a>
          <a href="#schedule">排期</a>
          <a href="#tasks">项目</a>
          <a href="#team">成员</a>
        </nav>
        <div className="top-actions">
          <span className="sync-badge"><i /> 已同步</span>
          <button className="ghost-button desktop-only" type="button" onClick={shareBoard}>分享看板</button>
          <button className={`primary-button ${editMode ? "is-editing" : ""}`} type="button" onClick={() => setEditMode((value) => !value)}>
            {editMode ? "完成管理" : "进入管理"}
          </button>
        </div>
      </header>

      {editMode && (
        <div className="edit-banner">
          <span><i /> 管理模式已开启</span>
          <p>可新增任务、添加成员并更新任务状态；修改会保存在当前设备。</p>
          <button type="button" onClick={() => setModal("task")}>＋ 新建任务</button>
        </div>
      )}

      <div className="page-wrap">
        <section className="welcome-row" id="overview">
          <div>
            <p className="eyebrow">TEAM OVERVIEW · AUG 24–29</p>
            <h1>早上好，团队负责人</h1>
            <p className="lead">本周节奏平稳，有 <strong>{risky} 个事项</strong>需要你关注。</p>
          </div>
          <div className="week-control" aria-label="切换周次">
            <button type="button" aria-label="上一周" onClick={() => setWeekOffset((value) => value - 1)}>‹</button>
            <span>{weekOffset === 0 ? "本周 · 8月24日—29日" : weekOffset < 0 ? "上周 · 8月17日—22日" : "下周 · 8月31日—9月5日"}</span>
            <button type="button" aria-label="下一周" onClick={() => setWeekOffset((value) => value + 1)}>›</button>
          </div>
        </section>

        <section className="capacity-hero" aria-labelledby="capacity-title">
          <div className="hero-copy">
            <span className="section-tag">本周产能</span>
            <h2 id="capacity-title">团队还可承接 <em>{remaining}</em> 个任务点</h2>
            <p>{members.length} 人协作 · 6 个工作日 · 每人每天标准产能 4 点</p>
          </div>
          <div className="capacity-summary">
            <div className="capacity-number"><strong>{remaining}</strong><span>/ {totalCapacity}</span><small>剩余可用</small></div>
            <div className="capacity-bar-wrap">
              <div className="bar-heading"><span>本周已排 {booked} 点</span><b>{utilization}%</b></div>
              <div className="progress-track"><span style={{ width: `${utilization}%` }} /></div>
              <div className="legend"><span><i className="dot used" /> 已排任务 {booked}</span><span><i className="dot free" /> 剩余产能 {remaining}</span></div>
            </div>
          </div>
        </section>

        <section className="metric-grid" aria-label="团队数据概览">
          <article className="metric-card">
            <div className="metric-icon green">↗</div>
            <div><span>本周任务</span><strong>{tasks.length}</strong><small>较上周 +3</small></div>
          </article>
          <article className="metric-card">
            <div className="metric-icon blue">✓</div>
            <div><span>已完成</span><strong>{completed}</strong><small>完成率 {tasks.length ? Math.round((completed / tasks.length) * 100) : 0}%</small></div>
          </article>
          <article className="metric-card">
            <div className="metric-icon amber">!</div>
            <div><span>风险提醒</span><strong>{risky}</strong><small>需要负责人跟进</small></div>
          </article>
          <article className="metric-card">
            <div className="metric-icon violet">◎</div>
            <div><span>团队负载</span><strong>{utilization}%</strong><small>{utilization > 80 ? "接近满载" : "处于健康区间"}</small></div>
          </article>
        </section>

        <section className="project-progress" aria-labelledby="sprint-title">
          <div className="project-main">
            <div className="section-heading">
              <div><span className="section-tag">季度专项</span><h2 id="sprint-title">品牌增长内容冲刺</h2></div>
              <span className="date-chip">周期 8月1日—9月30日</span>
            </div>
            <div className="sprint-content">
              <div><span>总达成进度</span><strong>86 <small>/ 120 项</small></strong></div>
              <b className="percent">72%</b>
            </div>
            <div className="sprint-track"><span style={{ width: "72%" }} /></div>
            <div className="sprint-meta"><span>内容策划 28/36</span><span>视频 34/48</span><span>视觉 24/36</span></div>
          </div>
          <aside className="project-aside">
            <span>周期进度</span><strong>24 <small>/ 61 天</small></strong>
            <div className="mini-track"><span style={{ width: "39%" }} /></div>
            <p>距离目标日还有 37 天</p>
          </aside>
        </section>

        <section className="schedule-section" id="schedule" aria-labelledby="schedule-title">
          <div className="section-heading">
            <div><span className="section-tag">成员排期</span><h2 id="schedule-title">每天标准产能与已排工作</h2></div>
            <div className="capacity-key"><span><i className="key-open" /> 可承接</span><span><i className="key-busy" /> 接近满载</span><span><i className="key-full" /> 已满</span></div>
          </div>
          <div className="schedule-scroll">
            <div className="schedule-grid" style={{ "--columns": days.length } as React.CSSProperties}>
              <div className="schedule-header member-head">成员 / 角色</div>
              {days.map((day) => <div className="schedule-header" key={day.label}><span>{day.label}</span><strong>8/{day.date}</strong></div>)}
              {members.map((member) => (
                <div className="schedule-row" key={member.id}>
                  <div className="member-cell">
                    <span className="avatar" style={{ background: member.color }}>{member.avatar}</span>
                    <div><strong>{member.name}</strong><small>{member.role}</small></div>
                  </div>
                  {days.map((day, index) => {
                    const load = member.weeklyLoad[index] || 0;
                    const free = Math.max(0, 4 - load);
                    return (
                      <div className={`load-cell ${loadClass(load)}`} key={day.label}>
                        <div className="load-top"><strong>{load}/4</strong><span>{free ? `余 ${free}` : "已满"}</span></div>
                        <div className="cell-track"><span style={{ width: `${Math.min(load / 4, 1) * 100}%` }} /></div>
                        <small>{index === 2 && member.note !== "本周正常" ? member.note : load >= 4 ? "今日已排满" : "可继续安排"}</small>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="content-grid">
          <section className="task-panel" id="tasks" aria-labelledby="task-title">
            <div className="section-heading task-heading">
              <div><span className="section-tag">项目跟进</span><h2 id="task-title">本周重点任务</h2></div>
              {editMode && <button className="text-button" type="button" onClick={() => setModal("task")}>＋ 新建任务</button>}
            </div>
            <div className="filter-tabs" role="tablist" aria-label="筛选任务">
              {filters.map((item) => <button className={filter === item ? "active" : ""} type="button" role="tab" aria-selected={filter === item} onClick={() => setFilter(item)} key={item}>{item}</button>)}
            </div>
            <div className="task-table" role="table" aria-label="本周任务列表">
              <div className="task-row task-table-head" role="row"><span>任务名称</span><span>负责人</span><span>状态</span><span>交付</span><span>风险 / 依赖</span></div>
              {visibleTasks.map((task) => (
                <div className="task-row" role="row" key={task.id}>
                  <div className="task-title-cell"><strong>{task.title}</strong><small><b className={`priority p-${task.priority}`}>{task.priority}</b>{task.category} · {task.quantity} 项</small></div>
                  <span className="owner-cell">{task.owner}</span>
                  <div>
                    {editMode ? (
                      <select className={statusClass(task.status)} value={task.status} aria-label={`更新${task.title}状态`} onChange={(event) => updateStatus(task.id, event.target.value as Status)}>
                        <option>待开始</option><option>进行中</option><option>待确认</option><option>已完成</option>
                      </select>
                    ) : <span className={statusClass(task.status)}>{task.status}</span>}
                  </div>
                  <strong className="due-cell">{task.due}</strong>
                  <span className={task.risk === "无" ? "risk-none" : "risk-cell"}>{task.risk}</span>
                </div>
              ))}
              {!visibleTasks.length && <div className="empty-state">当前筛选下暂无任务</div>}
            </div>
          </section>

          <aside className="side-column" id="team">
            <section className="team-panel">
              <div className="aside-heading"><div><span className="section-tag">团队成员</span><h2>本周在线</h2></div><span>{members.length} 人</span></div>
              <div className="member-list">
                {members.map((member) => {
                  const load = member.weeklyLoad.reduce((a, b) => a + b, 0);
                  return (
                    <div className="member-item" key={member.id}>
                      <span className="avatar" style={{ background: member.color }}>{member.avatar}</span>
                      <div><strong>{member.name}</strong><small>{member.role}</small></div>
                      <span className="member-load">{load}/24</span>
                    </div>
                  );
                })}
              </div>
              {editMode && <button className="add-member-button" type="button" onClick={() => setModal("member")}>＋ 添加团队成员</button>}
            </section>

            <section className="attention-panel">
              <div className="aside-heading"><div><span className="section-tag warm">需要关注</span><h2>风险与提醒</h2></div><span className="alert-count">{risky}</span></div>
              <div className="alert-list">
                {tasks.filter((task) => task.risk !== "无" && task.status !== "已完成").slice(0, 3).map((task) => (
                  <article key={task.id}><span>!</span><div><strong>{task.title}</strong><p>{task.risk}</p><small>{task.owner} · {task.due}交付</small></div></article>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>

      <footer>
        <div className="brand footer-brand"><span className="brand-mark">向</span><span className="brand-copy"><strong>向北团队</strong><small>NORTH TEAM OFFICE</small></span></div>
        <p>让每个人看见目标、节奏与下一步。</p>
        <span>数据保存在当前设备 · {new Date().getFullYear()}</span>
      </footer>

      {modal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setModal(null)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <button className="modal-close" type="button" aria-label="关闭" onClick={() => setModal(null)}>×</button>
            <span className="section-tag">{modal === "task" ? "NEW TASK" : "NEW MEMBER"}</span>
            <h2 id="modal-title">{modal === "task" ? "新建团队任务" : "添加团队成员"}</h2>
            {modal === "task" ? (
              <form onSubmit={addTask}>
                <label><span>任务名称</span><input name="title" placeholder="例如：新品发布脚本" required autoFocus /></label>
                <div className="form-grid"><label><span>任务类型</span><input name="category" placeholder="内容策划" required /></label><label><span>任务数量</span><input name="quantity" type="number" min="1" defaultValue="1" required /></label></div>
                  <div className="form-grid"><label><span>负责人</span><select name="owner">{members.map((member) => <option key={member.id}>{member.name}</option>)}</select></label><label><span>优先级</span><select name="priority" defaultValue="中"><option>高</option><option>中</option><option>低</option></select></label></div>
                <div className="form-grid"><label><span>交付时间</span><select name="due"><option>周二</option><option>周三</option><option>周四</option><option>周五</option><option>周六</option></select></label><label><span>风险 / 依赖</span><input name="risk" placeholder="无" /></label></div>
                <button className="primary-button submit-button" type="submit">加入本周排期</button>
              </form>
            ) : (
              <form onSubmit={addMember}>
                <label><span>成员姓名</span><input name="name" placeholder="输入姓名" required autoFocus /></label>
                <label><span>岗位 / 角色</span><input name="role" placeholder="例如：内容策划" required /></label>
                <button className="primary-button submit-button" type="submit">加入团队</button>
              </form>
            )}
          </section>
        </div>
      )}

      <div className={`toast ${toast ? "show" : ""}`} role="status">{toast}</div>
    </main>
  );
}

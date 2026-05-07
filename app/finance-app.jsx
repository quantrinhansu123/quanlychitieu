"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase/client";

const initialTransactions = [];

const categorySeed = [
  { name: "Ăn uống", icon: "AU", kind: "expense" },
  { name: "Cafe", icon: "CF", kind: "expense" },
  { name: "Nhà cửa", icon: "NC", kind: "expense" },
  { name: "Sức khỏe", icon: "SK", kind: "expense" },
  { name: "Di chuyển", icon: "DC", kind: "expense" },
  { name: "Mua sắm", icon: "MS", kind: "expense" },
  { name: "Giải trí", icon: "GT", kind: "expense" },
  { name: "Hóa đơn", icon: "HD", kind: "expense" },
  { name: "Lương", icon: "LG", kind: "income" },
  { name: "Thưởng", icon: "TH", kind: "income" }
];

const budgets = [
  ["Ăn uống", "4.250k / 5.000k", 85],
  ["Mua sắm", "3.800k / 6.000k", 63],
  ["Di chuyển", "1.150k / 2.000k", 58],
  ["Hóa đơn", "2.400k / 3.000k", 80]
];

const navItems = [
  ["overview", "⌂", "Tổng quan", "/"],
  ["history", "≡", "Giao dịch", "/transactions"],
  ["add", "+", "Thêm", "/add-transaction"],
  ["categories", "≣", "Danh mục", "/categories"],
  ["reports", "◔", "Báo cáo", "/reports"],
  ["budget", "▣", "Ngân sách", "/budget"]
];

const titles = {
  overview: "Tổng quan thu chi",
  history: "Lịch sử giao dịch",
  add: "Thêm giao dịch",
  categories: "Quản lý danh mục",
  reports: "Báo cáo phân tích",
  budget: "Thiết lập ngân sách"
};

function TransactionItem({ item, onDelete }) {
  return (
    <article className="item">
      <div className="item-main">
        <div className="circle">{item.icon}</div>
        <div>
          <p className="item-title">{item.title}</p>
          <p className="tiny muted">{item.meta}</p>
        </div>
      </div>
      {onDelete ? (
        <button className="danger danger-compact" type="button" onClick={onDelete} aria-label="Xóa giao dịch">
          Xóa
        </button>
      ) : null}
      <p className={`amount ${item.kind === "income" ? "income" : "expense"}`}>{item.amount}</p>
    </article>
  );
}

function ProgressItem({ item }) {
  return (
    <article className="item progress-item">
      <div className="row">
        <strong>{item[0]}</strong>
        <span className="tiny muted">{item[1]}</span>
      </div>
      <div className="progress">
        <span style={{ width: `${item[2]}%` }} />
      </div>
    </article>
  );
}

function parseK(value) {
  const clean = String(value || "")
    .toLowerCase()
    .replace("k", "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(/[^0-9]/g, "");
  return clean ? Number(clean) : 0;
}

function formatK(value) {
  const n = Number(value || 0);
  const clean = Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
  const s = String(clean).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${s}k`;
}

function formatMoneyDots(value) {
  const clean = String(value || "").replace(/\D/g, "");
  if (!clean) return "0";
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatDateTimeVi(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return String(isoString);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} - ${hh}:${min}`;
}

function monthStartDateString(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}-01`;
}

function yyyyMmDdToday() {
  return new Date().toISOString().slice(0, 10);
}

function toMs(value) {
  const d = new Date(value);
  const ms = d.getTime();
  return Number.isNaN(ms) ? null : ms;
}

function buildBudgetStateFromSeed(seed) {
  return seed.map(([name, meta]) => {
    const parts = String(meta || "").split("/");
    const usedK = parseK(parts[0]);
    const limitK = parseK(parts[1]);
    return { name, usedK, limitK };
  });
}

function CategoriesScreen({ categories, onAddCategory, onUpdateCategory, onDeleteCategory }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [kind, setKind] = useState("expense");
  const [activeTab, setActiveTab] = useState("expense");

  const incomeCategories = useMemo(() => categories.filter((c) => c.kind === "income" || c.kind === "both"), [categories]);
  const expenseCategories = useMemo(() => categories.filter((c) => c.kind === "expense" || c.kind === "both"), [categories]);

  function autoIconFrom(text) {
    const value = String(text || "").trim();
    if (!value) return "DM";
    return value
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => (p[0] ? p[0].toUpperCase() : ""))
      .join("")
      .slice(0, 2) || "DM";
  }

  function handleAdd() {
    const nextName = name.trim();
    if (!nextName) return;
    const nextIcon = (icon.trim() || autoIconFrom(nextName)).slice(0, 2).toUpperCase();
    onAddCategory({ name: nextName, icon: nextIcon, kind });
    setName("");
    setIcon("");
    setKind("expense");
  }

  return (
    <section className="screen active stack">
      <section className="card chart-card stack">
        <div className="row">
          <h2>Thêm danh mục</h2>
          <span className="tiny muted">{categories.length} mục</span>
        </div>
        <div className="category-form">
          <div className="field">
            <label htmlFor="catName">TÊN</label>
            <input id="catName" className="input" placeholder="Ví dụ: Tiền điện" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="catIcon">KÝ HIỆU</label>
            <input id="catIcon" className="input" placeholder="VD: TD" value={icon} onChange={(e) => setIcon(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="catKind">LOẠI</label>
            <select id="catKind" className="select" value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="expense">Chi</option>
              <option value="income">Thu</option>
              <option value="both">Cả hai</option>
            </select>
          </div>
          <button className="primary-action" type="button" onClick={handleAdd}>
            Thêm
          </button>
        </div>
      </section>

      <section className="card chart-card">
        <div className="row" style={{ marginBottom: 10 }}>
          <h2>Danh sách</h2>
          <span className="tiny muted">Chia tab Thu / Chi</span>
        </div>
        <div className="tabs" role="tablist" aria-label="Loại danh mục">
          <button
            className={`tab ${activeTab === "income" ? "active" : ""}`}
            type="button"
            onClick={() => setActiveTab("income")}
          >
            Thu ({incomeCategories.length})
          </button>
          <button
            className={`tab ${activeTab === "expense" ? "active" : ""}`}
            type="button"
            onClick={() => setActiveTab("expense")}
          >
            Chi ({expenseCategories.length})
          </button>
        </div>

        <div className="category-table" style={{ marginTop: 12 }}>
          <div className="category-head">
            <span className="tiny muted">Ký hiệu</span>
            <span className="tiny muted">Tên</span>
            <span className="tiny muted">Loại</span>
            <span className="tiny muted">Xóa</span>
          </div>

          {(activeTab === "income" ? incomeCategories : expenseCategories).map((c) => {
            const idx = categories.indexOf(c);
            return (
              <div className="category-row" key={c.id ?? `${c.name}-${idx}`}>
                <input className="input category-icon-input" value={c.icon} onChange={(e) => onUpdateCategory(idx, { icon: e.target.value })} />
                <input className="input category-name-input" value={c.name} onChange={(e) => onUpdateCategory(idx, { name: e.target.value })} />
                <select className="select category-kind-select" value={c.kind} onChange={(e) => onUpdateCategory(idx, { kind: e.target.value })}>
                  <option value="expense">Chi</option>
                  <option value="income">Thu</option>
                  <option value="both">Cả hai</option>
                </select>
                <button className="danger" type="button" onClick={() => onDeleteCategory(idx)}>
                  Xóa
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
}

function OverviewScreen({ transactions, totals, onJump }) {
  const recentIncome = useMemo(() => transactions.filter((t) => t.kind === "income").slice(0, 4), [transactions]);
  const recentExpense = useMemo(() => transactions.filter((t) => t.kind !== "income").slice(0, 4), [transactions]);

  return (
    <section className="screen active stack" aria-labelledby="page-title">
      <div className="metric-grid">
        <article className="metric">
          <p className="label">Tổng số dư</p>
          <p className="value">{formatMoneyDots(totals.balanceVnd)}đ</p>
          <span className="pill">Thu - Chi</span>
        </article>
        <article className="metric secondary">
          <p className="label">Tổng thu</p>
          <p className="value">{formatMoneyDots(totals.incomeVnd)}đ</p>
          <span className="pill">Tất cả</span>
        </article>
        <article className="metric danger">
          <p className="label">Tổng chi</p>
          <p className="value">{formatMoneyDots(totals.expenseVnd)}đ</p>
          <span className="pill">Tất cả</span>
        </article>
      </div>

      <section className="card chart-card">
        <div className="row">
          <div>
            <h2>Xu hướng chi tiêu</h2>
            <p className="tiny muted">7 ngày qua</p>
          </div>
          <p className="tiny income">Tuần này</p>
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <span className="tiny income">— Thu</span>
          <span className="tiny expense">— Chi</span>
        </div>
        <svg className="chart" viewBox="0 0 420 190" role="img" aria-label="Biểu đồ chi tiêu 7 ngày">
          <defs>
            <linearGradient id="expenseFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#b3261e" stopOpacity="0.18" />
              <stop offset="1" stopColor="#b3261e" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#2ecc71" stopOpacity="0.22" />
              <stop offset="1" stopColor="#2ecc71" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Income line */}
          <path
            d="M10 140 C55 132 70 112 108 98 C150 78 170 95 188 86 C232 66 250 40 276 48 C322 58 330 82 410 38"
            fill="none"
            stroke="#2ecc71"
            strokeLinecap="round"
            strokeWidth="5"
          />
          <path
            d="M10 140 C55 132 70 112 108 98 C150 78 170 95 188 86 C232 66 250 40 276 48 C322 58 330 82 410 38 L410 180 L10 180 Z"
            fill="url(#incomeFill)"
          />

          {/* Expense line */}
          <path
            d="M10 155 C55 150 72 122 108 120 C150 124 160 148 188 132 C232 112 238 78 276 86 C322 96 338 114 410 72"
            fill="none"
            stroke="#b3261e"
            strokeLinecap="round"
            strokeWidth="5"
            opacity="0.95"
          />
          <path
            d="M10 155 C55 150 72 122 108 120 C150 124 160 148 188 132 C232 112 238 78 276 86 C322 96 338 114 410 72 L410 180 L10 180 Z"
            fill="url(#expenseFill)"
          />
          <g fill="#647166" fontSize="12" fontWeight="700">
            <text x="10" y="188">T2</text>
            <text x="72" y="188">T3</text>
            <text x="134" y="188">T4</text>
            <text x="196" y="188">T5</text>
            <text x="258" y="188">T6</text>
            <text x="320" y="188">T7</text>
            <text x="384" y="188">CN</text>
          </g>
        </svg>
      </section>

      <section className="stack">
        <div className="row">
          <h2>Giao dịch gần đây</h2>
          <button className="tab" type="button" onClick={() => onJump("history")}>Xem tất cả</button>
        </div>
        <div className="recent-2col">
          <section className="recent-col">
            <div className="row">
              <h3 className="recent-title income">Thu</h3>
              <span className="tiny muted">{recentIncome.length} mục</span>
            </div>
            <div className="list">
              {recentIncome.map((item) => (
                <TransactionItem item={item} key={`${item.title}-${item.meta}-${item.amount}`} />
              ))}
            </div>
          </section>

          <section className="recent-col">
            <div className="row">
              <h3 className="recent-title expense">Chi</h3>
              <span className="tiny muted">{recentExpense.length} mục</span>
            </div>
            <div className="list">
              {recentExpense.map((item) => (
                <TransactionItem item={item} key={`${item.title}-${item.meta}-${item.amount}`} />
              ))}
            </div>
          </section>
        </div>
      </section>
    </section>
  );
}

function AddScreen({ onSave, categories, onAddCategory }) {
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState("expense");
  const [note, setNote] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [occurredDate, setOccurredDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("");
  const [newCategoryKind, setNewCategoryKind] = useState("expense");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const visibleCategories = useMemo(() => {
    return categories.filter((c) => c.kind === "both" || c.kind === kind);
  }, [categories, kind]);

  useEffect(() => {
    if (!visibleCategories.length) {
      setCategoryName("");
      return;
    }
    const stillExists = visibleCategories.some((c) => c.name === categoryName);
    if (!categoryName || !stillExists) {
      setCategoryName(visibleCategories[0].name);
    }
  }, [visibleCategories, categoryName]);

  function formatMoneyDots(digits) {
    const clean = String(digits || "").replace(/\D/g, "");
    if (!clean) return "";
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function formatDateVi(yyyyMmDd) {
    if (!yyyyMmDd) return "";
    const [yyyy, mm, dd] = yyyyMmDd.split("-");
    if (!yyyy || !mm || !dd) return yyyyMmDd;
    return `${dd}/${mm}/${yyyy}`;
  }

  async function handleSave() {
    const digits = String(amount || "").replace(/\D/g, "");
    if (!digits) return;

    const selectedCategory =
      visibleCategories.find((c) => c.name === categoryName) ||
      visibleCategories[0] ||
      { name: "Khác", icon: "??", kind };

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const occurredAtIso = `${occurredDate}T${hh}:${min}:00`;

    setSaving(true);
    setSaveError("");
    const result = await onSave({
      title: note.trim() || selectedCategory.name,
      meta: `${formatDateVi(occurredDate)} - ${hh}:${min}`,
      amount: `${kind === "income" ? "+" : "-"}${formatMoneyDots(digits)}đ`,
      kind,
      icon: selectedCategory.icon,
      occurredAt: occurredAtIso,
      categoryId: selectedCategory.id ?? null,
      amountVnd: Number(digits)
    });
    setSaving(false);

    if (result?.ok) {
      setAmount("");
      setNote("");
      return;
    }
    setSaveError(result?.message || "Lưu giao dịch thất bại.");
  }

  function handleAddCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    const icon =
      (newCategoryIcon || name)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0] || "")
        .join("")
        .toUpperCase()
        .slice(0, 2) || "DM";

    onAddCategory({ name, icon, kind: newCategoryKind });
    setNewCategoryName("");
    setNewCategoryIcon("");
    setNewCategoryKind("expense");
    setShowAddCategory(false);
  }

  return (
    <section className="screen active stack">
      <div className="field">
        <label htmlFor="amount">SỐ TIỀN</label>
        <input
          id="amount"
          className="input money-input"
          inputMode="numeric"
          placeholder="0"
          value={formatMoneyDots(amount)}
          onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))}
        />
      </div>

      {saveError ? (
        <div className="card add-category-card" role="alert" style={{ borderColor: "rgba(179, 38, 30, 0.35)" }}>
          <p className="tiny expense">{saveError}</p>
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="occurredDate">NGÀY</label>
        <input
          id="occurredDate"
          className="input"
          type="date"
          value={occurredDate}
          onChange={(event) => setOccurredDate(event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="kind">LOẠI GIAO DỊCH</label>
        <select id="kind" className="select" value={kind} onChange={(event) => setKind(event.target.value)}>
          <option value="expense">Chi tiêu</option>
          <option value="income">Thu nhập</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="category">DANH MỤC</label>
        <select
          id="category"
          className="select"
          value={categoryName}
          onChange={(event) => setCategoryName(event.target.value)}
        >
          {visibleCategories.map((c) => (
            <option key={c.name} value={c.name}>
              {c.icon} - {c.name}
            </option>
          ))}
        </select>
        <button className="link" type="button" onClick={() => setShowAddCategory((v) => !v)}>
          {showAddCategory ? "Đóng" : "+ Thêm danh mục"}
        </button>
      </div>

      {showAddCategory ? (
        <section className="card add-category-card">
          <div className="field">
            <label htmlFor="newCategoryName">TÊN DANH MỤC</label>
            <input
              id="newCategoryName"
              className="input"
              placeholder="Ví dụ: Tiền điện"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="newCategoryIcon">KÝ HIỆU (2 CHỮ)</label>
            <input
              id="newCategoryIcon"
              className="input"
              placeholder="Tự tạo nếu để trống"
              value={newCategoryIcon}
              onChange={(event) => setNewCategoryIcon(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="newCategoryKind">LOẠI DANH MỤC</label>
            <select
              id="newCategoryKind"
              className="select"
              value={newCategoryKind}
              onChange={(event) => setNewCategoryKind(event.target.value)}
            >
              <option value="expense">Chi</option>
              <option value="income">Thu</option>
              <option value="both">Cả hai</option>
            </select>
          </div>
          <button className="primary-action" type="button" onClick={handleAddCategory}>
            Thêm danh mục
          </button>
        </section>
      ) : null}
      <div className="field">
        <label htmlFor="note">GHI CHÚ</label>
        <textarea id="note" className="textarea" placeholder="Thêm mô tả giao dịch..." value={note} onChange={(event) => setNote(event.target.value)} />
      </div>
      <button className="primary-action" type="button" onClick={handleSave}>Lưu giao dịch</button>
    </section>
  );
}

const screenRoutes = Object.fromEntries(navItems.map(([id, , , href]) => [id, href]));
const routeScreens = Object.fromEntries(navItems.map(([id, , , href]) => [href, id]));
const employeeScreenRoutes = {
  overview: "/employees",
  history: "/employees/transactions",
  add: "/employees/add-transaction",
  categories: "/employees/categories",
  reports: "/employees/reports",
  budget: "/employees/budget"
};
const employeeRouteScreens = Object.fromEntries(Object.entries(employeeScreenRoutes).map(([id, href]) => [href, id]));

export default function FinanceApp({ initialScreen = "overview" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [supabaseStatus, setSupabaseStatus] = useState("checking");
  const [transactions, setTransactions] = useState(initialTransactions);
  const [budgetRows, setBudgetRows] = useState(() => buildBudgetStateFromSeed(budgets));
  const [categories, setCategories] = useState(() => categorySeed);
  const [budgetMonth] = useState(() => monthStartDateString(new Date()));
  const [reportFrom, setReportFrom] = useState(() => monthStartDateString(new Date()));
  const [reportTo, setReportTo] = useState(() => yyyyMmDdToday());
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newBudgetCategoryId, setNewBudgetCategoryId] = useState("");
  const [newBudgetLimitK, setNewBudgetLimitK] = useState("");

  const screen = routeScreens[pathname] || employeeRouteScreens[pathname] || initialScreen;
  const currentTitle = titles[screen];

  const budgetProgressItems = useMemo(() => {
    return budgetRows.map((row) => {
      const pct = row.limitK > 0 ? Math.min(100, Math.round((row.usedK / row.limitK) * 100)) : 0;
      return [row.name, `${formatK(row.usedK)} / ${formatK(row.limitK)}`, pct];
    });
  }, [budgetRows]);

  const budgetTotals = useMemo(() => {
    const usedK = budgetRows.reduce((sum, row) => sum + (row.usedK || 0), 0);
    const limitK = budgetRows.reduce((sum, row) => sum + (row.limitK || 0), 0);
    const pct = limitK > 0 ? Math.min(100, Math.round((usedK / limitK) * 100)) : 0;
    return { usedK, limitK, pct };
  }, [budgetRows]);

  const transactionTotals = useMemo(() => {
    const incomeVnd = transactions.filter((t) => t.kind === "income").reduce((sum, t) => sum + (t.amountVnd || 0), 0);
    const expenseVnd = transactions.filter((t) => t.kind === "expense").reduce((sum, t) => sum + (t.amountVnd || 0), 0);
    return {
      incomeVnd,
      expenseVnd,
      balanceVnd: incomeVnd - expenseVnd
    };
  }, [transactions]);

  const reportByKind = useMemo(() => {
    const categoryNameById = new Map(categories.filter((c) => c?.id != null).map((c) => [c.id, c.name]));
    const categoryIconById = new Map(categories.filter((c) => c?.id != null).map((c) => [c.id, c.icon]));

    const fromMs = reportFrom ? toMs(`${reportFrom}T00:00:00`) : null;
    const toMsInc = reportTo ? toMs(`${reportTo}T23:59:59`) : null;

    function build(kind) {
      const sums = new Map();
      let total = 0;

      for (const t of transactions) {
        if (t.kind !== kind) continue;
        const occMs = t.occurredAt ? toMs(t.occurredAt) : null;
        if (fromMs != null && occMs != null && occMs < fromMs) continue;
        if (toMsInc != null && occMs != null && occMs > toMsInc) continue;
        const amount = Number(t.amountVnd || 0);
        if (!amount) continue;
        total += amount;

        const catId = t.categoryId ?? null;
        const key = catId ?? "other";
        sums.set(key, (sums.get(key) || 0) + amount);
      }

      const items = Array.from(sums.entries())
        .map(([key, amountVnd]) => {
          const name = key === "other" ? "Khác" : categoryNameById.get(key) || "Khác";
          const icon = key === "other" ? "??" : categoryIconById.get(key) || "??";
          const pct = total > 0 ? Math.min(100, Math.round((amountVnd / total) * 100)) : 0;
          return {
            key: String(key),
            name,
            icon,
            amountVnd,
            pct
          };
        })
        .sort((a, b) => b.amountVnd - a.amountVnd)
        .slice(0, 6);

      return {
        totalVnd: total,
        progressItems: items.map((it) => [`${it.icon} ${it.name}`, `${formatK(Math.round(it.amountVnd / 1000))}`, it.pct])
      };
    }

    return {
      income: build("income"),
      expense: build("expense")
    };
  }, [transactions, categories, reportFrom, reportTo]);

  const reportsEmpty = reportByKind.income.totalVnd === 0 && reportByKind.expense.totalVnd === 0;

  useEffect(() => {
    let isMounted = true;

    fetch("/api/supabase/health")
      .then((response) => response.json())
      .then((result) => {
        if (isMounted) {
          setSupabaseStatus(result.ok ? "connected" : "error");
        }
      })
      .catch(() => {
        if (isMounted) {
          setSupabaseStatus("error");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    supabase
      .from("categories")
      .select("id,name,icon,kind")
      .is("user_id", null)
      .order("id", { ascending: true })
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) return;
        if (!data?.length) return;
        setCategories(data);
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    supabase
      .from("transactions")
      .select("id,kind,amount_vnd,note,occurred_at,category_id,categories(name,icon)")
      .is("user_id", null)
      .order("occurred_at", { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) return;
        if (!data) return;

        const mapped = data.map((row) => {
          const category = row.categories || null;
          const title = row.note?.trim() ? row.note.trim() : category?.name || "Giao dịch";
          const icon = category?.icon || "??";
          const amountText = `${row.kind === "income" ? "+" : "-"}${formatMoneyDots(row.amount_vnd)}đ`;
          return {
            id: row.id,
            title,
            meta: formatDateTimeVi(row.occurred_at),
            amount: amountText,
            kind: row.kind,
            icon,
            occurredAt: row.occurred_at,
            amountVnd: row.amount_vnd,
            categoryId: row.category_id
          };
        });

        setTransactions(mapped);
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    supabase
      .from("budgets")
      .select("id,category_id,month,limit_vnd")
      .is("user_id", null)
      .eq("month", budgetMonth)
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) return;
        if (!data) return;

        const monthKey = budgetMonth.slice(0, 7);

        const next = data
          .filter((b) => b.category_id != null)
          .map((b) => {
            const category = categories.find((c) => c.id === b.category_id);
            const usedVnd = transactions
              .filter((t) => t.kind === "expense" && t.categoryId === b.category_id && String(t.occurredAt || "").startsWith(monthKey))
              .reduce((sum, t) => sum + (t.amountVnd || 0), 0);
            return {
              budgetId: b.id,
              categoryId: b.category_id,
              name: category?.name || "Danh mục",
              usedK: Math.round(usedVnd / 1000),
              limitK: Math.round((b.limit_vnd || 0) / 1000)
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        setBudgetRows(next);
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [budgetMonth, categories, transactions]);

  const expenseCategoryOptions = useMemo(() => {
    return categories.filter((c) => (c.kind === "expense" || c.kind === "both") && c.id != null);
  }, [categories]);

  const existingBudgetCategoryIds = useMemo(() => new Set(budgetRows.map((r) => r.categoryId)), [budgetRows]);

  const addableBudgetCategories = useMemo(() => {
    return expenseCategoryOptions.filter((c) => !existingBudgetCategoryIds.has(c.id));
  }, [expenseCategoryOptions, existingBudgetCategoryIds]);

  useEffect(() => {
    if (newBudgetCategoryId) return;
    if (!addableBudgetCategories.length) return;
    setNewBudgetCategoryId(String(addableBudgetCategories[0].id));
  }, [addableBudgetCategories, newBudgetCategoryId]);

  async function addBudgetRow() {
    const categoryId = Number(newBudgetCategoryId);
    const limitK = Number(String(newBudgetLimitK).replace(/\D/g, "")) || 0;
    if (!categoryId || limitK <= 0) return;

    const { data, error } = await supabase
      .from("budgets")
      .insert({ user_id: null, category_id: categoryId, month: budgetMonth, limit_vnd: limitK * 1000 })
      .select("id,category_id,month,limit_vnd")
      .single();

    if (error || !data) return;

    const category = categories.find((c) => c.id === data.category_id);
    const monthKey = budgetMonth.slice(0, 7);
    const usedVnd = transactions
      .filter((t) => t.kind === "expense" && t.categoryId === data.category_id && String(t.occurredAt || "").startsWith(monthKey))
      .reduce((sum, t) => sum + (t.amountVnd || 0), 0);

    const row = {
      budgetId: data.id,
      categoryId: data.category_id,
      name: category?.name || "Danh mục",
      usedK: Math.round(usedVnd / 1000),
      limitK: Math.round(data.limit_vnd / 1000)
    };

    setBudgetRows((current) => [...current, row]);
    setNewBudgetLimitK("");
    setShowAddBudget(false);
  }

  async function saveBudgetLimit(index) {
    const row = budgetRows[index];
    if (!row?.categoryId) return;
    const limitK = Number(row.limitK || 0);
    if (limitK <= 0) return;

    if (row.budgetId) {
      const { error } = await supabase
        .from("budgets")
        .update({ limit_vnd: limitK * 1000 })
        .eq("id", row.budgetId);
      if (error) return;
      return;
    }

    const { data, error } = await supabase
      .from("budgets")
      .insert({ user_id: null, category_id: row.categoryId, month: budgetMonth, limit_vnd: limitK * 1000 })
      .select("id,category_id,month,limit_vnd")
      .single();

    if (error || !data) return;
    setBudgetRows((current) => current.map((r, i) => (i === index ? { ...r, budgetId: data.id } : r)));
  }

  async function saveTransaction(transaction) {
    try {
      const payload = {
        user_id: null,
        category_id: transaction.categoryId ?? null,
        kind: transaction.kind,
        amount_vnd: transaction.amountVnd,
        note: transaction.title || "",
        occurred_at: transaction.occurredAt || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("transactions")
        .insert(payload)
        .select("id,kind,amount_vnd,note,occurred_at,category_id,categories(name,icon)")
        .single();

      if (error || !data) {
        return { ok: false, message: error?.message || "Không ghi được vào bảng transactions." };
      }

      const category = data.categories || null;
      const title = data.note?.trim() ? data.note.trim() : category?.name || "Giao dịch";
      const icon = category?.icon || "??";
      const amountText = `${data.kind === "income" ? "+" : "-"}${formatMoneyDots(data.amount_vnd)}đ`;
      const mapped = {
        id: data.id,
        title,
        meta: formatDateTimeVi(data.occurred_at),
        amount: amountText,
        kind: data.kind,
        icon,
        occurredAt: data.occurred_at,
        amountVnd: data.amount_vnd,
        categoryId: data.category_id
      };

      setTransactions((current) => [mapped, ...current]);
      goToScreen("history");
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : "Lỗi không xác định khi lưu giao dịch." };
    }
  }

  async function addCategory(next) {
    if (!next?.name) return;
    const name = String(next.name).trim();
    const icon = String(next.icon || "").trim().slice(0, 2).toUpperCase();
    const kind = next.kind === "income" || next.kind === "both" ? next.kind : "expense";
    if (!name) return;

    const { data, error } = await supabase
      .from("categories")
      .insert({ user_id: null, name, icon: icon || "DM", kind })
      .select("id,name,icon,kind")
      .single();

    if (error || !data) return;

    setCategories((current) => {
      if (current.some((c) => String(c.name).toLowerCase() === name.toLowerCase())) return current;
      return [...current, data];
    });
  }

  async function updateCategory(index, patch) {
    const target = categories[index];
    if (!target?.id) return;

    const nextName = patch?.name != null ? String(patch.name) : target.name;
    const nextIcon = patch?.icon != null ? String(patch.icon) : target.icon;
    const nextKind = patch?.kind != null ? String(patch.kind) : target.kind;
    const normalized = {
      name: nextName,
      icon: nextIcon.toUpperCase().slice(0, 2),
      kind: nextKind === "income" || nextKind === "both" ? nextKind : "expense"
    };

    const { data, error } = await supabase
      .from("categories")
      .update(normalized)
      .eq("id", target.id)
      .select("id,name,icon,kind")
      .single();

    if (error || !data) return;

    setCategories((current) => current.map((c, i) => (i === index ? data : c)));
  }

  async function deleteCategory(index) {
    const target = categories[index];
    if (!target?.id) return;

    const { error } = await supabase.from("categories").delete().eq("id", target.id);
    if (error) return;

    setCategories((current) => {
      if (index < 0 || index >= current.length) return current;
      const next = current.filter((_, i) => i !== index);
      return next.length ? next : current;
    });
  }

  async function deleteTransaction(transaction) {
    if (!transaction?.id) return;
    const { error } = await supabase.from("transactions").delete().eq("id", transaction.id);
    if (error) return;
    setTransactions((current) => current.filter((t) => t.id !== transaction.id));
  }

  function goToScreen(nextScreen) {
    const routeMap = pathname === "/employees" || pathname.startsWith("/employees/") ? employeeScreenRoutes : screenRoutes;
    router.push(routeMap[nextScreen] || "/");
  }

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <div className="avatar">QN</div>
          <h1 id="page-title">{currentTitle}</h1>
        </div>
        <div className={`db-status ${supabaseStatus}`} title={`Supabase: ${supabaseStatus}`}>
          <span />
          DB
        </div>
      </header>

      <main className="app">
        {screen === "overview" ? <OverviewScreen transactions={transactions} totals={transactionTotals} onJump={goToScreen} /> : null}
        {screen === "history" ? (
          <section className="screen active stack">
            <div className="tabs" role="tablist" aria-label="Loại giao dịch">
              <button className="tab active" type="button">Tất cả</button>
              <button className="tab" type="button">Tháng này</button>
            </div>
            <div className="list">
              {transactions.map((item) => (
                <TransactionItem item={item} key={item.id ?? `${item.title}-${item.meta}-${item.amount}`} onDelete={() => deleteTransaction(item)} />
              ))}
            </div>
          </section>
        ) : null}
        {screen === "add" ? <AddScreen onSave={saveTransaction} categories={categories} onAddCategory={addCategory} /> : null}
        {screen === "categories" ? (
          <CategoriesScreen
            categories={categories}
            onAddCategory={addCategory}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
          />
        ) : null}
        {screen === "reports" ? (
          <section className="screen active stack">
            <section className="card chart-card">
              <div className="row">
                <div>
                  <h2>Phân tích chi tiêu</h2>
                  <p className="tiny muted">Lọc theo ngày</p>
                </div>
                <strong className="expense">{formatK(Math.round(reportByKind.expense.totalVnd / 1000))}</strong>
              </div>
              <div className="report-filters">
                <div className="field">
                  <label htmlFor="reportFrom">TỪ NGÀY</label>
                  <input id="reportFrom" className="input" type="date" value={reportFrom} onChange={(e) => setReportFrom(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="reportTo">ĐẾN NGÀY</label>
                  <input id="reportTo" className="input" type="date" value={reportTo} onChange={(e) => setReportTo(e.target.value)} />
                </div>
              </div>
            </section>
            {reportsEmpty ? (
              <section className="card chart-card">
                <p className="muted">Chưa có dữ liệu giao dịch trong khoảng ngày đã chọn.</p>
              </section>
            ) : null}
            <div className="report-2col">
              <section className="stack">
                <div className="row">
                  <h2 className="income">Thu</h2>
                  <strong className="income">{formatK(Math.round(reportByKind.income.totalVnd / 1000))}</strong>
                </div>
                <div className="list">
                  {reportByKind.income.progressItems.map((item) => <ProgressItem item={item} key={`income-${item[0]}`} />)}
                </div>
              </section>

              <section className="stack">
                <div className="row">
                  <h2 className="expense">Chi</h2>
                  <strong className="expense">{formatK(Math.round(reportByKind.expense.totalVnd / 1000))}</strong>
                </div>
                <div className="list">
                  {reportByKind.expense.progressItems.map((item) => <ProgressItem item={item} key={`expense-${item[0]}`} />)}
                </div>
              </section>
            </div>
          </section>
        ) : null}
        {screen === "budget" ? (
          <section className="screen active stack">
            <section className="card chart-card">
              <h2>Ngân sách tháng</h2>
              <p className="muted">Đã dùng {formatK(budgetTotals.usedK)} / {formatK(budgetTotals.limitK)}</p>
              <div className="progress page-progress"><span style={{ width: `${budgetTotals.pct}%` }} /></div>
            </section>
            <div className="row">
              <h2>Danh sách ngân sách</h2>
              <button className="tab" type="button" onClick={() => setShowAddBudget((v) => !v)}>
                + Thêm mới
              </button>
            </div>

            {showAddBudget ? (
              <section className="card budget-add-card">
                <div className="field">
                  <label htmlFor="budgetCategory">DANH MỤC</label>
                  <select
                    id="budgetCategory"
                    className="select"
                    value={newBudgetCategoryId}
                    onChange={(e) => setNewBudgetCategoryId(e.target.value)}
                  >
                    {addableBudgetCategories.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.icon} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="budgetLimit">GIỚI HẠN (k)</label>
                  <input
                    id="budgetLimit"
                    className="input"
                    inputMode="numeric"
                    placeholder="Ví dụ: 5000"
                    value={newBudgetLimitK}
                    onChange={(e) => setNewBudgetLimitK(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <button className="primary-action" type="button" onClick={addBudgetRow} disabled={!addableBudgetCategories.length}>
                  Thêm ngân sách
                </button>
              </section>
            ) : null}

            <div className="list">
              {budgetRows.map((row, index) => {
                const pct = row.limitK > 0 ? Math.min(100, Math.round((row.usedK / row.limitK) * 100)) : 0;
                return (
                  <article className="item progress-item budget-item" key={row.name}>
                    <div className="row budget-row">
                      <strong>{row.name}</strong>
                      <div className="budget-edit">
                        <span className="tiny muted">Giới hạn (k)</span>
                        <input
                          className="input budget-input"
                          inputMode="numeric"
                          value={row.limitK}
                          onChange={(event) => {
                            const next = Number(String(event.target.value).replace(/\D/g, "")) || 0;
                            setBudgetRows((current) => current.map((r, i) => (i === index ? { ...r, limitK: next } : r)));
                          }}
                        />
                        <button className="secondary-action" type="button" onClick={() => saveBudgetLimit(index)}>
                          Lưu
                        </button>
                      </div>
                    </div>
                    <div className="row">
                      <span className="tiny muted">{formatK(row.usedK)} / {formatK(row.limitK)}</span>
                      <span className="tiny muted">{pct}%</span>
                    </div>
                    <div className="progress">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </main>

      <nav className="bottom-nav" aria-label="Điều hướng chính">
        {navItems.map(([id, icon, label]) => (
          <button className={`nav-item ${screen === id ? "active" : ""}`} key={id} type="button" onClick={() => goToScreen(id)}>
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

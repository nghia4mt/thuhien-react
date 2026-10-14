import { useState, useEffect, useMemo } from 'react';
import './App.css';

// ---------- Data helpers ----------
const STORAGE_KEY = 'thuong_hron_data';

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getRate(day) {
  const data = loadData();
  return data[day] != null ? parseInt(data[day], 10) : null;
}

function setRate(day, rate) {
  const data = loadData();
  if (rate == null) {
    delete data[day];
  } else {
    data[day] = String(rate);
  }
  saveData(data);
  return data;
}

function pad(n) { return String(n).padStart(2, '0'); }

function toKey(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function formatDateLabel(key) {
  const [y, m, d] = key.split('-').map(Number);
  const week = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date(y, m - 1, d).getDay()];
  return `${y}/${m}/${d} (${week})`;
}

function todayKey() {
  const now = new Date();
  return toKey(now.getFullYear(), now.getMonth(), now.getDate());
}

function isToday(year, month, day) {
  return toKey(year, month, day) === todayKey();
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function startDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

// ---------- Components ----------
function StatCard({ label, value, accent = false }) {
  return (
    <div className="stat">
      <div className="stat__label">{label}</div>
      <div className={`stat__value ${accent ? 'accent' : ''}`}>{value}</div>
      <div className="stat__label">{label === 'Điểm trung bình' ? 'sao' : ''}</div>
    </div>
  );
}

function StarButton({ rate, active, onClick }) {
  return (
    <button
      className={`star-btn ${active ? 'star-active' : 'star-empty'}`}
      data-rate={rate}
      onClick={onClick}
      aria-label={`${rate} sao`}
    >
      ★
    </button>
  );
}

function Calendar({ year, month, onDayClick }) {
  const ratedData = useMemo(() => loadData(), []);

  const total = daysInMonth(year, month);
  const leadDays = startDayOfWeek(year, month);
  const trailingDays = (7 - ((leadDays + total) % 7)) % 7;

  const days = [];
  for (let i = 0; i < leadDays; i++) days.push(null);
  for (let d = 1; d <= total; d++) days.push(d);
  for (let t = 0; t < trailingDays; t++) days.push(null);

  // Check if a date is "editable" (today only)
  const isEditable = (y, m, d) => {
    const today = new Date();
    return y === today.getFullYear() && m === today.getMonth() && d === today.getDate();
  };

  const handleCellClick = (key) => {
    onDayClick(key);
  };

  return (
    <section className="calendar">
      <div className="calendar__weekdays" aria-hidden="true">
        <span>CN</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>
      </div>
      <div className="calendar__grid">
        {days.map((day) => {
          if (day === null) {
            return <div className="calendar__cell disabled" key="empty"></div>;
          }
          const key = toKey(year, month, day);
          const rate = getRate(key);
          const today = isToday(year, month, day);
          const isRated = rate !== null;
          const isEditableDay = isEditable(year, month, day);

          return (
            <div
              className={`calendar__cell ${today ? 'today' : ''} ${isRated ? 'rated' : ''} ${isEditableDay ? '' : 'not-editable'}`}
              data-day={day}
              data-key={key}
              onClick={() => { if (isEditableDay) onDayClick(key); }}
              key={key}
              title={isEditableDay ? '' : `Không sửa được ngày ${formatDateLabel(key)} — chỉ sửa được ngày hôm nay`}
            >
              <span className="day-num">{day}</span>
              {isRated && (
                <div className="day-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`star star--${s} ${s <= rate ? 'star-filled' : 'star-empty'}`}
                      style={{ userSelect: isEditableDay ? 'auto' : 'none', pointerEvents: isEditableDay ? 'auto' : 'none' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StarModal({ day, rate, onClose, onConfirm }) {
  const [selected, setSelected] = useState(rate || 0);

  const handleSelect = (r) => {
    setSelected(r);
  };

  const handleConfirm = () => {
    onConfirm(day, selected);
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-label="Chọn ngôi sao">
      <div className="modal">
        <div className="modal__top">
          <h2 className="modal__title">Chọn mức trưởng thành</h2>
          <button className="modal__close" onClick={onClose} aria-label="Đóng">&times;</button>
        </div>
        <div className="modal__body">
          <p className="modal__day">{formatDateLabel(day)}</p>
          <div className="stars">
            <button
              className={`star-btn ${selected === 0 ? 'star-active' : 'star-empty'}`}
              data-rate={0}
              onClick={() => handleSelect(0)}
              aria-label="0 sao"
            >
              ☆
            </button>
            {[1, 2, 3, 4, 5].map((r) => (
              <StarButton
                key={r}
                rate={r}
                active={selected >= r}
                onClick={() => handleSelect(r)}
              />
            ))}
          </div>
          <p className="modal__hint">
            {selected === 0 ? 'Bạn không yêu cầu sao nào cho ngày hôm nay' : selected > 0 ? `Đã chọn ${selected} sao — nhấn lưu để thay đổi` : 'Nhấn lấy số sao dưới để lưu'}
          </p>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    { rate: 0, desc: 'Không đánh giá' },
    { rate: 1, desc: 'Ngày khó, cần kiên nhẫn' },
    { rate: 2, desc: 'Thấp, chưa ổn' },
    { rate: 3, desc: 'Trung bình, vẫn có chiều sâu' },
    { rate: 4, desc: 'Khá ấn tượng' },
    { rate: 5, desc: 'Rất tốt, vươn xa' },
  ];

  return (
    <section className="legend">
      {items.map((item) => (
        <div className="legend__item" key={item.rate}>
          <span className={`legend__dot dot--${item.rate}`}></span>
          <span>{item.rate === 0 ? '0 sao' : `${item.rate} sao`} — {item.desc}</span>
        </div>
      ))}
    </section>
  );
}

// ---------- Main App ----------
export default function App() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [modalDay, setModalDay] = useState(null);

  const goPrev = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleDayClick = (key) => {
    setModalDay(key);
  };

  const handleStarConfirm = (key, rate) => {
    setRate(key, rate);
  };

  const stats = renderStats(year, month);

  // Reset all data
  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <main className="app">
      <header className="app__header">
        <div className="app__title-wrap">
          <h1>Quá trình trưởng thành của anh</h1>
          <p className="app__subtitle">Mỗi ngày 1 ngôi sao, ghi lại tiến bộ của anh 😄</p>
        </div>
        <div className="app__stats" id="stats" aria-live="polite">
          {stats}
        </div>
      </header>

      <section className="controls">
        <button className="btn btn--icon" id="prevMonth" aria-label="Tháng trước" onClick={goPrev}>‹</button>
        <div className="month-label">
          <span id="yearLabel" className="visually-hidden">{year}</span>
          <select
            id="monthSelect"
            name="month"
            aria-label="Chọn tháng"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>Tháng {i + 1}</option>
            ))}
          </select>
        </div>
        <button className="btn btn--icon" id="nextMonth" aria-label="Tháng sau" onClick={goNext}>›</button>
        <button className="btn btn--icon" id="resetBtn" aria-label="Xóa dữ liệu" onClick={handleReset}>✕</button>
      </section>

      <Calendar year={year} month={month} onDayClick={handleDayClick} />

      <Legend />
      {modalDay && <StarModal day={modalDay} onClose={() => setModalDay(null)} onConfirm={handleStarConfirm} />}
    </main>
  );
}

function renderStats(year, month) {
  const rated = [];
  let sum = 0;
  for (let d = 1; d <= daysInMonth(year, month); d++) {
    const key = toKey(year, month, d);
    const data = loadData();
    if (data[key] != null) {
      const r = parseInt(data[key], 10);
      rated.push({ key, rate: r });
      sum += r;
    }
  }

  const avg = rated.length ? (sum / rated.length).toFixed(1) : '—';
  const totalRated = rated.length;

  return (
    <>
      <div className="stat">
        <div className="stat__label">Tháng này</div>
        <div className="stat__value">{totalRated} / {daysInMonth(year, month)}</div>
        <div className="stat__label">ngày đánh giá</div>
      </div>
      <div className="stat">
        <div className="stat__label">Điểm trung bình</div>
        <div className="stat__value accent">{avg}</div>
        <div className="stat__label">sao</div>
      </div>
    </>
  );
}

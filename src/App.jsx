import { useState, useCallback } from 'react';
import './App.css';

// ---------- Constants ----------
const STORAGE_KEY = 'thuong_hron_data';
const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = Array.from({ length: 12 }, (_, i) => i);

// ---------- Data helpers ----------
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

function getRate(data, day) {
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

// ---------- Date helpers ----------
function pad(n) { return String(n).padStart(2, '0'); }

function toKey(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function formatDateLabel(key) {
  const [y, m, d] = key.split('-').map(Number);
  const week = WEEKDAYS[new Date(y, m - 1, d).getDay()];
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

function isEditableDate(year, month, day) {
  const today = new Date();
  return (
    year === today.getFullYear() &&
    month === today.getMonth() &&
    day === today.getDate()
  );
}

// ---------- Components ----------
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

function Calendar({ year, month, data, onDayClick }) {
  const total = daysInMonth(year, month);
  const leadDays = startDayOfWeek(year, month);
  const trailingDays = (7 - ((leadDays + total) % 7)) % 7;

  const days = [];
  for (let i = 0; i < leadDays; i++) days.push(null);
  for (let d = 1; d <= total; d++) days.push(d);
  for (let t = 0; t < trailingDays; t++) days.push(null);

  return (
    <section className="calendar">
      <div className="calendar__weekdays" aria-hidden="true">
        {WEEKDAYS.map((w) => <span key={w}>{w}</span>)}
      </div>
      <div className="calendar__grid">
        {days.map((day, idx) => {
          if (day === null) {
            return <div className="calendar__cell disabled" key={`empty-${idx}`} />;
          }
          const key = toKey(year, month, day);
          const rate = getRate(data, key);
          const today = isToday(year, month, day);
          const isRated = rate !== null;
          const isEditableDay = isEditableDate(year, month, day);

          return (
            <div
              className={`calendar__cell${today ? ' today' : ''}${isRated ? ' rated' : ''}${isEditableDay ? '' : ' not-editable'}`}
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
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
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

// FIX: Thêm nút "Lưu" để xác nhận sau khi chọn sao
function StarModal({ day, currentRate, onClose, onConfirm }) {
  const [selected, setSelected] = useState(currentRate ?? 0);

  const handleConfirm = () => {
    onConfirm(day, selected);
    onClose();
  };

  const label =
    selected === 0
      ? 'Không đánh giá ngày hôm nay'
      : `Đã chọn ${selected} sao`;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Chọn ngôi sao"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal">
        <div className="modal__top">
          <h2 className="modal__title">Chọn mức trưởng thành</h2>
          <button className="modal__close" onClick={onClose} aria-label="Đóng">
            &times;
          </button>
        </div>
        <div className="modal__body">
          <p className="modal__day">{formatDateLabel(day)}</p>
          <div className="stars">
            {/* Nút 0 sao (xóa đánh giá) */}
            <button
              className={`star-btn ${selected === 0 ? 'star-active' : 'star-empty'}`}
              onClick={() => setSelected(0)}
              aria-label="0 sao"
            >
              ☆
            </button>
            {[1, 2, 3, 4, 5].map((r) => (
              <StarButton
                key={r}
                rate={r}
                active={selected >= r}
                onClick={() => setSelected(r)}
              />
            ))}
          </div>
          <p className="modal__hint">{label}</p>
        </div>
        {/* FIX: Nút xác nhận / lưu */}
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onClose}>
            Huỷ
          </button>
          <button className="btn btn--primary" onClick={handleConfirm}>
            💾 Lưu
          </button>
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
          <span className={`legend__dot dot--${item.rate}`} />
          <span>{item.rate === 0 ? '0 sao' : `${item.rate} sao`} — {item.desc}</span>
        </div>
      ))}
    </section>
  );
}

function Stats({ data, year, month }) {
  let sum = 0;
  let count = 0;
  const total = daysInMonth(year, month);

  for (let d = 1; d <= total; d++) {
    const key = toKey(year, month, d);
    if (data[key] != null) {
      sum += parseInt(data[key], 10);
      count++;
    }
  }

  const avg = count > 0 ? (sum / count).toFixed(1) : '—';

  return (
    <>
      <div className="stat">
        <div className="stat__label">Tháng này</div>
        <div className="stat__value">{count} / {total}</div>
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

// ---------- Main App ----------
export default function App() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [modalDay, setModalDay] = useState(null);
  // FIX: data là state để re-render khi thay đổi
  const [data, setData] = useState(() => loadData());

  const goPrev = useCallback(() => {
    setMonth((m) => {
      if (m === 0) { setYear((y) => y - 1); return 11; }
      return m - 1;
    });
  }, []);

  const goNext = useCallback(() => {
    setMonth((m) => {
      if (m === 11) { setYear((y) => y + 1); return 0; }
      return m + 1;
    });
  }, []);

  const handleDayClick = useCallback((key) => {
    setModalDay(key);
  }, []);

  // FIX: Cập nhật state sau khi lưu để calendar re-render
  const handleStarConfirm = useCallback((key, rate) => {
    const updated = setRate(key, rate === 0 ? null : rate);
    setData({ ...updated });
  }, []);

  // FIX: Cập nhật state sau khi reset để calendar re-render
  const handleReset = useCallback(() => {
    if (!window.confirm('Xoá toàn bộ dữ liệu?')) return;
    localStorage.removeItem(STORAGE_KEY);
    setData({});
  }, []);

  const currentRate = modalDay ? getRate(data, modalDay) : null;

  return (
    <main className="app">
      <header className="app__header">
        <div className="app__title-wrap">
          <h1>Quá trình trưởng thành của anh</h1>
          <p className="app__subtitle">Mỗi ngày 1 ngôi sao, ghi lại tiến bộ của anh 😄</p>
        </div>
        <div className="app__stats" id="stats" aria-live="polite">
          <Stats data={data} year={year} month={month} />
        </div>
      </header>

      <section className="controls">
        <button className="btn btn--icon" aria-label="Tháng trước" onClick={goPrev}>‹</button>
        <div className="month-label">
          <span className="visually-hidden">{year}</span>
          <select
            name="month"
            aria-label="Chọn tháng"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
          >
            {MONTHS.map((i) => (
              <option key={i} value={i}>Tháng {i + 1}</option>
            ))}
          </select>
        </div>
        <button className="btn btn--icon" aria-label="Tháng sau" onClick={goNext}>›</button>
        <button className="btn btn--icon" aria-label="Xóa dữ liệu" onClick={handleReset}>✕</button>
      </section>

      <Calendar year={year} month={month} data={data} onDayClick={handleDayClick} />

      <Legend />

      {modalDay && (
        <StarModal
          day={modalDay}
          currentRate={currentRate}
          onClose={() => setModalDay(null)}
          onConfirm={handleStarConfirm}
        />
      )}
    </main>
  );
}

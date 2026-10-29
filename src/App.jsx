import { useState, useCallback, useEffect } from 'react';
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
      type="button"
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
    <section className="calendar" aria-label="Lịch đánh giá">
      <div className="calendar__weekdays" aria-hidden="true">
        {WEEKDAYS.map((w) => <span key={w}>{w}</span>)}
      </div>
      <div className="calendar__grid">
        {days.map((day, idx) => {
          if (day === null) {
            return <div className="calendar__cell calendar__cell--empty" key={`empty-${idx}`} />;
          }
          const key = toKey(year, month, day);
          const rate = getRate(data, key);
          const today = isToday(year, month, day);
          const isRated = rate !== null;
          const isEditableDay = isEditableDate(year, month, day);
          const CellTag = isEditableDay ? 'button' : 'div';

          return (
            <CellTag
              type={isEditableDay ? 'button' : undefined}
              className={`calendar__cell${today ? ' today' : ''}${isRated ? ' rated' : ''}${isEditableDay ? '' : ' not-editable'}`}
              data-day={day}
              data-key={key}
              onClick={isEditableDay ? () => onDayClick(key) : undefined}
              key={key}
              aria-label={isEditableDay ? `Đánh giá ngày ${formatDateLabel(key)}` : undefined}
              title={isEditableDay ? 'Đánh giá hôm nay' : `Không sửa được ngày ${formatDateLabel(key)} — chỉ sửa được ngày hôm nay`}
            >
              <span className="day-num">{day}</span>
              {isRated && (
                <div className="day-stars" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`star star--${s} ${s <= rate ? 'star-filled' : 'star-empty'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}
              {today && <span className="today-dot" aria-hidden="true" />}
            </CellTag>
          );
        })}
      </div>
    </section>
  );
}

// Nút "Lưu" để xác nhận sau khi chọn sao
function StarModal({ day, currentRate, onClose, onConfirm }) {
  const [selected, setSelected] = useState(currentRate ?? 0);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleConfirm = () => {
    onConfirm(day, selected);
    onClose();
  };

  const STAR_LABELS = {
    0: '😤 giận',
    1: '😠 hôm nay anh thật đáng ghét',
    2: '😒 chưa làm em đủ wao',
    3: '😑 nay cũng tạm mà trừ sao vì làm em gái bùn',
    4: '🥰 có triển vọng thành bạn trai em tương lai rồi đó',
    5: '💖 em chọn đúng người yêu',
  };

  const label = STAR_LABELS[selected];

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
          <div>
            <span className="modal__badge">💗 chấm điểm ngày</span>
            <h2 className="modal__title">Mức trưởng thành</h2>
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Đóng">
            &times;
          </button>
        </div>
        <div className="modal__body">
          <p className="modal__day">{formatDateLabel(day)}</p>
          <div className="stars">
            {/* Nút 0 sao (xóa đánh giá) */}
            <button
              type="button"
              className={`star-btn star-btn--zero ${selected === 0 ? 'star-active' : 'star-empty'}`}
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
        <div className="modal__footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Huỷ
          </button>
          <button type="button" className="btn btn--primary" onClick={handleConfirm}>
            💾 Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    { rate: 0, desc: 'giận' },
    { rate: 1, desc: 'hôm nay anh thật đáng ghét' },
    { rate: 2, desc: 'chưa làm em đủ wao' },
    { rate: 3, desc: 'nay cũng tạm mà trừ sao vì làm em gái bùn' },
    { rate: 4, desc: 'có triển vọng thành bạn trai em tương lai rồi đó' },
    { rate: 5, desc: 'em chọn đúng người yêu' },
  ];

  return (
    <section className="legend" aria-label="Bảng chú thích số sao">
      <div className="legend__head">
        <span className="legend__spark" aria-hidden="true">✦</span>
        <h2 className="legend__title">Ý nghĩa số sao</h2>
        <span className="legend__line" aria-hidden="true" />
      </div>
      <div className="legend__list">
        {items.map((item) => (
          <div className="legend__item" key={item.rate}>
            <span className={`legend__dot dot--${item.rate}`} aria-hidden="true" />
            <span className="legend__badge">{item.rate} sao</span>
            <span className="legend__desc">{item.desc}</span>
          </div>
        ))}
      </div>
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
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <>
      <div className="stat stat--days">
        <span className="stat__icon" aria-hidden="true">🗓️</span>
        <div className="stat__content">
          <span className="stat__label">Tháng này</span>
          <span className="stat__value">
            {count}
            <span className="stat__suffix">/{total}</span>
          </span>
          <span className="stat__label">ngày đánh giá</span>
        </div>
      </div>
      <div className="stat stat--avg">
        <span className="stat__icon" aria-hidden="true">★</span>
        <div className="stat__content">
          <span className="stat__label">Điểm trung bình</span>
          <span className="stat__value">{avg}<span className="stat__suffix"> sao</span></span>
          <span className="stat__label">cả tháng</span>
        </div>
      </div>
      <div className="stat-progress">
        <div
          className="stat-progress__track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label={`Đã đánh giá ${pct}% số ngày trong tháng`}
        >
          <span className="stat-progress__fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="stat-progress__text">{pct}% tháng này</span>
      </div>
    </>
  );
}

// ---------- Main App ----------
export default function App() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [modalDay, setModalDay] = useState(null);
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

  const handleStarConfirm = useCallback((key, rate) => {
    const updated = setRate(key, rate === 0 ? null : rate);
    setData({ ...updated });
  }, []);

  const handleReset = useCallback(() => {
    if (!window.confirm('Xoá toàn bộ dữ liệu?')) return;
    localStorage.removeItem(STORAGE_KEY);
    setData({});
  }, []);

  const currentRate = modalDay ? getRate(data, modalDay) : null;

  return (
    <>
      <div className="bg-decor" aria-hidden="true">
        <span className="blob blob--pink" />
        <span className="blob blob--sky" />
        <span className="blob blob--green" />
        <span className="sparkle sparkle--1">✦</span>
        <span className="sparkle sparkle--2">✧</span>
        <span className="sparkle sparkle--3">✦</span>
        <span className="sparkle sparkle--4">✧</span>
      </div>

      <main className="app">
        <header className="app__header">
          <span className="app__badge">💗 nhật ký của chúng mình</span>
          <h1 className="app__title">
            Quá trình trưởng thành <span className="app__title-tail">của anh</span>
          </h1>
          <p className="app__subtitle">
            Mỗi ngày một ngôi sao, ghi lại tiến bộ của anh 😄
          </p>
          <div className="app__stats" id="stats" aria-live="polite">
            <Stats data={data} year={year} month={month} />
          </div>
        </header>

        <section className="controls" aria-label="Chọn tháng">
          <button type="button" className="btn btn--icon" aria-label="Tháng trước" onClick={goPrev}>
            ‹
          </button>
          <div className="month-label">
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
          <span className="year-chip">{year}</span>
          <button type="button" className="btn btn--icon" aria-label="Tháng sau" onClick={goNext}>
            ›
          </button>
          <button
            type="button"
            className="btn btn--icon btn--danger"
            aria-label="Xóa dữ liệu"
            title="Xoá toàn bộ dữ liệu"
            onClick={handleReset}
          >
            ✕
          </button>
        </section>

        <Calendar year={year} month={month} data={data} onDayClick={handleDayClick} />

        <Legend />

        <footer className="app__footer">
          <span aria-hidden="true">🌸</span>
          mỗi ngày một chút, rồi mình lớn lên
          <span aria-hidden="true">🌿</span>
        </footer>
      </main>

      {modalDay && (
        <StarModal
          day={modalDay}
          currentRate={currentRate}
          onClose={() => setModalDay(null)}
          onConfirm={handleStarConfirm}
        />
      )}
    </>
  );
}

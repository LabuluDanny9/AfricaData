import { useState, useEffect, useRef, useMemo } from 'react';
import './AfricaDataLogo.css';

const VIEWBOX = { w: 200, h: 240 };

const NODE_COLORS = [
  '#c41e3a', '#22c55e', '#eab308', '#3b82f6',
  '#0f172a', '#f97316', '#a855f7', '#84cc16',
];

const TARGETS = [
  { x: 100, y: 28 },
  { x: 72, y: 95 },
  { x: 85, y: 62 },
  { x: 100, y: 42 },
  { x: 115, y: 62 },
  { x: 128, y: 95 },
  { x: 58, y: 195 },
  { x: 62, y: 155 },
  { x: 68, y: 115 },
  { x: 75, y: 85 },
  { x: 125, y: 85 },
  { x: 132, y: 115 },
  { x: 138, y: 155 },
  { x: 142, y: 195 },
  { x: 78, y: 128 },
  { x: 122, y: 128 },
];

const A_LEFT_LEG = 'M 100 28 L 58 195';
const A_RIGHT_LEG = 'M 100 28 L 142 195';
const A_CROSSBAR = 'M 72 128 L 128 128';

const LINE_PATHS = [A_LEFT_LEG, A_RIGHT_LEG, A_CROSSBAR];
const LINE_LENGTHS = [172, 172, 56];

function randomIn(min, max) {
  return min + Math.random() * (max - min);
}

function initPositions() {
  return TARGETS.map(() => ({
    x: randomIn(20, VIEWBOX.w - 20),
    y: randomIn(20, VIEWBOX.h - 20),
  }));
}

export default function AfricaDataLogo({ className = '', durationMs = 5000 }) {
  const [positions, setPositions] = useState(initPositions);
  const [phase, setPhase] = useState('moving');
  const [lineProgress, setLineProgress] = useState(0);
  const [textVisible, setTextVisible] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const lineStartRef = useRef(null);

  const nodes = useMemo(() => TARGETS.map((_, i) => ({
    target: TARGETS[i],
    color: NODE_COLORS[i % NODE_COLORS.length],
  })), []);

  useEffect(() => {
    if (phase !== 'moving') return;

    startRef.current = performance.now();
    const factor = 0.078;
    const threshold = 1.2;

    function tick() {
      setPositions((prev) => {
        let allDone = true;
        const next = prev.map((pos, i) => {
          const target = TARGETS[i];
          const dx = target.x - pos.x;
          const dy = target.y - pos.y;
          const dist = Math.hypot(dx, dy);
          if (dist > threshold) allDone = false;
          return {
            x: pos.x + dx * factor,
            y: pos.y + dy * factor,
          };
        });
        if (allDone) {
          setPhase('lines');
          lineStartRef.current = performance.now();
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'lines') return;

    const lineDuration = 800;
    const lineStart = lineStartRef.current ?? performance.now();

    function tick() {
      const elapsed = performance.now() - lineStart;
      const progress = Math.min(1, elapsed / lineDuration);
      const eased = 1 - (1 - progress) * (1 - progress);
      setLineProgress(eased);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPhase('done');
        setTextVisible(true);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  return (
    <div className={`africadata-logo ${className}`.trim()} aria-hidden>
      <svg
        className="africata-logo-svg"
        viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="AfricaData"
      >
        <defs>
          <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {phase === 'lines' || phase === 'done' ? (
          <g className="logo-lines">
            {LINE_PATHS.map((d, i) => {
              const len = LINE_LENGTHS[i] ?? 120;
              const dash = len * lineProgress;
              return (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="#c41e3a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="logo-stroke"
                  style={{
                    strokeDasharray: len,
                    strokeDashoffset: len - dash,
                  }}
                />
              );
            })}
          </g>
        ) : null}

        <g className="logo-nodes">
          {nodes.map((node, i) => (
            <circle
              key={i}
              className="logo-node"
              cx={positions[i]?.x ?? node.target.x}
              cy={positions[i]?.y ?? node.target.y}
              r="6"
              fill={node.color}
              style={{ filter: 'url(#logo-glow)' }}
            />
          ))}
        </g>
      </svg>

      <span
        className={`logo-text ${textVisible ? 'logo-text-visible' : ''}`}
        aria-hidden
      >
        AfricaData
      </span>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Ms from '@/components/Ms';
import { c } from '@/theme/colors';

const THRESHOLD = 70; // kéo quá ngưỡng này thì kích hoạt reload
const MAX_PULL = 110; // độ kéo tối đa hiển thị

/**
 * Kéo-thả-để-reload cho mobile/PWA. Chỉ kích hoạt khi trang đang ở đỉnh
 * (scrollY = 0) và người dùng vuốt xuống. Gọi router.refresh() để lấy data mới
 * mà không reload toàn trang (giữ trạng thái client).
 */
export default function PullToRefresh() {
  const router = useRouter();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const active = useRef(false);
  const pullRef = useRef(0); // giá trị kéo hiện tại, đọc đồng bộ trong onEnd
  const refreshingRef = useRef(false);

  // Cập nhật quãng kéo (cả state để render lẫn ref để đọc đồng bộ).
  const applyPull = (v: number) => {
    pullRef.current = v;
    setPull(v);
  };

  useEffect(() => {
    function onStart(e: TouchEvent) {
      // Chỉ bắt đầu khi đang ở đỉnh trang và không đang refresh.
      if (window.scrollY <= 0 && !refreshingRef.current) {
        startY.current = e.touches[0].clientY;
        active.current = true;
      } else {
        active.current = false;
      }
    }

    function onMove(e: TouchEvent) {
      if (!active.current || startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0 && window.scrollY <= 0) {
        // Hãm dần (resistance) cho cảm giác tự nhiên.
        applyPull(Math.min(MAX_PULL, delta * 0.5));
        if (e.cancelable) e.preventDefault();
      }
    }

    function onEnd() {
      if (!active.current) return;
      active.current = false;
      startY.current = null;
      // Quyết định NGOÀI updater của setState — không gọi router.refresh() trong render.
      if (pullRef.current >= THRESHOLD) {
        refreshingRef.current = true;
        setRefreshing(true);
        applyPull(THRESHOLD);
        router.refresh();
        // Cho spinner hiện một nhịp ngắn rồi ẩn (router.refresh là async ngầm).
        window.setTimeout(() => {
          refreshingRef.current = false;
          setRefreshing(false);
          applyPull(0);
        }, 600);
      } else {
        applyPull(0);
      }
    }

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };
  }, [router]);

  const show = pull > 0 || refreshing;
  const progress = Math.min(1, pull / THRESHOLD);

  return (
    <Box
      sx={{
        display: { xs: 'flex', md: 'none' },
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 60,
        transition: refreshing ? 'transform .2s' : 'none',
        transform: `translateY(${show ? pull : -40}px)`,
        opacity: show ? 1 : 0,
      }}
    >
      <Box
        sx={{
          mt: 1,
          width: 40,
          height: 40,
          borderRadius: 999,
          bgcolor: c.surface,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: c.primary,
        }}
      >
        {refreshing ? (
          <CircularProgress size={22} sx={{ color: c.primary }} />
        ) : (
          <Ms name="refresh" size={22} sx={{ transform: `rotate(${progress * 270}deg)`, transition: 'transform .05s' }} />
        )}
      </Box>
    </Box>
  );
}

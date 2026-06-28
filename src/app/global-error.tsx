'use client';

/** Lỗi cấp cao nhất (kể cả khi root layout hỏng). Phải tự render <html>/<body>. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#fff8f6' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
          <h1 style={{ fontSize: 22, margin: 0, color: '#1f1b16' }}>Ứng dụng gặp sự cố</h1>
          <p style={{ color: '#6b6258', margin: 0 }}>Vui lòng tải lại trang.</p>
          <button
            onClick={reset}
            style={{ padding: '10px 20px', borderRadius: 999, border: 'none', background: '#f97316', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
          >
            Tải lại
          </button>
        </div>
      </body>
    </html>
  );
}

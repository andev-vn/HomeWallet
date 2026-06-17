import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ghim workspace root về thư mục dự án, tránh Next bắt nhầm lockfile ở D:\Code.
  turbopack: {
    root: __dirname,
  },
  // Ẩn huy hiệu dev indicator của Next ở góc màn hình.
  devIndicators: false,
};

export default nextConfig;

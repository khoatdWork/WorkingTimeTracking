import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const root = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`;
  return {
    id: root,
    name: "Đủ giờ · Sổ thời gian làm việc",
    short_name: "Đủ giờ",
    description: "Chấm công, theo dõi WFH và cân đối đủ giờ làm việc mỗi tháng.",
    lang: "vi",
    start_url: root,
    scope: root,
    display: "standalone",
    background_color: "#f4f7fb",
    theme_color: "#2257c7",
    icons: [
      { src: `${root}icons/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${root}icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `${root}icons/maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

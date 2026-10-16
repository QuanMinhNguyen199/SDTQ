// Explore mode đang thử nghiệm, chưa nằm trong BRD/SRS: chỉ bật khi chạy trên máy cục bộ,
// khóa trên bản triển khai (GitHub Pages hoặc bất kỳ tên miền nào khác).
// Ngoài trình duyệt (unit test trong Node) không có giao diện để lộ, nên không chặn.
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

export const isExploreEnabled = (): boolean =>
  typeof window === 'undefined' || LOCAL_HOSTS.has(window.location.hostname);

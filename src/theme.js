// Token cảnh 3D, đồng bộ với biến CSS trong styles.css (design.md §10.4).
export const scenePalette = {
  light: {
    canvas: '#F3F5F8', floor: '#F3F5F8', grid: '#D8E0EA', gridSection: '#C3CFDD',
    block: '#FFFFFF', blockHover: '#F8F0F4', blockSelected: '#FCECF1', blockSide: '#71849B',
    edge: '#71849B', edgeActive: '#BF0D3E', accent: '#BF0D3E', ao: '#0C2340',
    campus: ['#E8EEF5', '#DCE5F0', '#D0DDEB'], shadow: 0.18,
  },
  dark: {
    canvas: '#08192E', floor: '#08192E', grid: '#18334F', gridSection: '#2A4766',
    block: '#183654', blockHover: '#224766', blockSelected: '#3E2943', blockSide: '#8CA1B9',
    edge: '#8CA1B9', edgeActive: '#FF8CA4', accent: '#FF8CA4', ao: '#000000',
    campus: ['#102841', '#183654', '#224361'], shadow: 0.4,
  },
};

// Category accents identify unit types, not organizational rank or approval status.
const UNIT_TONES = {
  Ban: { light: '#BF0D3E', dark: '#FF9AB2', soft: '#FCECF1', darkSoft: '#422B43' },
  Vụ: { light: '#41658D', dark: '#A8C8EF', soft: '#ECF2F9', darkSoft: '#1B3554' },
  Cục: { light: '#176F68', dark: '#8ED7CA', soft: '#E8F5F0', darkSoft: '#173D40' },
  'Văn phòng': { light: '#886024', dark: '#EAC68B', soft: '#FAF1E2', darkSoft: '#3D352A' },
  Phòng: { light: '#625786', dark: '#C8BBE4', soft: '#F0EDF7', darkSoft: '#332F4A' },
};
export function unitTone(type, theme = 'light') {
  const tone = UNIT_TONES[type] || UNIT_TONES.Vụ;
  return { ink: tone[theme === 'dark' ? 'dark' : 'light'], soft: tone[theme === 'dark' ? 'darkSoft' : 'soft'] };
}
export function toneVariables(type, theme = 'light') {
  const tone = unitTone(type, theme);
  return { '--unit-tone': tone.ink, '--unit-soft': tone.soft };
}

// Kích thước khối theo đơn vị cảnh. Ở zoom 1, một đơn vị cảnh ≈ 1px CSS.
// Chiều cao như nhau ở mọi cấp: BRD R-07 — chiều cao 3D không được gợi ý quyền lực pháp lý.
export const BLOCK = { width: 200, depth: 124, height: 44, levelGap: 174 };
export const blockHeight = () => BLOCK.height;

// Camera phối cảnh FOV 35° (design.md §8). "Phối cảnh" nhìn chéo thấp để thấy chiều sâu và mặt bên khối;
// "Từ trên" thẳng trục cây để đọc như sơ đồ phẳng; "Chính diện" gần ngang tầm mắt.
export const FOV = 35;
export const VIEWS = {
  angled: { azimuth: -0.62, polar: 1.0 },
  top: { azimuth: 0, polar: 0.06 },
  front: { azimuth: 0, polar: 1.28 },
};

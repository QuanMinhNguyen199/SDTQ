export type AuthorityCategory = 'budget' | 'operations' | 'data' | 'specialist';
export interface OrgItem { code: string; text: string; category?: AuthorityCategory; items?: OrgItem[] }
export interface OrgUnit {
  id: string; parentId: string | null; name: string; code: string; type: string;
  description: string; leader?: string; duties: OrgItem[]; authorities: OrgItem[];
}
export interface Department extends Omit<OrgUnit, 'duties'> { responsibilities: OrgItem[] }
export interface Station extends OrgUnit { depth: number; clusterId: string }

const department = (id: string, parentId: string | null, name: string, code: string, type: string, description: string, responsibilities: string[], authorities: Array<[AuthorityCategory, string]>): Department => ({
  id, parentId, name, code, type, description, leader: `Phụ trách ${name.toLowerCase()} (vai trò minh họa)`,
  responsibilities: responsibilities.map((text, i) => ({ code: `${i + 1}`, text })),
  authorities: authorities.map(([category, text], i) => ({ code: `${i + 1}`, text, category })),
});

// A separate, explicitly illustrative enterprise dataset. It never replaces the user's working data.
export const orgData: Department[] = [
  department('demo-root', null, 'Ban điều hành', 'ĐH', 'Ban', 'Định hướng và kết nối ba khối chuyên môn của doanh nghiệp mẫu.', ['Xây dựng chiến lược và mục tiêu chung.', 'Điều phối nguồn lực giữa các khối.'], [['budget','Phê duyệt ngân sách trong mô hình minh họa.'],['operations','Thông qua kế hoạch hoạt động.']]),
  department('demo-people','demo-root','Khối Tổ chức & Nhân sự','TCNS','Ban','Phát triển tổ chức và đội ngũ.', ['Hoạch định cơ cấu và phát triển nhân sự.', 'Theo dõi chất lượng nguồn nhân lực.'], [['operations','Đề xuất chính sách nhân sự.'],['data','Truy cập báo cáo nhân sự theo phạm vi được giao.']]),
  department('demo-recruit','demo-people','Phòng Tuyển dụng','TD','Phòng','Kết nối nhu cầu tuyển dụng với các đơn vị.', ['Lập kế hoạch và tổ chức tuyển dụng.', 'Theo dõi trải nghiệm ứng viên.'], [['operations','Điều phối các vòng đánh giá.'],['budget','Đề xuất chi phí tuyển dụng.']]),
  department('demo-talent','demo-recruit','Tổ Phát triển nguồn','TD.1','Phòng','Xây dựng mạng lưới ứng viên phù hợp.', ['Tìm kiếm nguồn ứng viên.', 'Cập nhật dữ liệu tuyển dụng.'], [['data','Quản lý dữ liệu ứng viên được phân công.']]),
  department('demo-learning','demo-people','Phòng Đào tạo','ĐT','Phòng','Xây dựng năng lực cho đội ngũ.', ['Khảo sát nhu cầu đào tạo.', 'Đánh giá chương trình học tập.'], [['operations','Đề xuất chương trình đào tạo.']]),
  department('demo-finance','demo-root','Khối Tài chính','TC','Ban','Lập kế hoạch và quản lý nguồn lực tài chính.', ['Xây dựng kế hoạch tài chính.', 'Theo dõi hiệu quả sử dụng nguồn lực.'], [['budget','Phê duyệt dự toán trong hạn mức được giao.'],['data','Đọc báo cáo tài chính nội bộ.']]),
  department('demo-budget','demo-finance','Phòng Ngân sách','NS','Phòng','Theo dõi dự toán và phân bổ ngân sách.', ['Tổng hợp dự toán các đơn vị.', 'Phân tích chênh lệch ngân sách.'], [['budget','Đề xuất điều chỉnh phân bổ.']]),
  department('demo-cost','demo-budget','Tổ Kiểm soát chi phí','NS.1','Phòng','Đối soát chi phí theo kế hoạch.', ['Kiểm tra hồ sơ chi phí.', 'Tổng hợp báo cáo theo kỳ.'], [['data','Yêu cầu dữ liệu phục vụ đối soát.']]),
  department('demo-account','demo-finance','Phòng Kế toán','KT','Phòng','Bảo đảm tính đầy đủ của hồ sơ kế toán.', ['Ghi nhận nghiệp vụ kế toán.', 'Đối chiếu chứng từ và số liệu.'], [['specialist','Yêu cầu bổ sung chứng từ hợp lệ.']]),
  department('demo-tech','demo-root','Khối Công nghệ','CN','Ban','Xây dựng nền tảng số và các sản phẩm nội bộ.', ['Lập lộ trình phát triển công nghệ.', 'Duy trì chất lượng dịch vụ số.'], [['operations','Ban hành tiêu chuẩn kỹ thuật nội bộ.'],['budget','Đề xuất đầu tư công nghệ.']]),
  department('demo-product','demo-tech','Phòng Phát triển sản phẩm','SP','Phòng','Chuyển nhu cầu sử dụng thành giải pháp số.', ['Phân tích nhu cầu sản phẩm.', 'Phát triển và kiểm thử tính năng.'], [['operations','Sắp xếp các hạng mục phát triển.']]),
  department('demo-engineer','demo-product','Tổ Kỹ thuật','SP.1','Phòng','Triển khai các thành phần phần mềm.', ['Xây dựng và kiểm thử phần mềm.', 'Cải tiến chất lượng kỹ thuật.'], [['data','Truy cập môi trường phát triển theo phân quyền.']]),
  department('demo-platform','demo-tech','Phòng Hạ tầng','HT','Phòng','Bảo đảm hạ tầng và khả năng vận hành.', ['Giám sát hệ thống.', 'Xử lý và phòng ngừa sự cố.'], [['operations','Điều phối xử lý sự cố.']]),
];
export const sampleUnits: OrgUnit[] = orgData.map(({ responsibilities, ...unit }) => ({ ...unit, duties: responsibilities }));

export function orderedStations(units: OrgUnit[]): Station[] {
  const result: Station[] = []; const visited = new Set<string>();
  const children = new Map<string | null, OrgUnit[]>();
  for (const unit of units) children.set(unit.parentId, [...(children.get(unit.parentId) || []), unit]);
  const visit = (unit: OrgUnit, depth: number, clusterId: string) => {
    if (visited.has(unit.id)) return;
    visited.add(unit.id); result.push({ ...unit, depth, clusterId });
    for (const child of children.get(unit.id) || []) visit(child, depth + 1, depth === 0 ? child.id : clusterId);
  };
  for (const root of children.get(null) || []) visit(root, 0, root.id);
  return result;
}
export const categoryLabels: Record<AuthorityCategory, string> = { budget:'Ngân sách', operations:'Vận hành', data:'Dữ liệu', specialist:'Chuyên môn' };

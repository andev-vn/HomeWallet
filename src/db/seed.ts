import { db } from './index';
import { households, householdMembers, users, categories, expenses, userCategoryBudgets, walletTopups } from './schema';
import { hashPassword } from '../features/auth/password';

const avatar = (name: string, bg: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&bold=true`;

async function seed() {
  console.log('Xóa dữ liệu cũ...');
  await db.delete(walletTopups);
  await db.delete(userCategoryBudgets);
  await db.delete(expenses);
  await db.delete(householdMembers);
  await db.delete(households);
  await db.delete(users);
  await db.delete(categories);

  console.log('Tạo danh mục...');
  const cats = await db
    .insert(categories)
    .values([
      { name: 'Ăn uống', icon: 'restaurant', color: '#f97316', monthlyBudget: 6_000_000 },
      { name: 'Di chuyển', icon: 'directions_car', color: '#0284c7', monthlyBudget: 2_000_000 },
      { name: 'Mua sắm', icon: 'shopping_bag', color: '#16a34a', monthlyBudget: 5_000_000 },
      { name: 'Giải trí', icon: 'confirmation_number', color: '#db2777', monthlyBudget: 3_000_000 },
      { name: 'Hóa đơn', icon: 'receipt_long', color: '#9d4300', monthlyBudget: 3_000_000 },
      { name: 'Sức khỏe', icon: 'favorite', color: '#e11d48', monthlyBudget: 2_000_000 },
      { name: 'Gia đình', icon: 'home', color: '#7c3aed', monthlyBudget: 2_000_000 },
      { name: 'Khác', icon: 'more_horiz', color: '#645d58', monthlyBudget: 1_000_000 },
    ])
    .returning();
  const cat = (n: string) => cats.find((c) => c.name === n)!;

  console.log('Tạo người dùng (mật khẩu: 123456)...');
  const pw = hashPassword('123456');
  const [boTuan, meHoa, conHai, beLinh, an] = await db
    .insert(users)
    .values([
      { username: 'botuan', passwordHash: pw, name: 'Bố Tuấn', avatarUrl: avatar('Bo Tuan', 'f97316'), monthlyBudget: 20_000_000 },
      { username: 'mehoa', passwordHash: pw, name: 'Mẹ Hoa', avatarUrl: avatar('Me Hoa', '006398'), monthlyBudget: 15_000_000 },
      { username: 'conhai', passwordHash: pw, name: 'Con Hải', avatarUrl: avatar('Con Hai', '16A34A'), monthlyBudget: 5_000_000 },
      { username: 'belinh', passwordHash: pw, name: 'Bé Linh', avatarUrl: avatar('Be Linh', 'DB2777'), monthlyBudget: 2_000_000 },
      { username: 'an', passwordHash: pw, name: 'An', avatarUrl: avatar('An', '7c3aed'), monthlyBudget: 10_000_000 },
    ])
    .returning();

  console.log('Tạo nhà...');
  // Nhà 1: gia đình, chủ = Bố Tuấn (mã GIADINH). Nhà 2: nhóm phượt, chủ = An (mã PHUOT1).
  const [home, group] = await db
    .insert(households)
    .values([
      { name: 'Tổ Ấm Hạnh Phúc', inviteCode: 'GIADINH', ownerId: boTuan.id },
      { name: 'Nhóm Phượt', inviteCode: 'PHUOT1', ownerId: an.id },
    ])
    .returning();

  console.log('Tạo thành viên (kèm 1 yêu cầu chờ duyệt)...');
  await db.insert(householdMembers).values([
    // Nhà 1
    { householdId: home.id, userId: boTuan.id, role: 'Bố', status: 'active' },
    { householdId: home.id, userId: meHoa.id, role: 'Mẹ', status: 'active' },
    { householdId: home.id, userId: conHai.id, role: 'Con trai', status: 'active' },
    { householdId: home.id, userId: beLinh.id, role: 'Con gái', status: 'pending' }, // chờ Bố Tuấn duyệt
    // Nhà 2 (Bố Tuấn cũng tham gia → 1 user nhiều nhà)
    { householdId: group.id, userId: an.id, role: 'Trưởng nhóm', status: 'active' },
    { householdId: group.id, userId: boTuan.id, role: 'Thành viên', status: 'active' },
  ]);

  console.log('Tạo chi tiêu...');
  // [user, householdId|null, category, amount, note, date]
  type Row = [typeof boTuan, number | null, string, number, string, string];
  // Ngày + giờ:phút:giây (giờ địa phương) để giao dịch có mốc thời gian chi tiết.
  const rows: Row[] = [
    // Nhà 1 (gia đình)
    [meHoa, home.id, 'Ăn uống', 850_000, 'Đi siêu thị Winmart', '2026-06-11T18:42:10'],
    [meHoa, home.id, 'Ăn uống', 320_000, 'Chợ sáng', '2026-06-09T06:51:33'],
    [boTuan, home.id, 'Hóa đơn', 1_200_000, 'Tiền điện tháng 6', '2026-06-08T09:15:02'],
    [boTuan, home.id, 'Di chuyển', 600_000, 'Đổ xăng ô tô', '2026-06-07T07:33:48'],
    [boTuan, home.id, 'Ăn uống', 1_500_000, 'Cả nhà đi ăn tối', '2026-06-06T19:52:21'],
    [meHoa, home.id, 'Mua sắm', 2_300_000, 'Quần áo mùa hè', '2026-06-05T15:18:05'],
    [conHai, home.id, 'Giải trí', 250_000, 'Vé xem phim', '2026-06-05T20:31:40'],
    [conHai, home.id, 'Di chuyển', 180_000, 'Grab đi học thêm', '2026-06-04T17:46:12'],
    [boTuan, home.id, 'Sức khỏe', 800_000, 'Khám sức khỏe', '2026-06-02T08:10:55'],
    [meHoa, home.id, 'Gia đình', 1_000_000, 'Quà sinh nhật ông', '2026-06-02T11:24:30'],
    // tháng trước (nhà 1)
    [boTuan, home.id, 'Hóa đơn', 1_150_000, 'Tiền điện tháng 5', '2026-05-08T09:05:17'],
    [meHoa, home.id, 'Ăn uống', 5_200_000, 'Chợ cả tháng', '2026-05-20T16:41:09'],
    // Nhà 2 (nhóm phượt)
    [an, group.id, 'Di chuyển', 3_000_000, 'Thuê xe đi Đà Lạt', '2026-06-10T07:02:44'],
    [boTuan, group.id, 'Ăn uống', 1_200_000, 'Ăn nhóm', '2026-06-10T12:33:58'],
    // Cá nhân của An (householdId null)
    [an, null, 'Ăn uống', 450_000, 'Cơm trưa văn phòng', '2026-06-10T12:15:26'],
    [an, null, 'Di chuyển', 300_000, 'Xăng xe máy', '2026-06-07T08:06:03'],
  ];

  await db.insert(expenses).values(
    rows.map(([u, householdId, c, amount, note, date]) => ({
      userId: u.id,
      householdId,
      categoryId: cat(c).id,
      amount,
      paymentMethod: amount >= 1_000_000 ? 'transfer' : 'cash',
      note,
      occurredAt: new Date(date),
    })),
  );

  console.log('Nạp tiền vào ví (demo)...');
  // Bố Tuấn & Mẹ Hoa có ví; An để trống → màn chi tiêu của An sẽ ẩn phần ngân sách.
  await db.insert(walletTopups).values([
    { userId: boTuan.id, amount: 20_000_000, note: 'Lương tháng 6', occurredAt: new Date('2026-06-01T09:00:00') },
    { userId: boTuan.id, amount: 2_000_000, note: 'Thưởng', occurredAt: new Date('2026-06-12T10:00:00') },
    { userId: meHoa.id, amount: 15_000_000, note: 'Lương tháng 6', occurredAt: new Date('2026-06-01T09:00:00') },
  ]);

  console.log('Đặt ngân sách danh mục cho từng user (demo)...');
  // Bố Tuấn & Mẹ Hoa đặt ngân sách (lấy theo mức mặc định của danh mục).
  // Các user khác để trống → màn chi tiêu sẽ không hiện phần ngân sách.
  await db.insert(userCategoryBudgets).values(
    [boTuan, meHoa].flatMap((u) =>
      cats
        .filter((cat) => cat.monthlyBudget > 0)
        .map((cat) => ({ userId: u.id, categoryId: cat.id, monthlyBudget: cat.monthlyBudget })),
    ),
  );

  console.log('✓ Seed xong! Đăng nhập: botuan/123456 (2 nhà + 1 yêu cầu chờ duyệt) hoặc an/123456.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

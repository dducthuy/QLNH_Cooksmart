require('dotenv').config();
const {
  sequelize,
  NguoiDung,
  DanhMuc,
  MonAn,
  BanAn,
  NguyenLieu
} = require('./models');

async function seedDatabase() {
  try {
    // Kết nối CSDL
    await sequelize.authenticate();
    console.log("✅ Kết nối cơ sở dữ liệu thành công! Đang tiến hành thêm dữ liệu (Seeding)...");

    // Tự động tạo các bảng nếu chưa có
    await sequelize.sync({ alter: true });

    // 1. Thêm Người Dùng (Admin, Bếp, Phục Vụ)
    console.log("⏳ Đang thêm người dùng...");
    const usersData = [
      { ten_dang_nhap: 'admin', mat_khau: '123456', ho_ten: 'Quản trị viên', vai_tro: 'Admin', trang_thai: true },
      { ten_dang_nhap: 'phucvu1', mat_khau: '123456', ho_ten: 'Nhân viên phục vụ 1', vai_tro: 'PhucVu', trang_thai: true },
      { ten_dang_nhap: 'bep1', mat_khau: '123456', ho_ten: 'Nhân viên bếp 1', vai_tro: 'Bep', trang_thai: true }
    ];
    for (const user of usersData) {
      const existingUser = await NguoiDung.findOne({ where: { ten_dang_nhap: user.ten_dang_nhap } });
      if (!existingUser) {
        await NguoiDung.create(user);
      }
    }
    console.log("✔️ Thêm người dùng hoàn tất!");

    // 2. Thêm Danh Mục
    console.log("⏳ Đang thêm danh mục...");
    const danhMucData = [
      { ten_danh_muc: 'Khai vị' },
      { ten_danh_muc: 'Món chính' },
      { ten_danh_muc: 'Tráng miệng' },
      { ten_danh_muc: 'Đồ uống' }
    ];
    let createdCategories = [];
    for (const dm of danhMucData) {
      const [category, created] = await DanhMuc.findOrCreate({
        where: { ten_danh_muc: dm.ten_danh_muc },
        defaults: dm
      });
      createdCategories.push(category);
    }
    console.log("✔️ Thêm danh mục hoàn tất!");

    // 3. Thêm Món Ăn
    console.log("⏳ Đang thêm món ăn...");
    const monAnData = [
      { id_danh_muc: createdCategories[1].id, ten_mon: 'Phở bò', gia_tien: 50000, mo_ta_ai: 'Phở bò truyền thống, nước dùng thanh ngọt mặn mòi hương vị Việt Nam.', con_hang: true },
      { id_danh_muc: createdCategories[1].id, ten_mon: 'Cơm tấm sườn bì', gia_tien: 45000, mo_ta_ai: 'Cơm tấm sườn chuẩn phong cách miền Nam.', con_hang: true },
      { id_danh_muc: createdCategories[0].id, ten_mon: 'Gỏi cuốn tôm', gia_tien: 30000, mo_ta_ai: 'Gỏi cuốn tôm tươi, ăn kèm tương đậu nành thơm lừng.', con_hang: true },
      { id_danh_muc: createdCategories[3].id, ten_mon: 'Nước chanh', gia_tien: 20000, mo_ta_ai: 'Nước chanh tươi mát, giải khát ngày hè.', con_hang: true },
      { id_danh_muc: createdCategories[2].id, ten_mon: 'Chè khúc bạch', gia_tien: 35000, mo_ta_ai: 'Chè khúc bạch thanh mát, giải nhiệt cực tốt.', con_hang: true }
    ];
    for (const monAn of monAnData) {
      await MonAn.findOrCreate({
        where: { ten_mon: monAn.ten_mon },
        defaults: monAn
      });
    }
    console.log("✔️ Thêm món ăn hoàn tất!");

    // 4. Thêm Bàn Ăn
    console.log("⏳ Đang thêm bàn ăn...");
    const banAnData = [
      { so_ban: 'B01', vi_tri: 'Tầng 1 - Cửa Sổ', trang_thai_ban: 'Trong' },
      { so_ban: 'B02', vi_tri: 'Tầng 1 - Góc Trong', trang_thai_ban: 'Trong' },
      { so_ban: 'B03', vi_tri: 'Tầng 2 - Ngoài Trời', trang_thai_ban: 'Trong' },
      { so_ban: 'B04', vi_tri: 'Tầng 2 - Phòng Lạnh', trang_thai_ban: 'Trong' },
    ];
    for (const ban of banAnData) {
      await BanAn.findOrCreate({
        where: { so_ban: ban.so_ban },
        defaults: ban
      });
    }
    console.log("✔️ Thêm bàn ăn hoàn tất!");

    // 5. Thêm Nguyên Liệu
    console.log("⏳ Đang thêm nguyên liệu...");
    const nguyenLieuData = [
      { ten_nguyen_lieu: 'Thịt bò phi lê', don_vi_tinh: 'kg', so_luong_kho_tong: 15.5, so_luong_tai_bep: 5.0, gia_nhap_gan_nhat: 250000 },
      { ten_nguyen_lieu: 'Gạo ST25', don_vi_tinh: 'kg', so_luong_kho_tong: 50.0, so_luong_tai_bep: 10.0, gia_nhap_gan_nhat: 35000 },
      { ten_nguyen_lieu: 'Tôm sú', don_vi_tinh: 'kg', so_luong_kho_tong: 20.0, so_luong_tai_bep: 3.0, gia_nhap_gan_nhat: 300000 },
      { ten_nguyen_lieu: 'Chanh', don_vi_tinh: 'kg', so_luong_kho_tong: 5.0, so_luong_tai_bep: 1.0, gia_nhap_gan_nhat: 25000 },
    ];
    for (const nl of nguyenLieuData) {
      await NguyenLieu.findOrCreate({
        where: { ten_nguyen_lieu: nl.ten_nguyen_lieu },
        defaults: nl
      });
    }
    console.log("✔️ Thêm nguyên liệu hoàn tất!");

    console.log("🚀 Quá trình thêm dữ liệu (Seeding) đã thành công rực rỡ!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Xảy ra lỗi trong quá trình Seeding: ", error);
    process.exit(1);
  }
}

seedDatabase();

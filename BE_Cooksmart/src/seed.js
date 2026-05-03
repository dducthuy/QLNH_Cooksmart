require('dotenv').config();
const {
  sequelize,
  NguoiDung,
  DanhMuc,
  MonAn,
  BanAn,
  NguyenLieu,
  KhuyenMai,
  Combo,
  ChiTietCombo,
  HoaDon,
  ChiTietHoaDon
} = require('./models');

async function seedDatabase() {
  try {

    await sequelize.authenticate();
    console.log("✅ Kết nối cơ sở dữ liệu thành công! Đang tiến hành thêm dữ liệu (Seeding)...");


    await sequelize.sync({ alter: true });


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
    let createdMonAn = [];
    for (const monAn of monAnData) {
      const [ma, created] = await MonAn.findOrCreate({
        where: { ten_mon: monAn.ten_mon },
        defaults: monAn
      });
      createdMonAn.push(ma);
    }
    console.log("✔️ Thêm món ăn hoàn tất!");

    // 4. Thêm Khuyến Mãi
    console.log("⏳ Đang thêm khuyến mãi mẫu...");
    const khuyenMaiData = [
      {
        ten_km: 'Khai trương giảm giá 10%',
        loai_km: 'PhanTram',
        gia_tri_km: 10,
        gia_tri_dh_toi_thieu: 200000,
        ngay_bat_dau: new Date(),
        ngay_ket_thuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        ten_km: 'Giảm 50k cho đơn từ 1 triệu',
        loai_km: 'SoTien',
        gia_tri_km: 50000,
        gia_tri_dh_toi_thieu: 1000000,
        ngay_bat_dau: new Date(),
        ngay_ket_thuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ];
    for (const km of khuyenMaiData) {
      await KhuyenMai.findOrCreate({
        where: { ten_km: km.ten_km },
        defaults: km
      });
    }
    console.log("✔️ Thêm khuyến mãi hoàn tất!");

    // 5. Thêm Combo
    console.log("⏳ Đang thêm combo mẫu...");
    const comboData = [
      { ten_combo: 'Combo Bữa Trưa Tiết Kiệm', gia_tien: 80000, mo_ta: 'Gồm 1 Cơm tấm sườn bì và 1 Nước chanh', trang_thai: true }
    ];
    for (const cb of comboData) {
      const [combo, created] = await Combo.findOrCreate({
        where: { ten_combo: cb.ten_combo },
        defaults: cb
      });
      if (created) {
        // Thêm chi tiết combo (Cơm tấm sườn bì + Nước chanh)
        const comTam = createdMonAn.find(m => m.ten_mon === 'Cơm tấm sườn bì');
        const nuocChanh = createdMonAn.find(m => m.ten_mon === 'Nước chanh');
        if (comTam) await ChiTietCombo.create({ id_combo: combo.id, id_mon_an: comTam.id, so_luong: 1 });
        if (nuocChanh) await ChiTietCombo.create({ id_combo: combo.id, id_mon_an: nuocChanh.id, so_luong: 1 });
      }
    }
    console.log("✔️ Thêm combo hoàn tất!");

    // 6. Thêm Bàn Ăn
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

    // 7. Thêm Nguyên Liệu
    console.log("⏳ Đang thêm nguyên liệu...");
    const nguyenLieuData = [
      { ten_nguyen_lieu: 'Thịt bò phi lê', don_vi_tinh: 'kg', loai_quan_ly: 'THU_CONG', so_luong_ton: 20.5, gia_nhap_gan_nhat: 250000 },
      { ten_nguyen_lieu: 'Gạo ST25', don_vi_tinh: 'kg', loai_quan_ly: 'THU_CONG', so_luong_ton: 60.0, gia_nhap_gan_nhat: 35000 },
      { ten_nguyen_lieu: 'Tôm sú', don_vi_tinh: 'kg', loai_quan_ly: 'THU_CONG', so_luong_ton: 23.0, gia_nhap_gan_nhat: 300000 },
      { ten_nguyen_lieu: 'Chanh', don_vi_tinh: 'kg', loai_quan_ly: 'THU_CONG', so_luong_ton: 6.0, gia_nhap_gan_nhat: 25000 },
    ];
    for (const nl of nguyenLieuData) {
      await NguyenLieu.findOrCreate({
        where: { ten_nguyen_lieu: nl.ten_nguyen_lieu },
        defaults: nl
      });
    }
    console.log("✔️ Thêm nguyên liệu hoàn tất!");

    // 8. Thêm Hóa Đơn & Chi tiết hóa đơn
    console.log("⏳ Đang thêm hóa đơn mẫu...");
    const phucVu = await NguoiDung.findOne({ where: { vai_tro: 'PhucVu' } });
    const ban1 = await BanAn.findOne({ where: { so_ban: 'B01' } });
    const ban2 = await BanAn.findOne({ where: { so_ban: 'B02' } });

    if (phucVu && ban1 && ban2 && createdMonAn.length >= 4) {
      // Hóa đơn 1 (Đang phục vụ) ở Bàn 1
      const hd1 = await HoaDon.create({
        id_ban: ban1.id,
        id_nhan_vien: phucVu.id,
        tong_tien: 95000,
        phuong_thuc_tt: 'TienMat',
        trang_thai_hd: 'DangPhucVu',
        thoi_gian_tao: new Date(),
        da_chot_kho: false
      });

      // Thêm chi tiết hóa đơn 1 (1 Phở bò - 50k, 1 Cơm tấm - 45k)
      await ChiTietHoaDon.bulkCreate([
        { id_hoa_don: hd1.id, id_mon_an: createdMonAn[0].id, so_luong: 1, trang_thai_mon: 'DaXong' },
        { id_hoa_don: hd1.id, id_mon_an: createdMonAn[1].id, so_luong: 1, trang_thai_mon: 'DangNau' }
      ]);
      await ban1.update({ trang_thai_ban: 'DangPhucVu' });

      // Hóa đơn 2 (Chờ xử lý / Vừa order xong) ở Bàn 2
      const hd2 = await HoaDon.create({
        id_ban: ban2.id,
        id_nhan_vien: phucVu.id,
        tong_tien: 40000,
        phuong_thuc_tt: 'ChuyenKhoan',
        trang_thai_hd: 'ChoXuLy',
        thoi_gian_tao: new Date(),
        da_chot_kho: false
      });

      // Thêm chi tiết cho hóa đơn 2 (2 Nước chanh - 20k x2)
      await ChiTietHoaDon.bulkCreate([
        { id_hoa_don: hd2.id, id_mon_an: createdMonAn[3].id, so_luong: 2, trang_thai_mon: 'DangCho' }
      ]);
      await ban2.update({ trang_thai_ban: 'DangPhucVu' });

      console.log("✔️ Thêm hóa đơn mẫu hoàn tất!");
    } else {
      console.log("⚠️ Thiếu dữ liệu (Bàn/Nhân viên/Món ăn) để tạo hóa đơn mẫu.");
    }

    console.log("🚀 Quá trình thêm dữ liệu (Seeding) đã thành công rực rỡ!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Xảy ra lỗi trong quá trình Seeding: ", error);
    process.exit(1);
  }
}

seedDatabase();

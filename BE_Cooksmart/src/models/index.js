const sequelize = require("../config/db");


const NguoiDung = require("./NguoiDung");
const BanAn = require("./BanAn");
const DanhMuc = require("./DanhMuc");
const MonAn = require("./MonAn");
const LoaiNguyenLieu = require("./LoaiNguyenLieu");
const NguyenLieu = require("./NguyenLieu");
const DinhMucMonAn = require("./DinhMucMonAn");
const NhatKyKho = require("./NhatKyKho");
const ChiTietNhatKyKho = require("./ChiTietNhatKyKho");
const HoaDon = require("./HoaDon");
const ChiTietHoaDon = require("./ChiTietHoaDon");
const KetCa = require("./KetCa");
const ChiTietBaoCaoHaoHut = require("./BaoCaoHaoHut");
const BaoCaoTaiChinh = require("./BaoCaoTaiChinh");
const ThongBao = require("./ThongBao");
const KhuyenMai = require("./KhuyenMai");
const Combo = require("./Combo");
const ChiTietCombo = require("./ChiTietCombo");
const ChiTieuCa = require("./ChiTieuCa");



DanhMuc.hasMany(MonAn, { foreignKey: "id_danh_muc", onDelete: "SET NULL" });
MonAn.belongsTo(DanhMuc, { foreignKey: "id_danh_muc" });

MonAn.hasMany(DinhMucMonAn, { foreignKey: "id_mon_an", onDelete: "CASCADE" });
DinhMucMonAn.belongsTo(MonAn, { foreignKey: "id_mon_an" });

LoaiNguyenLieu.hasMany(NguyenLieu, { foreignKey: "id_loai_nguyen_lieu", onDelete: "SET NULL" });
NguyenLieu.belongsTo(LoaiNguyenLieu, { foreignKey: "id_loai_nguyen_lieu" });

NguyenLieu.hasMany(DinhMucMonAn, { foreignKey: "id_nguyen_lieu" });
DinhMucMonAn.belongsTo(NguyenLieu, { foreignKey: "id_nguyen_lieu" });











NguoiDung.hasMany(NhatKyKho, { foreignKey: "id_nguoi_thuc_hien" });
NhatKyKho.belongsTo(NguoiDung, { foreignKey: "id_nguoi_thuc_hien" });


NhatKyKho.hasMany(ChiTietNhatKyKho, { as: "ChiTiets", foreignKey: "id_nhat_ky_kho", onDelete: "CASCADE" });
ChiTietNhatKyKho.belongsTo(NhatKyKho, { foreignKey: "id_nhat_ky_kho" });


NguyenLieu.hasMany(ChiTietNhatKyKho, { foreignKey: "id_nguyen_lieu" });
ChiTietNhatKyKho.belongsTo(NguyenLieu, { foreignKey: "id_nguyen_lieu" });


NhatKyKho.hasMany(ChiTietBaoCaoHaoHut, { as: "ChiTietHaoHuts", foreignKey: "id_nhat_ky_kho", onDelete: "CASCADE" });
ChiTietBaoCaoHaoHut.belongsTo(NhatKyKho, { foreignKey: "id_nhat_ky_kho" });


NguyenLieu.hasMany(ChiTietBaoCaoHaoHut, { foreignKey: "id_nguyen_lieu" });
ChiTietBaoCaoHaoHut.belongsTo(NguyenLieu, { foreignKey: "id_nguyen_lieu" });


BanAn.hasMany(HoaDon, { foreignKey: "id_ban" });
HoaDon.belongsTo(BanAn, { foreignKey: "id_ban" });


NguoiDung.hasMany(HoaDon, { foreignKey: "id_nhan_vien" });
HoaDon.belongsTo(NguoiDung, { foreignKey: "id_nhan_vien" });


HoaDon.hasMany(ChiTietHoaDon, { as: "ChiTietHoaDons", foreignKey: "id_hoa_don", onDelete: "CASCADE" });
ChiTietHoaDon.belongsTo(HoaDon, { foreignKey: "id_hoa_don" });


MonAn.hasMany(ChiTietHoaDon, { foreignKey: "id_mon_an" });
ChiTietHoaDon.belongsTo(MonAn, { foreignKey: "id_mon_an" });


NguoiDung.hasMany(KetCa, { foreignKey: "id_nhan_vien" });
KetCa.belongsTo(NguoiDung, { foreignKey: "id_nhan_vien" });


KetCa.hasMany(HoaDon, { foreignKey: "id_ket_ca" });
HoaDon.belongsTo(KetCa, { foreignKey: "id_ket_ca" });




KhuyenMai.hasMany(HoaDon, { foreignKey: "id_khuyen_mai" });
HoaDon.belongsTo(KhuyenMai, { foreignKey: "id_khuyen_mai" });


Combo.hasMany(ChiTietCombo, { as: "ChiTietCombos", foreignKey: "id_combo", onDelete: "CASCADE" });
ChiTietCombo.belongsTo(Combo, { foreignKey: "id_combo" });


MonAn.hasMany(ChiTietCombo, { foreignKey: "id_mon_an" });
ChiTietCombo.belongsTo(MonAn, { foreignKey: "id_mon_an" });

Combo.hasMany(ChiTietHoaDon, { foreignKey: "id_combo" });
ChiTietHoaDon.belongsTo(Combo, { foreignKey: "id_combo" });


KetCa.hasMany(ChiTieuCa, { foreignKey: "id_ket_ca" });
ChiTieuCa.belongsTo(KetCa, { foreignKey: "id_ket_ca" });


NguoiDung.hasMany(ChiTieuCa, { foreignKey: "id_nhan_vien" });
ChiTieuCa.belongsTo(NguoiDung, { foreignKey: "id_nhan_vien" });




module.exports = {
    sequelize,
    NguoiDung,
    BanAn,
    DanhMuc,
    MonAn,
    LoaiNguyenLieu,
    NguyenLieu,
    DinhMucMonAn,
    NhatKyKho,
    ChiTietNhatKyKho,
    HoaDon,
    ChiTietHoaDon,
    KetCa,
    BaoCaoTaiChinh,
    ThongBao,
    KhuyenMai,
    Combo,
    ChiTietCombo,
    ChiTieuCa,
    ChiTietBaoCaoHaoHut,
};

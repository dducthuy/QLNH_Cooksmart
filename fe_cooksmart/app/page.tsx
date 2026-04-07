import Link from "next/link";
import { ChefHat, ArrowRight, ShieldCheck, Zap, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0202] text-white overflow-hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 lg:px-20 py-8 border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ChefHat className="text-[#d9a01e]" size={32} />
          <span className="text-2xl font-black tracking-tighter uppercase">
            Cook<span className="text-[#d9a01e]">Smart</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-gray-400">
          <Link href="#" className="hover:text-white transition-colors">Tính năng</Link>
          <Link href="#" className="hover:text-white transition-colors">Giải pháp</Link>
          <Link href="#" className="hover:text-white transition-colors">Giá cả</Link>
        </div>
        <Link
          href="/auth/login"
          className="px-8 py-3 bg-[#d9a01e] text-[#0a0202] font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(217,160,30,0.3)]"
        >
          ĐĂNG NHẬP
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#d9a01e]/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-[#d9a01e] animate-bounce">
            <Star size={14} fill="currentColor" /> Hệ thống số 1 Việt Nam
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1]">
            Nâng Tầm Quản Trị <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#d9a01e] to-[#f8b500]">Nhà Hàng Thông Minh</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 font-medium leading-relaxed">
            Giải pháp toàn diện giúp tối ưu quy trình phục vụ, quản lý kho và báo cáo doanh thu theo thời gian thực với công nghệ hiện đại nhất.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Link
              href="/auth/login"
              className="group flex items-center gap-3 px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-[#d9a01e] hover:text-white transition-all shadow-2xl"
            >
              BẮT ĐẦU NGAY <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <button className="px-10 py-5 bg-white/5 border border-white/10 font-black rounded-2xl hover:bg-white/10 transition-all">
              XEM DEMO
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-32 px-6">
          {[
            { icon: <Zap className="text-[#d9a01e]" />, title: "Tốc Độ Vượt Trội", desc: "Xử lý đơn hàng chỉ trong vài giây, giảm thiểu thời gian chờ đợi." },
            { icon: <ShieldCheck className="text-[#d9a01e]" />, title: "Bảo Mật Tuyệt Đối", desc: "Dữ liệu được mã hóa và lưu trữ an toàn trên nền tảng Cloud." },
            { icon: <ChefHat className="text-[#d9a01e]" />, title: "Dễ Dàng Sử Dụng", desc: "Giao diện trực quan, nhân viên chỉ mất 5 phút để làm quen." }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-[#d9a01e]/30 transition-all text-left group">
              <div className="w-14 h-14 rounded-2xl bg-[#d9a01e]/10 flex items-center justify-center mb-6 pt-0 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-black mb-3">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 text-center text-gray-500 text-sm tracking-widest uppercase font-bold">
        © 2024 CookSmart Restaurant Technology • Made with Passion
      </footer>
    </div>
  );
}

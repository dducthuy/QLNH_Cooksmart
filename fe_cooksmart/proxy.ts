import { NextRequest, NextResponse } from 'next/server';

// Các route không cần đăng nhập
const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register'];

export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('accessToken')?.value;

    const isPublicRoute = pathname === '/' || PUBLIC_ROUTES.some((route) => route !== '/' && pathname.startsWith(route));


    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Đã đăng nhập mà vào trang login/register → về trang chính
    if (token && isPublicRoute && pathname !== '/') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// Áp dụng middleware cho tất cả route trừ file tĩnh
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};

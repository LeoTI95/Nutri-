import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/auth/login', '/auth/signup', '/'];
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname === route);

  // Permitir acesso a rotas públicas
  if (isPublicRoute) {
    return res;
  }

  // Para rotas protegidas, deixar a verificação para o lado do cliente
  // O dashboard já verifica localStorage e redireciona se necessário
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

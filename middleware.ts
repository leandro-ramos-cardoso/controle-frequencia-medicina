import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Mapa de segmentos de rota -> perfis permitidos
const ROUTE_ROLES: Record<string, string[]> = {
  '/aluno': ['aluno'],
  '/preceptor': ['preceptor'],
  '/coordenador': ['coordenador'],
  '/admin': ['administrador'],
};

const PUBLIC_PATHS = ['/login', '/recuperar-senha', '/offline', '/acesso-negado'];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p));

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, active')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.active) {
      return NextResponse.redirect(new URL('/acesso-negado', request.url));
    }

    const matchedSegment = Object.keys(ROUTE_ROLES).find((seg) => path.startsWith(seg));
    if (matchedSegment && !ROUTE_ROLES[matchedSegment].includes(profile.role)) {
      return NextResponse.redirect(new URL('/acesso-negado', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)'],
};

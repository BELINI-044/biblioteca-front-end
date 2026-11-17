
import { NextRequest, NextResponse } from 'next/server';

const API_URL =
    process.env.API_URL || 'http://localhost:3000/v1';

type TokenResponse = {
    accessToken: string;
    refreshToken: string;
};

function redirectToLogin(request: NextRequest) {
    const response = NextResponse.redirect(new URL('/', request.url));

    response.cookies.set('accessToken', '', {
        path: '/',
        maxAge: 0,
    });

    response.cookies.set('refreshToken', '', {
        path: '/',
        maxAge: 0,
    });

    return response;
}

export async function proxy(request: NextRequest) {
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // Sem access token, tenta renovar usando o refresh token.
    if (accessToken) {
        try {
            const validation = await fetch(`${API_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                cache: 'no-store',
            });

            if (validation.ok) {
                return NextResponse.next();
            }

            // Outros erros da API não significam necessariamente
            // que a sessão expirou.
            if (validation.status !== 401) {
                return NextResponse.next();
            }
        } catch {
            return NextResponse.next();
        }
    }

    if (!refreshToken) {
        return redirectToLogin(request);
    }

    try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
            cache: 'no-store',
        });

        if (refreshResponse.status === 401) {
            return redirectToLogin(request);
        }

        if (!refreshResponse.ok) {
            return NextResponse.next();
        }

        const tokens = await refreshResponse.json() as TokenResponse;

        if (!tokens.accessToken || !tokens.refreshToken) {
            return redirectToLogin(request);
        }

        // Atualiza os cookies que serão lidos pelas páginas
        // durante esta mesma requisição.
        const requestHeaders = new Headers(request.headers);

        const remainingCookies = request.cookies
            .getAll()
            .filter(
                cookie =>
                    cookie.name !== 'accessToken' &&
                    cookie.name !== 'refreshToken'
            )
            .map(cookie => `${cookie.name}=${cookie.value}`);

        remainingCookies.push(`accessToken=${tokens.accessToken}`);
        remainingCookies.push(`refreshToken=${tokens.refreshToken}`);

        requestHeaders.set('cookie', remainingCookies.join('; '));

        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });

        const secure = process.env.NODE_ENV === 'production';

        response.cookies.set('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 15,
        });

        response.cookies.set('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch {
        // Se a API estiver indisponível, não destrói a sessão.
        return NextResponse.next();
    }
}

export const config = {
    matcher: ['/dashboard/:path*'],
};

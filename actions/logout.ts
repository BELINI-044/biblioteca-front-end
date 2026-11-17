
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import publicApi from '@/lib/api';

export async function logout() {
    const cookieStore = await cookies();

    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    try {
        await publicApi.post(
            '/auth/logout',
            { refreshToken },
            {
                headers: accessToken
                    ? { Authorization: `Bearer ${accessToken}` }
                    : {},
            }
        );
    } catch (error) {
        void error;
    }

    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');

    redirect('/');
}
 
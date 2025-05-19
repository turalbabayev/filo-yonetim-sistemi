import { NextResponse } from 'next/server';
import { getDocument } from '../../../../lib/firebase/services';
import { User } from '../../../../types';

export async function GET(
  request: Request,
  { params }: { params: { uid: string } }
) {
  try {
    const user = await getDocument<User>('users', params.uid);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 
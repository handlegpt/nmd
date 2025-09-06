import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const name = email.split('@')[0];

  try {
    const { data, error } = await supabase
      .from('users')
      .insert({ email, name })
      .select('id, email, name')
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: err instanceof Error ? err.message : 'Unknown insert error',
        },
      },
      { status: 500 },
    );
  }
}


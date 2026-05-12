import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'page_html_index')
      .single();

    if (!error && data && Object.prototype.hasOwnProperty.call(data, 'value')) {
      return new NextResponse(data.value || '', {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      });
    }

    const filePath = path.join(process.cwd(), 'public', 'index.html');
    const html = await fs.readFile(filePath, 'utf8');
    
    return new NextResponse(html, {
      status: 200,
      headers: { 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error) {
    return new NextResponse('Error loading index.html', { status: 500 });
  }
}

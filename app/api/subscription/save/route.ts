import { addSubscription } from '@/lib/db/subscriptions';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Check origin
    const origin = req.headers.get('origin');
    const allowedOrigin = process.env.APP_URL;

    if (!origin || origin !== allowedOrigin) {
      return new NextResponse('Unauthorized', {
        status: 401,
        statusText: 'Unauthorized',
      });
    }

    // Get subscription data from request body
    const data = await req.text()
    
    if (!data || typeof data !== 'string') {
      return new NextResponse('Invalid subscription data', {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    // Save to database
    const result = await addSubscription(data);

    return NextResponse.json({ success: true }, {
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'POST',
      },
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return new NextResponse('Internal Server Error', {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  const allowedOrigin = process.env.APP_URL;

  if (!origin || origin !== allowedOrigin) {
    return new NextResponse(null, { status: 204 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 
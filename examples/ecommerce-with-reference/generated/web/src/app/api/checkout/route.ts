import { NextRequest, NextResponse } from 'next/server';
import { Item, User, Order, PricingResult } from '@/types';
import { calculateOrderTotals } from '@/lib/pricing';

export async function POST(req: NextRequest) {
  try {
    const { items, user, subtotal, discount, tax, total } = await req.json();

    // Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart items are required.' }, { status: 400 });
    }
    if (!user || !user.email || !user.loyaltyTier || !user.state) {
      return NextResponse.json({ error: 'User details are required.' }, { status: 400 });
    }

    // Re-calculate totals on the server to prevent client-side tampering
    const serverCalculatedTotals: PricingResult = calculateOrderTotals(items, user);

    // Compare client-sent totals with server-calculated totals
    // Allow for minor floating point differences, but flag significant discrepancies
    const tolerance = 0.01; // 1 cent tolerance
    if (
      Math.abs(serverCalculatedTotals.subtotal - subtotal) > tolerance ||
      Math.abs(serverCalculatedTotals.discount - discount) > tolerance ||
      Math.abs(serverCalculatedTotals.tax - tax) > tolerance ||
      Math.abs(serverCalculatedTotals.total - total) > tolerance
    ) {
      console.warn('Client-side totals mismatch server-side totals:', {
        client: { subtotal, discount, tax, total },
        server: serverCalculatedTotals,
      });
      // In a real application, you might reject the order or use server-calculated values
      // For this example, we'll proceed with server-calculated values but log the warning.
      // If the discrepancy is too large, you might return an error.
    }

    // Simulate payment processing
    // In a real app, integrate with Stripe, PayPal, etc.
    const paymentSuccess = Math.random() > 0.1; // 90% success rate for simulation

    if (!paymentSuccess) {
      return NextResponse.json({ error: 'Payment failed. Please try a different method.' }, { status: 400 });
    }

    // Simulate saving order to database
    const newOrder: Order = {
      id: Math.floor(Math.random() * 1000000), // Generate a mock order ID
      items: items,
      user: user,
      subtotal: serverCalculatedTotals.subtotal,
      discount: serverCalculatedTotals.discount,
      tax: serverCalculatedTotals.tax,
      total: serverCalculatedTotals.total,
      // Add timestamp, status, etc.
    };

    console.log('Order processed successfully:', newOrder);

    // Simulate sending confirmation email
    // In a real app, integrate with SendGrid, Mailgun, etc.
    console.log(`Sending confirmation email to ${user.email} for order ${newOrder.id}`);

    return NextResponse.json({ message: 'Order placed successfully!', order: newOrder }, { status: 200 });
  } catch (error: any) {
    console.error('API Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

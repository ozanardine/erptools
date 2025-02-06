import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    // Criar ou atualizar assinatura no Supabase
    await supabase.from('subscriptions').upsert({
      user_id: session.metadata?.userId,
      status: subscription.status,
      plan_id: subscription.items.data[0].price.id,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    });
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription;

    // Atualizar assinatura no Supabase
    await supabase.from('subscriptions').upsert({
      user_id: session.metadata?.userId,
      status: subscription.status,
      plan_id: subscription.items.data[0].price.id,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    });
  }

  if (event.type === 'customer.subscription.deleted') {
    // Atualizar status da assinatura para cancelado
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('user_id', session.metadata?.userId);
  }

  return new NextResponse(null, { status: 200 });
}
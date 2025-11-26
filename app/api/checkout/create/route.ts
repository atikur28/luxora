// app/api/checkout/create/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Earning from '@/lib/db/models/earning.model';
import Affiliate from '@/lib/db/models/affiliate.model';
import User from '@/lib/db/models/user.model';
import Order from '@/lib/db/models/order.model'; // add or adapt to your order model

const COMMISSION_RATES: Record<string, number> = {
  electronics: 0.03,
  fashion: 0.10,
  beauty: 0.15,
  default: 0.05
};

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, items, affiliateCode, pay } = body;
  if (!userId || !items) return NextResponse.json({ error: 'missing' }, { status: 400 });

  await dbConnect();
  const total = items.reduce((s: number, it: any) => s + it.price * it.qty, 0);
  // Create order (you should use your Order model; simplified here)
  const order = await Order.create({ userId, items, total, affiliateCode, affiliateCommission: 0, status: pay ? 'paid' : 'pending' });

  if (pay && affiliateCode) {
    let commission = 0;
    for (const it of items) {
      const rate = COMMISSION_RATES[it.category] ?? COMMISSION_RATES.default;
      commission += it.price * it.qty * rate;
    }
    order.affiliateCommission = commission;
    await order.save();

    await Earning.create({ affiliateCode, userId, orderId: order._id, amount: commission, status: 'pending' });

    const affUser = await User.findOne({ affiliateCode });
    if (affUser) {
      affUser.set('wallet', (affUser.get('wallet') || 0) + commission);
      await affUser.save();
    }
  }

  return NextResponse.json({ ok: true, order });
}

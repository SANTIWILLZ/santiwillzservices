import { router, json, error, db } from '@appdeploy/sdk';

type OrderInput = {
  requestId?: string;
  category?: string;
  requestType?: string;
  fields?: Record<string, string>;
  name?: string;
  phone?: string;
  location?: string;
};
const categories = ['gadgets', 'automobile', 'technical'];
export const handler = router({
  'POST /api/orders': [
    async ({ body }) => {
      const input = body as OrderInput | null;
      if (!input || !categories.includes(input.category || ''))
        return error('Invalid category', 400);
      if (
        typeof input.requestType !== 'string' ||
        !input.requestType.trim() ||
        input.requestType.length > 100
      )
        return error('Invalid request', 400);
      for (const key of ['name', 'phone', 'location'] as const) {
        if (
          typeof input[key] !== 'string' ||
          !input[key]?.trim() ||
          input[key]!.length > 120
        )
          return error('Invalid contact details', 400);
      }
      if (!/^[+0-9 ()-]{7,22}$/.test(input.phone!) || !/^\d{7,15}$/.test(input.phone!.replace(/\D/g, '')))
        return error('Invalid phone', 400);
      if (
        !input.fields ||
        typeof input.fields !== 'object' ||
        Array.isArray(input.fields)
      )
        return error('Missing request details', 400);
      const entries = Object.entries(input.fields);
      if (
        entries.length !== 3 ||
        entries.some(
          ([key, value]) =>
            key.length > 100 ||
            typeof value !== 'string' ||
            !value.trim() ||
            value.length > 200
        )
      )
        return error('Incomplete request details', 400);
      if (!input.requestId || !/^[a-f0-9-]{36}$/.test(input.requestId))
        return error('Invalid request identifier', 400);
      const orderId = 'SWS-' + input.requestId.toUpperCase();
      const payload = JSON.stringify([input.category, input.requestType, entries, input.name, input.phone, input.location]);
      const [existing] = await db.get('customer_orders', [orderId], { consistent: true });
      if (existing) {
        if (existing.payload !== payload) return error('Start a new enquiry for changed details', 409);
        return json({ orderId });
      }
      const [saved] = await db.tx.add('customer_orders', [
        {
          id: orderId,
          payload,
          category: input.category,
          requestType: input.requestType.trim(),
          fields: input.fields,
          name: input.name!.trim(),
          phone: input.phone!.trim(),
          location: input.location!.trim(),
          createdAt: new Date().toISOString(),
          status: 'registered_awaiting_whatsapp',
        },
      ]);
      if (!saved) {
        const [confirmed] = await db.get('customer_orders', [orderId], { consistent: true });
        if (confirmed?.payload !== payload) return error('Enquiry could not be confirmed', 409);
      }
      return json({ orderId });
    },
  ],
});

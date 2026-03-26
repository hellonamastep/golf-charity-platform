import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
})

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    amount: 1499, // £14.99 in pence
    interval: 'month' as const,
    label: 'Monthly',
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    amount: 14990, // £149.90 in pence
    interval: 'year' as const,
    label: 'Yearly',
    savingsPercent: 17,
  },
}

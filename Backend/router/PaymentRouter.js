const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.use(express.json());

router.post('/subscribe/pro', auth, async (req, res) => {
    try {
        const user = req.user;
        const priceId = "price_1RlYnLPemrWbSOVITgftRo7u";
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:3000/cancel`, metadata: {
                userId: user.id,
                contactNumber: user.ContactNumber

            }
        });
        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create Stripe session', error: err.message });
    }
});

router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    // console.log('webhook called...')
    const endpointSecret = "whsec_076a5e1eb41f9665aa064d57e3b09ca80cf789c3714ac8bbadded3308c3182ce";
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const userId = session.metadata.userId;
            // console.log('session object:', session);
            // console.log('session.metadata:', session.metadata);
            // console.log('userId in webhooks ->', userId);
            await User.update(
                { Subscription: 'PRO' },
                { where: { id: userId } }
            );
            break;
        }
        case 'invoice.payment_failed': {
            const session = event.data.object;
            const userId = session.metadata ? session.metadata.userId : null;
            // console.log('userId in webhooks ->',userId)
            if (userId) {
                await User.update(
                    { Subscription: 'BASIC' },
                    { where: { id: userId } }
                );
            }
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    res.json({ received: true });
});

module.exports = router;


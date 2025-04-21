const asyncErrorHandler = require('../utils/asyncErrorHandler');

const stripe = require('stripe')(process.env.STRIPE_KEY);

const baseURL = process.env.baseURL

  exports.createCheckoutSession = asyncErrorHandler(async (req, res, next) => {
    const {priceId} = req.body;
      console.log(priceId)
      const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          line_items: [
            {
              price: priceId,
              // For metered billing, do not pass quantity
              quantity: 1,  
            },
          ],
          // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
          // the actual Session ID is returned in the query parameter when your customer
          // is redirected to the success page.
          success_url: `${baseURL}/paymentSuccess?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseURL}/paymentFailed`,
        });

        console.log(session.url)
        res.status(200).json({
          status:"Success",
          redirectURL:session.url
        });
  });


exports.listenWebhooks = asyncErrorHandler(async (req,res,next)=>{
    let data;
  let eventType;
  // Check if webhook signing is configured.
  const webhookSecret = process.env.WEBHOOK_KEY;
  if (webhookSecret) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  switch (eventType) {
    case 'checkout.session.completed':
      // Payment is successful and the subscription is created.
      // You should provision the subscription and save the customer ID to your database.
      break;
    case 'invoice.paid':
      // Continue to provision the subscription as payments continue to be made.
      // Store the status in your database and check when a user accesses your service.
      // This approach helps you avoid hitting rate limits.
      break;
    case 'invoice.payment_failed':
      // The payment failed or the customer does not have a valid payment method.
      // The subscription becomes past_due. Notify your customer and send them to the
      // customer portal to update their payment information.
      break;
    default:
      // Unhandled event type
  }

  res.sendStatus(200);
})


exports.customerPortal = asyncErrorHandler(async (req,res,next)=>{
    // fetch the cutomerId using the req.body.userId 

    let customerId;
    
const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseURL}/dashboard`,
  });
})
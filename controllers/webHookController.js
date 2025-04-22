
const Limit = require('../models/Limit');
const User = require('../models/User');
const asyncErrorHandler = require('../utils/asyncErrorHandler');


const stripe_key = process.env.STRIPE_KEY.trim()
const stripe = require('stripe')(stripe_key);

const baseURL = process.env.baseURL
exports.listenWebhooks = asyncErrorHandler(async (req,res,next)=>{
  
    let data;
  let eventType;
  // Check if webhook signing is configured.
  const webhookSecret = `whsec_2ZKA4MlSyosvIuBAep9F9Ah1vsm1RL30`;
  if (webhookSecret) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        'whsec_2ZKA4MlSyosvIuBAep9F9Ah1vsm1RL30'
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`,err);
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

const userId = data.object.metadata.userId;
const subscriptionId = data.object.metadata.subscriptionId;
  switch (eventType) {
    case 'checkout.session.completed':
      // Payment is successful and the subscription is created.
      // You should provision the subscription and save the customer ID to your database.
     let res = await User.update({customerId:data.object.customer, isSubscribed:true},{where:{
        accountNumber:userId
    }})
    
    res = await Limit.upsert({
        userId, // must match User.accountNumber
        subscriptionId,
        transactionAmount: 5499.99,
        noOfTransactions: 25,
        lastBilledOn: new Date()
      });
    console.log(res)
      break;
    case 'invoice.paid':
      // Continue to provision the subscription as payments continue to be made.
      // Store the status in your database and check when a user accesses your service.
      // This approach helps you avoid hitting rate limits.

     let res2 = await Limit.update({
        lastBilledOn: new Date()
      },{
        where:{
            userId
        }
      })
      console.log(res2)
      break;
      case 'invoice.payment_failed':
          // The payment failed or the customer does not have a valid payment method.
          // The subscription becomes past_due. Notify your customer and send them to the
          // customer portal to update their payment information.
          let res3 = await User.update({isSubscribed:false},{where:{
              accountNumber:userId
            }})
            console.log(res3)
      break;

      case 'customer.subscription.updated':
        if (data.object.cancel_at_period_end) {
          // Subscription is set to cancel at the end of the period
          await User.update({ isSubscribed: false }, {
            where: {
              accountNumber: userId
            }
          });
          console.log(`Subscription ${subscriptionId} set to cancel at period end.`);
        }
        break;
  
      case 'customer.subscription.deleted':
        // Subscription has been cancelled immediately or after the period
        await User.update({ isSubscribed: false }, {
          where: {
            accountNumber: userId
          }
        });
  
        await Limit.destroy({
          where: {
            userId
          }
        });
  
        console.log(`Subscription ${subscriptionId} cancelled and limits removed.`);
        break;
  
    default:
      // Unhandled event type
  }

  res.sendStatus(200);
})

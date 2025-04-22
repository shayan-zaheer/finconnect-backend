const Limit = require('../models/Limit');
const User = require('../models/User');
const asyncErrorHandler = require('../utils/asyncErrorHandler');


const stripe_key = process.env.STRIPE_KEY.trim()
const stripe = require('stripe')(stripe_key);
const express = require('express');
const baseURL = process.env.baseURL

  exports.createCheckoutSession = asyncErrorHandler(async (req, res, next) => {
   
    const {userId} = req.body
    const {priceId} = req.body;
    const {subscriptionId} = req.body;
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
          success_url: `http://localhost:5173/paymentChecker?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `http://localhost:5173/paymentFailed`,
          metadata: {
            userId: userId.toString(), // or any identifier you want to use later
            subscriptionId
          },
        });

        // console.log(session.url)
        res.status(200).json({
          status:"Success",
          redirectURL:session.url
        });
  });



exports.customerPortal = asyncErrorHandler(async (req,res,next)=>{
    // fetch the cutomerId using the req.body.userId 
const {userId} = req.body;

let customerId = await User.findByPk(userId,{
  select:['customerId']
})

console.log(customerId)
 
    
const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId.dataValues.customerId,
    return_url: `${baseURL}/dashboard`,
  });


  res.status(200).json({
    status:"Success",
    customerPortal:portalSession.url
  })
})


exports.deleteSubscription = asyncErrorHandler(async (req, res, next) => {
  try {
    // Cancel the subscription using Stripe API

    const subId = await User.findByPk(req.query.userId,{
      attributes:['stripeSubId']
    })

    console.log(subId)
    const subscription = await stripe.subscriptions.cancel(subId.dataValues.stripeSubId);

    // Check if subscription was canceled successfully
    if (subscription.status === 'canceled') {

      await User.update({
        isSubscribed:false, subscriptionId: null
      },{
        where:{
          accountNumber: req.query.userId
        }
      })

      await Limit.destroy({
        where:{
          userId
        }
      })
      

      return res.status(200).json({
        message: "Subscription successfully canceled.",
        subscriptionId: subscription.id,
      });
    } else {
      return res.status(400).json({
        message: "Failed to cancel the subscription.",
      });
    }
  } catch (error) {
    // Log the error (for server-side tracking) and send a proper error response
    console.error("Error while canceling subscription:", error);

    return res.status(500).json({
      message: "An error occurred while processing the cancellation. Please try again later.",
      error: error.message,
    });
  }
});


exports.verifyPayment = asyncErrorHandler(async (req, res, next) => {
  const { session_id } = req.query; // Get session_id from query parameters

  if (!session_id) {
    return res.status(400).json({
      success: false,
      message: 'Session ID is required',
    });
  }

  try {
    // Retrieve the session details from Stripe using the session_id
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Check if the payment is successful
    if (session.payment_status === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Payment was successful',
        session: session,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment was not successful',
      });
    }
  } catch (error) {
    console.error('Error verifying payment: ', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error, unable to verify payment',
    });
  }
});
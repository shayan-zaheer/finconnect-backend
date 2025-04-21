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
          success_url: `${baseURL}/paymentSuccess?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseURL}/paymentFailed`,
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
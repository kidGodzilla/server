/**
 * PayPal controller.
 */
var paypal = require('paypal-rest-sdk'),
    db = require('../models'),
    config = require('../config/config');

/**
 * Initiates a payment with PayPal.
 * TODO: translate properly the item description once i18n is set up.
 */
exports.start = function (req, res) {

    // Get type and base price
    var type = db.Membership.getType(req.query.itemCode);
    var basePrice = db.Membership.getBasePrice(req.query.itemCode);

    // Validate data
    if (!basePrice || basePrice <= 0 || !type) {
        res.send(500, "Base price or type is invalid.");
        return;
    }

    // Process total
    var total = basePrice; // TODO: add shipping cost to total

    // Build a membership model
    var membership = db.Membership.build({
        userId: req.user.id,
        itemCode: req.query.itemCode,
        type: type,
        total: total
    });

    // Create a Paypal payment object
    var payment = {
        intent: "sale",
        payer: {
            payment_method: "paypal"
        },
        redirect_urls: {
            return_url: "http://localhost:3333/payment/execute",
            cancel_url: "http://localhost:3333/app/payment/cancel"
        },
        transactions: [
            {
                amount: {
                    total: total,
                    currency: "EUR"
                },
                description: res.__(membership.itemCode)
            }
        ]
    };

    // Initiate the payment
    paypal.payment.create(payment, function (error, payment) {
        if (error) {
            console.log(error);
            res.send(500);
        } else {
            if (payment.payer.payment_method === 'paypal') {

                // Store payment info in session
                membership.paymentId = payment.id;
                req.session.membership = membership;

                // Redirect to paypal
                var redirectUrl;
                for (var i = 0; i < payment.links.length; i++) {
                    var link = payment.links[i];
                    if (link.method === 'REDIRECT') {
                        redirectUrl = link.href;
                    }
                }
                res.redirect(redirectUrl);
            }
        }
    });
};

/**
 * Executes a payment (PayPal callback) then persists the membership in the database.
 * TODO: handle errors and add confirmation page in Ember.
 */
exports.execute = function (req, res) {

    // Retrieve the payment info from session and payer id query param
    var membership = req.session.membership;
    var payerId = req.param('PayerID');

    // Validate data
    if (!membership.paymentId || !payerId || !membership.itemCode || !membership.type) {
        res.send(500);
        return;
    }

    // Execute payment
    var details = { "payer_id": payerId };
    paypal.payment.execute(membership.paymentId, details, function (error, payment) {

        if (error) {
            res.send(500);
            return;
        }

        // Find the membership with the most recent expiration date
        db.Membership.find({
            where: {
                userId: req.user.id,
                type: membership.type
            },
            order: 'expireAt DESC'
        }).then(function (lastMembership) {

            // Determine the new membership expiration date
            var startAt = lastMembership ? lastMembership.expireAt : new Date();
            var expireAt = startAt.setFullYear(startAt.getFullYear() + 1);

            // Persist the membership
            return db.Membership.create({
                type: membership.type,
                paymentId: membership.paymentId,
                payerId: payment.payer.payer_info.payer_id,
                saleId: payment.transactions[0].related_resources[0].sale.id,
                userId: req.user.id,
                expireAt: expireAt,
                itemCode: membership.itemCode,
                paymentType: 'PPL',
                total: membership.total
            });
        }).then(function (newMembership) {
            res.redirect(config.appBaseUrl + '/payment/complete');
        }).catch(function (error) {
            res.send(500, error);
        });
    });
};
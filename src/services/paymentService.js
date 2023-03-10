const httpError = require("http-errors");
const {
  validatePayment,
  validatePaymentInputs,
} = require("../validators/validatorUtils");
const { attachIsPrimaryPayment } = require("../utils/formatUtils");
const Card = require("../models/CardModel");
const User = require("../models/UserModel");

module.exports.postPayment = async (data) => {
  try {
    // validate inputs
    validatePaymentInputs(data);

    // create payment
    const payment = await Card.create(data);

    // if is_primary_payment, update User
    if (data.is_primary_payment) {
      // primary payment stored in User to prevent conflict
      await User.updatePrimaryPaymentId({
        id: data.user_id,
        primary_payment_id: payment.id,
      });
    }

    // attach is_primary_payment
    payment.is_primary_payment = data.is_primary_payment ? true : false;

    return { payment };
  } catch (err) {
    throw err;
  }
};

module.exports.getPayment = async (data) => {
  try {
    const payment = await validatePayment(data);

    // primary payment stored in User to prevent conflict
    const { primary_payment_id } = await User.findById(data.user_id);

    // add boolean property indicating whether address is primary address
    attachIsPrimaryPayment(payment, primary_payment_id);

    return { payment };
  } catch (err) {
    throw err;
  }
};

module.exports.putPayment = async (data) => {
  try {
    const payment = await validatePayment(data);

    // modify payment with properties in data
    for (const property in data) {
      if (
        property === "card_type" ||
        property === "provider" ||
        property === "billing_address_id" ||
        property === "card_no" ||
        property === "cvv" ||
        property === "exp_month" ||
        property === "exp_year"
      ) {
        payment[property] = data[property];
      }
    }

    // validate each property before updating in db
    validatePaymentInputs(payment);

    // update payment
    const updatedPayment = await Card.update(payment);

    // attach boolean property indicating whether payment is primary payment method
    if (data.is_primary_payment) {
      // update User if true
      await User.updatePrimaryPaymentId({
        id: data.user_id,
        primary_payment_id: updatedPayment.id,
      });
      updatedPayment.is_primary_payment = true;
    } else {
      updatedPayment.is_primary_payment = false;
    }

    return { payment: updatedPayment };
  } catch (err) {
    throw err;
  }
};

module.exports.deletePayment = async (data) => {
  try {
    const payment = await validatePayment(data);

    // grab user associated with payment
    const { primary_payment_id } = await User.findById(data.user_id);

    // attach info if payment is primary payment method
    attachIsPrimaryPayment(payment, primary_payment_id);

    // check if payment is primary payment method of user
    if (payment.is_primary_payment) {
      // if so, update primary_payment_id to be null
      await User.updatePrimaryPaymentId({
        id: data.user_id,
        primary_payment_id: null,
      });
    }

    // delete payment method
    const deletedPayment = await Card.delete(data.payment_id);

    // add boolean property indicating whether payment is primary payment
    attachIsPrimaryPayment(deletedPayment, primary_payment_id);

    return { payment: deletedPayment };
  } catch (err) {
    throw err;
  }
};

module.exports.getAllPayments = async (user_id) => {
  try {
    // find payment methods associated with user_id
    const payments = await Card.findByUserId(user_id);

    // primary payment stored in User to prevent conflict
    const { primary_payment_id } = await User.findById(user_id);

    // add boolean property indicating whether payment is primary payment
    payments.forEach((payment) => {
      attachIsPrimaryPayment(payment, primary_payment_id);
    });

    return { payments };
  } catch (err) {
    throw err;
  }
};

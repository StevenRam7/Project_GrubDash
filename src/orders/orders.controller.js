const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res, next) {
    res.json({ data: orders });
}

function orderHasAddress(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo) {
    return next();
  }
   next({
    status: 400,
    message: "Order must include a deliverTo",
  });
}

function orderHasNumber(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber) {
    return next();
  }
   next({
    status: 400,
    message: "Order must include a mobileNumber",
  });
}

function orderHasDishes(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (dishes && Array.isArray(dishes) && dishes != []) {
    return next();
  }
  if (!Array.isArray(dishes) || !dishes[0]) {
    next({
    status: 400,
    message: "Order must include at least one dish",
  })
  }
  //if (dishes) {
    //next({
    //status: 400,
    //message: "Order must include at least one dish",
  //})
  //}
   next({
    status: 400,
    message: "Order must include a dish",
  });
}

function orderDishHasQ(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (!isNaN(dishes.quantity) && dishes.quantity > 0) {
    return next();
  }
   next({
    status: 400,
    message: `Dish ${index} must have a quantity that is an integer greater than 0`,
  });
}

function foundOrder(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId)
  if (foundOrder) {
    res.locals.order = foundOrder
    next();
  }
  next({
  status: 404,
  message: `Order id does not match route id. Order: ${orderId}, Route: ${orderId}.`
  })
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder })
}

function read(req, res) {
  res.json({ data: res.locals.order })
}

module.exports = {
  create: [orderHasAddress, orderHasNumber, orderHasDishes, orderDishHasQ, create],
  read: [foundOrder, read],
  list,
}
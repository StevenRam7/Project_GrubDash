const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

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

function orderHasStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (status && status != "delivered" && status != "invalid") {
    return next();
  }
  if (status === "delivered") {
     next({
    status: 400,
    message: "A delivered order cannot be changed",
  });
  }
   next({
    status: 400,
    message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
  });
}

function statusIsPending(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (res.locals.order.status == "pending") {
    return next();
  }
  next({
    status: 400,
    message: "An order cannot be deleted unless it is pending",
  });
}

function orderHasDishes(req, res, next) {
  const { data: { dishes } = [] } = req.body;
  if (dishes && Array.isArray(dishes) && dishes.length > 0) {
    return next();
  }
  if (!Array.isArray(dishes) || dishes.length === 0) {
    next({
    status: 400,
    message: "Order must include at least one dish",
  })
  }
  next({
    status: 400,
    message: "Order must include a dish",
  });
}

function orderDishHasQ(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  for (i=0; i < dishes.length; i++) {
    if (typeof dishes[i].quantity != "number" || dishes[i].quantity <= 0) {
    return next({
    status: 400,
    message: "Dish" + i + "must have a quantity that is an integer greater than 0",
  });
  }
  }
  next();
   
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

function update(req, res, next) {
  const order = res.locals.order;
  const { orderId } = req.params;
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  if (id && id != orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
    })
  }
  order.deliverTo = deliverTo,
  order.mobileNumber = mobileNumber,
  order.status = status,
  order.dishes = dishes;
  res.status(200).json({ data: order })
}

function destroy(req, res, next) {
  const order1 = res.locals.order;
  const { orderId } = req.params;
 const index = orders.findIndex((order) => order.id == orderId)
   const deleted = orders.splice(index, 1)
  res.sendStatus(204);
  
  
}

module.exports = {
  create: [orderHasAddress, orderHasNumber, orderHasDishes, orderDishHasQ, create],
  read: [foundOrder, read],
  update: [foundOrder, orderHasAddress, orderHasNumber, orderHasDishes, orderHasStatus, orderDishHasQ, update],
  delete: [foundOrder, statusIsPending, destroy],
  list,
}
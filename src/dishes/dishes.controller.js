const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res, next) {
    res.json({ data: dishes });
}

function dishHasName(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (name) {
    return next();
  }
   next({
    status: 400,
    message: "Dish must include a name",
  });
}

function dishHasDescription(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (description) {
    return next();
  }
   next({
    status: 400,
    message: "Dish must include a description",
  });
}

function dishHasPrice(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price && price > 0 && !isNaN(price)) {
    return next();
  }
   next({
    status: 400,
    message: "Dish must include a price",
  });
}

function dishHasImage(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url) {
    return next();
  }
   next({
    status: 400,
    message: "Dish must include a image_url",
  });
}

function foundDish(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId)
  if (foundDish) {
    res.locals.dish = foundDish
    next();
  }
  next({
  status: 404,
  message: `Dish id does not match route id. Dish: ${dishId}, Route: ${dishId}`
  })
}

function dishIdExists(req, res, next) {
  const { dishId } = req.params;
  if (dishId) {
    next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}.`
  })
}

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish })
}

function read(req, res, next) {
   res.json({ data: res.locals.dish })
}

function update(req, res, next) {
  const dish = res.locals.dish;
  const { dishId } = req.params;
  const { data: { id, name, description, price, image_url } = {} } = req.body;
  if (id && id != dishId) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
    })
  }
  dish.name = name;
  dish.description = description,
  dish.price = price,
  dish.image_url = image_url;
  res.status(200).json({ data: dish })
}

module.exports = {
  create: [dishHasName, dishHasDescription, dishHasPrice, dishHasImage, create],
  read: [foundDish, read],
  update: [dishHasName, dishHasDescription, dishHasPrice, dishHasImage, foundDish, dishIdExists, update],
  list,
}
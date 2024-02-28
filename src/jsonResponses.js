const COSMETIC_URL = 'https://fortnite-api.com/v2/cosmetics/br/search';
// const SHOP_URL = 'https://fortnite-api.com/v2/shop/br';
// const API_KEY = '96539bc8-c74b-4be1-a6c1-49dc1ece65fb';

const cosmetics = {};

const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  response.writeHead(status, headers);
  response.end();
};

const getCosmetics = (request, response) => {
  const responseJSON = {
    cosmetics,
  };

  return respondJSON(request, response, 200, responseJSON);
};

const getCosmeticsMeta = (request, response) => respondJSONMeta(request, response, 200);

const addCosmetics = (request, response, body) => {
  const responseJSON = {
    message: 'Cosmetic name is required.',
  };

  if (!body.name) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // https://www.geeksforgeeks.org/how-to-use-the-javascript-fetch-api-to-get-data/
  // Check against the search and return if the cosmetic isn't found.
  // name to check = "Metal%20Gear%20Mk.%20II"
  fetch(`${COSMETIC_URL}/?name=${body.name}`).then((apiResponse) => {
    console.log(apiResponse);
    if (apiResponse.status !== 200) {
      responseJSON.message = 'Cosmetic not found';
      responseJSON.id = 'missingParams';
      return respondJSON(request, response, 400, responseJSON);\
    }
  });

  let responseCode = 204;

  if (!cosmetics[body.name]) {
    responseCode = 201;
    cosmetics[body.name] = {};
  }
  cosmetics[body.name].name = body.name;

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

const updateCosmetics = (request, response) => {
  const newUser = {
    createdAt: Date.now(),
  };

  cosmetics[newUser] = newUser;

  return respondJSON(request, response, 201, newUser);
};

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  respondJSON(request, response, 404, responseJSON);
};

const notFoundMeta = (request, response) => {
  respondJSONMeta(request, response, 404);
};

module.exports = {
  getCosmetics,
  getCosmeticsMeta,
  updateCosmetics,
  addCosmetics,
  notFound,
  notFoundMeta,
};

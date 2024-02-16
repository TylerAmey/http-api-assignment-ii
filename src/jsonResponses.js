const users = {};

// function to respond with a json object
// takes request, response, status code and object to send
const respondJSON = (request, response, status, object) => {
  // object for our headers
  // Content-Type for json
  const headers = {
    'Content-Type': 'application/json',
  };

  // send response with json object
  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

// function to respond without json body
// takes request, response and status code
const respondJSONMeta = (request, response, status) => {
  // object for our headers
  // Content-Type for json
  const headers = {
    'Content-Type': 'application/json',
  };

  // send response without json object, just headers
  response.writeHead(status, headers);
  response.end();
};

// get user object
// should calculate a 200
const getUsers = (request, response) => {
  // json object to send
  const responseJSON = {
    users,
  };

  // return 200 with message
  return respondJSON(request, response, 200, responseJSON);
};

// get meta info about user object
// should calculate a 200
// return 200 without message, just the meta data
const getUsersMeta = (request, response) => respondJSONMeta(request, response, 200);

const addUser = (request, response, body) => {
  // default json message
  const responseJSON = {
    message: 'Name and age are both required.',
  };

  // check to make sure we have both fields
  // We might want more validation than just checking if they exist
  // This could easily be abused with invalid types (such as booleans, numbers, etc)
  // If either are missing, send back an error message as a 400 badRequest
  console.log(body);
  if (!body.name || !body.age) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // default status code to 204 updated
  let responseCode = 204;

  // If the user doesn't exist yet
  if (!users[body.name]) {
    // Set the status code to 201 (created) and create an empty user
    responseCode = 201;
    users[body.name] = {};
  }

  // add or update fields for this user name
  users[body.name].name = body.name;
  users[body.name].age = body.age;

  // if response is created, then set our created message
  // and sent response with a message
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }
  // 204 has an empty payload, just a success
  // It cannot have a body, so we just send a 204 without a message
  // 204 will not alter the browser in any way!!!
  return respondJSONMeta(request, response, responseCode);
};

// function just to update our object
const updateUser = (request, response) => {
  // change to make to user
  // This is just a dummy object for example
  const newUser = {
    createdAt: Date.now(),
  };

  // modifying our dummy object
  // just indexing by time for now
  users[newUser.createdAt] = newUser;

  // return a 201 created status
  return respondJSON(request, response, 201, newUser);
};

// function for 404 not found requests with message
const notFound = (request, response) => {
  // create error message for response
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  // return a 404 with an error message
  respondJSON(request, response, 404, responseJSON);
};

// function for 404 not found without message
const notFoundMeta = (request, response) => {
  // return a 404 without an error message
  respondJSONMeta(request, response, 404);
};

// set public modules
module.exports = {
  getUsers,
  getUsersMeta,
  updateUser,
  addUser,
  notFound,
  notFoundMeta,
};

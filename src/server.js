const http = require('http'); // http module
const url = require('url'); // url module
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// here we create a object to route our requests to the proper
// handlers. the top level object is indexed by the request
// method (get, head, etc). We can use request.method to return
// the routing object for each type of method. Once we say
// urlStruct[request.method], we recieve another object which
// routes each individual url to a handler. We can index this
// object in the same way we have used urlStruct before.
const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/getUsers': jsonHandler.getUsers,
    '/notReal': jsonHandler.notReal,
    notFound: jsonHandler.notFound,
  },
  HEAD: {
    '/getUsers': jsonHandler.getUsersMeta,
    notFound: jsonHandler.notFoundMeta,
  },
  POST: {
    '/addUser': jsonHandler.addUser,
  },
};

const parseBody = (request, response, handler) => {
  // The request will come in in pieces. We will store those pieces in this
  // body array.
  const body = [];

  // The body reassembly process is event driven, much like when we are streaming
  // media like videos, etc. We will set up a few event handlers. This first one
  // is for if there is an error. If there is, write it to the console and send
  // back a 400-Bad Request error to the client.
  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  // The second possible event is the "data" event. This gets fired when we
  // get a piece (or "chunk") of the body. Each time we do, we will put it in
  // the array. We will always recieve these chunks in the correct order.
  request.on('data', (chunk) => {
    body.push(chunk);
  });

  // The final event is when the request is finished sending and we have recieved
  // all of the information. When the request "ends", we can proceed. Turn the body
  // array into a single entity using Buffer.concat, then turn that into a string.
  // With that string, we can use the querystring library to turn it into an object
  // stored in bodyParams. We can do this because we know that the client sends
  // us data in X-WWW-FORM-URLENCODED format. If it was in JSON we could use JSON.parse.
  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    // Once we have the bodyParams object, we will call the handler function. We then
    // proceed much like we would with a GET request.
    handler(request, response, bodyParams);
  });
};

// handle POST requests
const handlePost = (request, response, parsedUrl) => {
  // If they go to /addUser
  if (parsedUrl.pathname === '/addUser') {
    // Call our below parseBody handler, and in turn pass in the
    // jsonHandler.addUser function as the handler callback function.
    parseBody(request, response, jsonHandler.addUser);
  }
};

// function to handle requests
const onRequest = (request, response) => {
  // first we have to parse information from the url
  const parsedUrl = url.parse(request.url);

  // next we need to ensure that we can handle the request
  // method that they are making the request with. This server
  // is only built to handle GET and HEAD requests, so we want
  // to send back a 404 if they make anything else. We can use
  // the HEAD version of notFound to send just a 404 status code.
  if (!urlStruct[request.method]) {
    return urlStruct.HEAD.notFound(request, response);
  }

  // now we check to see if we have something to handle the
  // request. This syntax may look verbose, but essentially
  // what we are doing is indexing into urlStruct by the method
  // which returns another object. We then index into that object
  // by the pathname to get the handler. Inside the if, we can
  // use that same syntax to call the actual function.
  if (urlStruct[request.method][parsedUrl.pathname]) {
    return urlStruct[request.method][parsedUrl.pathname](request, response);
  }

  // check if method was POST, otherwise assume GET
  // for the sake of this example
  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  }

  return urlStruct[request.method].notFound(request, response);
};

// start server
http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
});

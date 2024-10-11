const { parseJwt } = require("./utils/common");

exports.handler = (lambda) => {
  return async function (event, context) {
    let body, statusCode;
    console.log("Enter handler", event);

    let params;
    if (event.body) {
      if (typeof event.body === "string") {
        params = JSON.parse(event.body);
      } else {
        params = event.body;
      }
    } else {
      params = event.queryStringParameters || {};
    }
    if (event.headers && event.headers["Authorization"]) {
      params.headers = event.headers;
      params.user = parseJwt(event.headers["Authorization"]);
    }

    if (event.pathParameters) {
      params.pathParameters = event.pathParameters;
    }

    try {
      body = await lambda(params);
      statusCode = body.statusCode || 200;
      delete body.statusCode;
    } catch (e) {
      body = { status: false, error: e.stack.split("\n")[0] };
      console.log(`Handler Error: ${e.stack}`);
      statusCode = e.statusCode;
    }

    return {
      statusCode,
      body: JSON.stringify(body),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    };
  };
};

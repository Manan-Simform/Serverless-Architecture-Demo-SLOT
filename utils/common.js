const AWS = require("aws-sdk");
const { default: ShortUniqueId } = require("short-unique-id");
const lambda = new AWS.Lambda({
  region: process.env.AWS_REGION,
});

exports.parseJwt = (token) => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const buff = new Buffer.from(base64, "base64");
  const payloadinit = buff.toString("ascii");
  return JSON.parse(payloadinit || "{}");
};

exports.generateId = async (length, test) => {
  let found = true;
  let retry = 0;
  let id = null;
  const MAX_RETRIES = 10;
  while (found && retry < MAX_RETRIES) {
    retry += 1;
    const uid = new ShortUniqueId({
      length: length,
    });
    id = uid();
    if (test) {
      found = await test(id);
    } else {
      found = false;
    }
  }
  if (found) {
    throw new Error(
      `Could not pass id test ${test} after ${MAX_RETRIES} retries.`
    );
  } else {
    return id;
  }
};

exports.invokeLambdaFunction = async (FunctionName, Payload) => {
  try {
    const lambdaParams = {
      FunctionName: FunctionName,
      InvocationType: "RequestResponse",
      Payload: JSON.stringify(Payload),
    };

    const { Payload: payload } = await lambda.invoke(lambdaParams).promise();

    const personResponse = JSON.parse(payload);
    return personResponse;
  } catch (error) {
    throw error;
  }
};

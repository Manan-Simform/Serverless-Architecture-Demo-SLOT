const { generateId } = require("../utils/common");
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION,
});

const _tableName = `slot`;

async function SlotIdTest(id) {
  try {
    const results = await Slots.get(id);
    return results.length > 0;
  } catch (error) {
    if (error.message === "Item not found") {
      return false;
    }
    throw error;
  }
}

async function CreateDBEntry(id, data) {
  const params = {
    TableName: `${process.env.APP_STAGE}-${process.env.AWS_REGION_INITIAL}-${_tableName}`,
    Item: {
      ...id,
      ...data,
      updatedAt: Date.now(),
    },
  };
  try {
    await dynamodb.put(params).promise();
    return params.Item;
  } catch (error) {
    throw error;
  }
}

const Slots = {
  create: async (slot) => {
    try {
      const id = await generateId(6, SlotIdTest);

      const key = {
        id: id,
        scheduleId: slot.scheduleId,
      };
      const result = await CreateDBEntry(key, slot);

      return result;
    } catch (error) {
      throw error;
    }
  },
  get: async (id) => {
    try {
      const params = {
        TableName: `${process.env.APP_STAGE}-${process.env.AWS_REGION_INITIAL}-${_tableName}`,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": id,
        },
      };

      const result = await dynamodb.query(params).promise();
      return result.Items;
    } catch (error) {
      throw error;
    }
  },
  getByScheduleId: async (scheduleId) => {
    try {
      const params = {
        TableName: `${process.env.APP_STAGE}-${process.env.AWS_REGION_INITIAL}-${_tableName}`,
        IndexName: "scheduleId-index",
        KeyConditionExpression: "scheduleId = :scheduleId",
        FilterExpression: "active = :active",
        ExpressionAttributeValues: {
          ":scheduleId": scheduleId,
          ":active": true,
        },
      };

      const result = await dynamodb.query(params).promise();
      return result.Items;
    } catch (error) {
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      const key = {
        id: id,
        scheduleId: data.scheduleId,
      };

      const result = await CreateDBEntry(key, data);

      return result;
    } catch (error) {
      throw error;
    }
  },
  delete: async (id, scheduleId) => {
    try {
      const params = {
        TableName: `${process.env.APP_STAGE}-${process.env.AWS_REGION_INITIAL}-${_tableName}`,
        Key: {
          id: id,
          scheduleId: scheduleId,
        },
      };

      const result = await dynamodb.delete(params).promise();
    } catch (error) {
      throw error;
    }
  },
};

module.exports = {
  Slots: Slots,
};

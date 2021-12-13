const GET = require("./get");

const deleteSingle = async (table, key) => {
  var params = {
    Key: key,
    TableName: table,
  };
  return (await documentClient.delete(params).promise()).Attributes;
};
const deleteMutliple = async (table, keys) => {
  const loopVales = [];
  while (keys.length) {
    const values = keys.splice(0, 25);
    loopVales.push(values);
  }
  await Promise.all(
    loopVales.map(async (value) => {
      try {
        const params = {
          RequestItems: {
            [table]: value.map((k) => {
              return {
                DeleteRequest: {
                  Key: k,
                },
              };
            }),
          },
        };
        await documentClient.batchWrite(params).promise();
      } catch (e) {}
    })
  );
};

const deleteAll = async (table, key) => {
  const toRemove = await GET.get(table, key, true);
  if (toRemove.length > 0) {
    await deleteMutliple(table, toRemove);
    await deleteAll(table, key);
  }
};
const deleteItem = async (tableName, key, removeAll = false) => {
  if (removeAll) {
    return await deleteAll(tableName, key);
  } else if (Array.isArray(key)) {
    return await deleteMutliple(tableName, key);
  } else {
    return await deleteSingle(tableName, key);
  }
};
exports.delete = deleteItem;

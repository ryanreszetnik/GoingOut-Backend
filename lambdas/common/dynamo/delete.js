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
  const toRemove = await GET.query(table, key);
  if (toRemove.length > 0) {
    await deleteMutliple(table, toRemove);
    await deleteAll(table, key);
  }
};

exports.deleteSingle = deleteSingle;
exports.deleteMutliple = deleteMutliple;
exports.deleteAll = deleteAll;

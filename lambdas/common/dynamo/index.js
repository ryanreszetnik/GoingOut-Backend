const GET = require("./get");
const DELETE = require("./delete");
const LIST_ADD = require("./list_add");
const LIST_REMOVE = require("./list_remove");
const PUT = require("./put");
const UPDATE = require("./update");

const Responses = {
  async get(tableName = "", keyFieldName = "", params = null) {
    return await GET.get(tableName, keyFieldName, params);
  },
  async delete(tableName = "", keyFieldName = "", params = null) {
    return await DELETE.delete(tableName, keyFieldName, params);
  },
  async list_add(table = "", key = { id: "" }, field = "", values = []) {
    return await LIST_ADD.list_add(table, key, field, values);
  },
  async list_remove(table = "", key = { id: "" }, field = "", values = []) {
    return await LIST_REMOVE.list_remove(table, key, field, values);
  },
  async put(table = "", value) {
    return await PUT.put(table, value);
  },
  async update(table = "", key = { id: "" }, obj = {}) {
    return await UPDATE.update(table, key, obj);
  },
};

module.exports = Responses;

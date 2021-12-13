const GET = require("./get");
const DELETE = require("./delete");
const LIST_ADD = require("./list_add");
const LIST_REMOVE = require("./list_remove");
const PUT = require("./put");
const UPDATE = require("./update");

const Responses = {
  async get(table = "", key = "", query = false) {
    return await GET.get(table, key, query);
  },
  async delete(table = "", key = "", all = false) {
    return await DELETE.delete(table, key, all);
  },
  async list_add(table = "", keys = [{ id: "" }], field = "", values = []) {
    return await LIST_ADD.list_add(table, keys, field, values);
  },
  async list_remove(table = "", keys = [{ id: "" }], field = "", values = []) {
    return await LIST_REMOVE.list_remove(table, keys, field, values);
  },
  async put(table = "", value) {
    return await PUT.put(table, value);
  },
  async update(table = "", keyFieldName = "", obj = {}) {
    //obj could also be [{}]
    return await UPDATE.update(table, key, obj);
  },
};

module.exports = Responses;

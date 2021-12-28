const GET = require("./get");
const DELETE = require("./delete");
const LIST_ADD = require("./list_add");
const LIST_REMOVE = require("./list_remove");
const PUT = require("./put");
const UPDATE = require("./update");

const Responses = {
  //get
  async get(table = "", key = {}) {
    return await GET.get(table, key);
  },
  async getMultiple(table = "", key = {}) {
    return await GET.getAll(table, key);
  },
  async query(table = "", key = {}) {
    return await GET.query(table, key);
  },
  //delete
  async delete(table = "", key = "") {
    return await DELETE.deleteSingle(table, key);
  },
  async deleteMultiple(table = "", key = "") {
    return await DELETE.deleteMutliple(table, key);
  },
  async deleteAll(table = "", key = "") {
    return await DELETE.deleteAll(table, key);
  },
  //lists
  async list_add(table = "", keys = [{ id: "" }], field = "", values = []) {
    return await LIST_ADD.list_add(table, keys, field, values);
  },
  async list_remove(table = "", keys = [{ id: "" }], field = "", values = []) {
    return await LIST_REMOVE.list_remove(table, keys, field, values);
  },
  //put
  async put(table = "", value = {}) {
    return await PUT.putSingle(table, value);
  },
  async putAll(table = "", values = [{}]) {
    return await PUT.putMultiple(table, values);
  },
  //update
  async update(table = "", keyName = "", obj = {}) {
    return await UPDATE.updateSingle(table, keyName, obj);
  },
  async updateAll(table = "", keyName = "", objs = [{}]) {
    return await UPDATE.updateAll(table, keyName, objs);
  },
};

module.exports = Responses;

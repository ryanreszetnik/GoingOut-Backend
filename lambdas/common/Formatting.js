const Responses = {
  ensureObject(data = "") {
    return typeof data === "string" ? JSON.parse(data) : data;
  },
};

module.exports = Responses;

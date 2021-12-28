const Dynamo = require("./dynamo");
const Tables = require("./TableConstants");
const one_year = 1000 * 60 * 60 * 24 * 365.25;

const getAge = (birthdate) => {
  return (new Date().getTime() - new Date(birthdate).getTime()) / one_year;
};
const getAverageAge = (members) => {
  let age = 0;
  members.forEach((member) => {
    age += getAge(member.birthdate);
  });
  return age / members.length;
};
const getGenderValue = (gender) => {
  switch (gender) {
    case "Male":
      return 1;
    case "Female":
      return -1;
    default:
      return 0;
  }
};
const getAverageGender = (members) => {
  let gender = 0;
  members.forEach((member) => {
    switch (member.gender) {
    }
    gender += getGenderValue(member.gender);
  });
  return gender / members.length;
};
const updateEventAverages = async (eventId, subs = []) => {
  let memberSubs = subs;
  if (subs.length == 0) {
    const event = await Dynamo.get(Tables.EVENTS, { eventId: eventId });
    memberSubs = event.members;
  }
  const memberObjs = await Dynamo.getMultiple(
    Tables.USERS,
    memberSubs.map((s) => {
      return { sub: s };
    })
  );
  const averageAge = getAverageAge(memberObjs);
  const averageGender = getAverageGender(memberObjs);
  return await Dynamo.update(Tables.EVENTS, "eventId", {
    eventId: eventId,
    averageAge: averageAge,
    averageGender: averageGender,
  });
};
const getSubFromConn = async (connId) => {
  return (await Dynamo.get(Tables.CONNECTIONS, { connectionId: connId })).sub;
};

const Responses = {
  async updateEventAverages(eventId = "", subs = []) {
    return await updateEventAverages(eventId, subs);
  },
  async getSubFromConnection(connId = "") {
    return await getSubFromConn(connId);
  },
};

module.exports = Responses;

import { getDB } from "../index";

export const addTickets = async (data) => {
  try {
    const db = getDB();
    return await db.collection("tickets-list").add({
      data: {
        ...data,
        userId: data.userId,
        createTime: db.serverDate(),
      },
    });
  } catch (e) {
    console.warn("addUser error", e);
    throw e;
  }
};
export const getTicketsByUserId = async (userId) => {
  try {
    const db = getDB();
    return await db
      .collection("tickets-list")
      .where({
        userId,
      })
      .orderBy("createTime", "desc")
      .limit(100)
      .get();
  } catch (e) {
    console.warn("addUser error", e);
    throw e;
  }
};

export const updateTicket = async (ticketId, data) => {
  try {
    const db = getDB();
    return await db.collection("tickets-list").doc(ticketId).update({
      data: data,
    });
  } catch (e) {
    console.warn("updateTicket error", e);
    throw e;
  }
};

export const getTicketById = async (ticketId) => {
  try {
    const db = getDB();
    return await db.collection("tickets-list").where({_id: ticketId}).get();
  } catch (e) {
    console.warn("getTicketById error", e);
    throw e;
  }
};

export const getTicketByShortId = async (shortId) => {
  try {
    const db = getDB();
    return await db.collection("tickets-list").where({shortId: shortId}).get();
  } catch (e) {
    console.warn("getTicketByShortId error", e);
    throw e;
  }
};

export const deleteTicket = async (ticketId) => {
  try {
    const db = getDB();
    return await db.collection("tickets-list").where({_id: ticketId}).remove();
  } catch (e) {
    console.warn("deleteTicket error", e);
    throw e;
  }
};

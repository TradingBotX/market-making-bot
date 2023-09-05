"use strict";
const axios = require("axios");
const httpsProxyAgent = require("https-proxy-agent");

module.exports = {
  makeGETRequest: async function (reqObject) {
    const config = {
      method: "get",
      url: reqObject.url,
      headers: {
        "Content-Type": reqObject.contentType,
      },
      json: true,
    };
    let result = await axios(config);
    return result;
  },

  makePOSTRequest: async function (reqObject) {
    const config = {
      method: "post",
      url: reqObject.url,
      headers: {
        "Content-Type": reqObject.contentType,
      },
      data: reqObject.data,
    };
    let result = await axios(config);
    return result;
  },

  makeDELETERequest: async function (reqObject) {
    const config = {
      method: "delete",
      url: reqObject.url,
      headers: {
        "Content-Type": reqObject.contentType,
      },
      data: reqObject.data,
    };
    let result = await axios(config);
    return result;
  },

  makeGETHeaderRequest: async function (reqObject) {
    const config = {
      method: "get",
      url: reqObject.url,
      headers: reqObject.headers,
    };
    let result = await axios(config);
    return result;
  },

  makePOSTHeaderRequest: async function (reqObject) {
    const config = {
      method: "post",
      url: reqObject.url,
      headers: reqObject.headers,
      data: reqObject.data,
    };
    let result = await axios(config);
    return result;
  },

  makeDELETEHeaderRequest: async function (reqObject) {
    const config = {
      method: "delete",
      url: reqObject.url,
      headers: reqObject.headers,
    };
    let result = await axios(config);
    return result;
  },

  makePOSTRequestWithToken: async function (reqObject) {
    const config = {
      method: "post",
      url: reqObject.url,
      headers: {
        "Content-Type": reqObject.contentType,
        Authorization: reqObject.token,
      },
      data: reqObject.data,
    };
    let result = await axios(config);
    return result;
  },

  makeGETHeaderRequestProxy: async function (reqObject) {
    const agent = new httpsProxyAgent(reqObject.proxy);
    const config = {
      method: "get",
      url: reqObject.url,
      headers: reqObject.headers,
      httpsAgent: agent,
    };
    let result = await axios(config);
    return result;
  },

  makePOSTHeaderRequestProxy: async function (reqObject) {
    const agent = new httpsProxyAgent(reqObject.proxy);
    const config = {
      method: "post",
      url: reqObject.url,
      headers: reqObject.headers,
      data: reqObject.data,
      httpsAgent: agent,
    };
    let result = await axios(config);
    return result;
  },

  makePUTHeaderRequest: async function (reqObject) {
    const config = {
      method: "put",
      url: reqObject.url,
      headers: reqObject.headers,
      data: reqObject.data,
    };
    let result = await axios(config);
    return result;
  },
};

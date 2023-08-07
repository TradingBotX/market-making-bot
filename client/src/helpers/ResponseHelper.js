const DefaulErrortMsg = "Something went wrong";
const DefaultSuccessMsg = "Success";

export const ParseError = (e) => {
  if (e.errors) {
    return e.errors[0].field
      ? `${e.errors[0].field}: ${e.errors[0].message}`
      : e.errors[0].message;
  }
  return e
    ? e.response
      ? e.response.data
        ? e.response.data.errors
          ? e.response.data.errors[0].field
            ? `${e.response.data.errors[0].field}: ${e.response.data.errors[0].message}`
            : e.response.data.errors[0].message
          : DefaulErrortMsg
        : DefaulErrortMsg
      : e.message
      ? e.message
      : DefaulErrortMsg
    : DefaulErrortMsg;
};

export const ParseSuccess = (e) => {
  return e.response
    ? e.response.data
      ? e.response.data.message
      : DefaultSuccessMsg
    : DefaultSuccessMsg;
};

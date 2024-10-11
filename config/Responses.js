const Responses = {
  _DefineResponse(statusCode = 502, data = {}) {
    return {
      statusCode,
      ...data,
    };
  },

  _200(data = {}) {
    return this._DefineResponse(200, {
      status: true,
      ...data,
    });
  },

  _400(data = {}) {
    return this._DefineResponse(400, {
      status: false,
      ...data,
    });
  },

  _401(data = {}) {
    return this._DefineResponse(401, {
      status: false,
      ...data,
    });
  },

  _403(data = {}) {
    return this._DefineResponse(403, {
      status: false,
      ...data,
    });
  },

  _404(data = {}) {
    return this._DefineResponse(404, {
      status: false,
      ...data,
    });
  },

  _500(data = {}) {
    return this._DefineResponse(500, {
      status: false,
      errors: [
        {
          msg: data,
          code: "common.error.internal_error",
          param: null,
        },
      ],
    });
  },
};

module.exports = Responses;

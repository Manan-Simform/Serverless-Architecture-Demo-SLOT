const _Responses = require("./config/Responses");
const { Slots } = require("./services/slots");
const { handler } = require("./handler");

exports.create = handler(async (params) => {
  const data = {
    resourceType: "Slot",
    scheduleId: params.schedule.reference.split("/")[1],
    schedule: params.schedule,
    status: params.status,
    start: params.start,
    end: params.end,
    comment: params.comment,
    overbooked: params.overbooked,
    active: true,
    createdAt: Date.now(),
  };

  if (data.scheduleId === "undefined") {
    return _Responses._404({
      message: "User haven't created a Schedule Yet!",
    });
  }

  const getAllSlots = await Slots.getByScheduleId(data.scheduleId);

  let startTime = Date.parse(data.start);
  let endTime = Date.parse(data.end);

  if (getAllSlots.length) {
    const response = getAllSlots.map((ele) => {
      const startDateCheck =
        Date.parse(ele.start) + 1 >= startTime &&
        Date.parse(ele.start) + 1 <= endTime
          ? true
          : false;
      const endDateCheck =
        Date.parse(ele.end) - 1 >= startTime &&
        Date.parse(ele.end) - 1 <= endTime
          ? true
          : false;
      const bothDateCheck =
        Date.parse(ele.start) + 1 <= startTime &&
        Date.parse(ele.end) - 1 >= endTime
          ? true
          : false;
      const isUnavailable =
        startDateCheck || endDateCheck || bothDateCheck ? true : false;
      return isUnavailable;
    });

    const available = response.includes(true) ? false : true;

    if (!available) {
      return _Responses._400({
        message: "Slot Already Added between this time!!",
      });
    }
  }

  const slots = await Slots.create(data);

  return _Responses._200({
    message: "Slot Created Successfully!",
    data: slots,
  });
});

exports.getSlotsBySchedule = handler(async (params) => {
  if (!params.scheduleId) {
    return _Responses._400({
      message: "Schedule Id is required.",
    });
  }

  const slots = await Slots.getByScheduleId(params.scheduleId);

  return _Responses._200({
    message: slots.length ? "Slots Fetched Successfully!" : "Not Found!",
    data: slots,
  });
});

exports.update = handler(async (params) => {
  if (!params.id) {
    return _Responses._400({
      message: "Id is required.",
    });
  }

  const slots = await Slots.get(params.id);

  const data = {
    scheduleId: slots[0].scheduleId,
    schedule: slots[0].schedule,
    comment: slots[0].comment ? slots[0].comment : "",
    createdAt: slots[0].createdAt,
    status: slots[0].status,
    updatedAt: Date.now(),
    active: true,
    resourceType: "Slot",
    start: params.start,
    end: params.end,
  };

  const updateSlot = await Slots.update(params.id, data);

  return _Responses._200({
    message: "Slots Updated Successfully!",
  });
});

exports.delete = handler(async (params) => {
  if (!params.pathParameters.id) {
    return _Responses._400({
      message: "Id is required.",
    });
  }

  const slots = await Slots.get(params.pathParameters.id);

  if (slots.length) {
    const deleteSlot = await Slots.delete(slots[0].id, slots[0].scheduleId);

    return _Responses._200({
      message: "Slots Deleted Successfully!",
    });
  } else {
    return _Responses._404({
      message: "Slot Not Found!",
    });
  }
});

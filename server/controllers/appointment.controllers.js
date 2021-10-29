const Appointment = require("../models/appointment");
const AvailableSchedule = require("../models/availableSchedule");

const addAppointment = (req, res) => {
  const { year, month, day, time, firstName, lastName, email, phoneNumber, groupSize } = req.body;

  AvailableSchedule.aggregate([
    {
      $match: {
        year,
        month,
        day,
      },
    },
  ])
    .then((result) => {
      result = result[0];
      for (let i = 0; i < result.schedule.length - 1; i++) {
        if (result.schedule[i].time === time) {
          let newSlotSize = Math.round(groupSize / result.persons);
          if (newSlotSize === 0) newSlotSize = 1;

          if (result.schedule[i].slots - newSlotSize < 0) {
            return res.status(403).send(JSON.stringify("Insufficient slots for the group size"));
          }

          if (result.schedule[i].slots === 0) {
            return res.status(403).send(JSON.stringify("No slots available"));
          }

          AvailableSchedule.updateOne(
            { "schedule._id": result.schedule[i]._id },
            { $inc: { "schedule.$.slots": -newSlotSize } }
          )
            .then((result) => {
              return res.send(JSON.stringify("Added appointment successfully"));
            })
            .catch((error) => {
              console.error(error);
            });

          break;
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = { addAppointment };

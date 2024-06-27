"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.converterGMTDate = exports.converterDate = void 0;
const tslib_1 = require("tslib");
const date_fns_1 = require("date-fns");
const moment_1 = tslib_1.__importDefault(require("moment"));
async function calc(day) {
    const today = new Date();
    try {
        switch (day.toLowerCase()) {
            case 'today':
                return today;
            case 'yesterday':
                return (0, date_fns_1.addDays)(today, -1);
            case 'monday':
                return (0, date_fns_1.addDays)(today, -(0, date_fns_1.differenceInDays)(today, new Date(today.setDate(today.getDate() - ((today.getDay() + 6) % 7)))));
            case 'tuesday':
                return (0, date_fns_1.addDays)(today, -(0, date_fns_1.differenceInDays)(today, new Date(today.setDate(today.getDate() - ((today.getDay() + 5) % 7)))));
            case 'wednesday':
                return (0, date_fns_1.addDays)(today, -(0, date_fns_1.differenceInDays)(today, new Date(today.setDate(today.getDate() - ((today.getDay() + 4) % 7)))));
            case 'thursday':
                return (0, date_fns_1.addDays)(today, -(0, date_fns_1.differenceInDays)(today, new Date(today.setDate(today.getDate() - ((today.getDay() + 3) % 7)))));
            case 'friday':
                return (0, date_fns_1.addDays)(today, -(0, date_fns_1.differenceInDays)(today, new Date(today.setDate(today.getDate() - ((today.getDay() + 2) % 7)))));
            case 'saturday':
                return (0, date_fns_1.addDays)(today, -(0, date_fns_1.differenceInDays)(today, new Date(today.setDate(today.getDate() - ((today.getDay() + 1) % 7)))));
            case 'sunday':
                return (0, date_fns_1.addDays)(today, -(0, date_fns_1.differenceInDays)(today, new Date(today.setDate(today.getDate() - ((today.getDay() + 0) % 7)))));
            default:
                return null;
        }
    }
    catch { }
}
async function converterDate(day) {
    const dateStr = day.split("-");
    const date = await calc(dateStr[0].trim());
    if (date) {
        return `${(0, date_fns_1.format)(date, "yyyy-MM-dd")} ${dateStr[1].trim()}`;
    }
    const year = new Date().getFullYear();
    if (dateStr[0].trim().split(",")[1]) {
        return `${(0, date_fns_1.format)(new Date(dateStr[0].trim()), "yyyy-MM-dd", {})} ${dateStr[1].trim()}`;
    }
    else {
        return `${(0, date_fns_1.format)(new Date(`${dateStr[0].trim()}, ${year}`), "yyyy-MM-dd")} ${dateStr[1].trim()}`;
    }
}
exports.converterDate = converterDate;
async function converterGMTDate(day, timezone = '+07:00') {
    try {
        let date = await converterDate(day);
        let editTimeFlag = false;
        if (date.includes("edited")) {
            date = date.replace("edited ", "");
            editTimeFlag = true;
        }
        // Parse the local time string to a Moment object
        const localMoment = (0, moment_1.default)(date);
        // Convert the local time to GMT+X
        const gmtMoment = localMoment.utcOffset(timezone);
        // Format the GMT+X time as a string
        return gmtMoment.format(`yyyy-MM-DD ${editTimeFlag ? '[edited ]' : ''}HH:mm`);
    }
    catch (ex) {
        console.log("timezone error: ", ex);
    }
}
exports.converterGMTDate = converterGMTDate;

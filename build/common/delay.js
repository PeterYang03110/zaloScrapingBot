"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = void 0;
const delay = async (time) => {
    return new Promise(resolve => {
        setTimeout(resolve, time); // Adjust the delay time as needed (3000 milliseconds = 3 seconds)
    });
};
exports.delay = delay;

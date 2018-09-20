"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function argumentsDefined(_args) {
    const notDefined = [];
    for (const [key, value] of Object.entries(_args)) {
        const hasValue = value ? true : false;
        if (hasValue) {
            continue;
        }
        else {
            notDefined.push(key);
        }
    }
    const message = missingArguments(notDefined);
    return message;
}
exports.argumentsDefined = argumentsDefined;
function missingArguments(notDefined) {
    let stringBuilder = "";
    for (const missing of notDefined) {
        stringBuilder += `\n Missing key or value: ${missing} \n`;
    }
    return stringBuilder;
}
//# sourceMappingURL=validationHelper.js.map
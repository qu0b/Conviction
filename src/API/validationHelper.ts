import _ from 'lodash';

export function argumentsDefined(_args: Object): string {
  const notDefined: Array<string> = [];
  for(const [key, value] of Object.entries(_args)) {
    const hasValue = value ? true : false;
    if(hasValue) {
      continue;
    } else {
      notDefined.push(key);
    }
  }
  const message = missingArguments(notDefined);
  return message
}

function missingArguments(notDefined: Array<string>) {
  let stringBuilder = "";
  for(const missing of notDefined) {
    stringBuilder += `\n Missing key or value: ${missing} \n`;
  }
  return stringBuilder;
}


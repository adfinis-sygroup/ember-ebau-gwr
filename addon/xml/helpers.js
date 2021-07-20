import { get } from "@ember/object";
import dayjs from "dayjs";

// All functions in this file will be registered to handlebars as helpers.

export function echDate(date, partial) {
  return typeof date === "object" && date !== null
    ? dayjs(date).format("YYYY-MM-DD")
    : (date === "today" && partial === "year")
    ? dayjs().format("YYYY")
    : date === "today"
    ? dayjs().format("YYYY-MM-DD")
    : date;
}

export function or(...args) {
  // The last element in args is the helper definition past by handlebars
  // So we dont want to compare this.
  return args.length === 2 ? args[0] : args[0] || or(...args.slice(1));
}

export function and(...args) {
  // The last element in args is the helper definition passed by handlebars
  // So we dont want to compare this.
  return args.length === 2 ? args[0] : args[0] && and(...args.slice(1));
}

export function modelField(...args) {
  const { value: argValue, namespace = "ns2:" } = args.pop().hash;
  const [model, key] = args;
  const value = argValue ?? get(model, key);
  return value !== undefined && value !== null && value?.length !== 0
    ? `<${namespace}${key}>${value}</${namespace}${key}>`
    : "";
}

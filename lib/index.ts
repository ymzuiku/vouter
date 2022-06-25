import { creator } from "./creator";
import { Router, useHistoryChange } from "./Router";
import { vouter as _vouter } from "./vouter";

export const vouter = {
  ..._vouter,
  create: creator,
};
export { Router, useHistoryChange };

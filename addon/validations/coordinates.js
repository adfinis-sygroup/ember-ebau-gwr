import {
  validateNumber,
  validatePresence,
} from "ember-changeset-validations/validators";

export function coordinatesValidation(path = "") {
  /*eslint-disable prefer-template*/
  const eastPath = `${path && path + "."}coordinates.east`;
  const northPath = `${path && path + "."}coordinates.north`;
  const originPath = `${path && path + "."}coordinates.originOfCoordinates`;
  /*eslint-enable prefer-template*/

  return {
    coordinates: {
      north: [
        validatePresence({
          presence: true,
          on: [eastPath, originPath],
        }),
        validateNumber({ gte: 1070000.0, allowBlank: true }),
        validateNumber({ lte: 1300000.999, allowBlank: true }),
      ],
      east: [
        validatePresence({ presence: true, on: [northPath, originPath] }),
        validateNumber({ gte: 2480000.0, allowBlank: true }),
        validateNumber({ lte: 2840000.999, allowBlank: true }),
      ],
      originOfCoordinates: [
        validatePresence({
          presence: true,
          on: [eastPath, northPath],
        }),
      ],
    },
  };
}
export default coordinatesValidation();

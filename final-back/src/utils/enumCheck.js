const genderEnum = require("../data/genderEnum");
const interestsEnum = require("../data/interestsEnum");
const commoditiesRoomEnum = require("../data/commoditiesRoomEnum")
const commoditiesHomeEnum = require("../data/commoditiesHomeEnum")
const housingTypeEnum = require("../data/housingTypeEnum");
const publicLocationEnum = require("../data/publicLocationEnum");

const enumCheck = (type, value) => {
  let acc
  //type es por donde va a entrar, y value el valor que queramos comprobar si esta en el array
  switch (type) {
    case "gender":
      if (genderEnum.includes(value)) {
        return { check: true, value };
      } else return { check: false };

    case "interests":
      acc = 0;
      if (value.length > 0) {
        value.forEach((element) => {
          if (interestsEnum.includes(element)) {
            acc++;
          }
        });
        return acc == value.length ? { check: true } : { check: false };
      }

    case "housingType":
      return housingTypeEnum.includes(value) ? {check: true, value} : {cehck: false};

    case "publicLocation":
      return publicLocationEnum.includes(value) ? {check: true, value} : {cehck: false};

    case "commoditiesRoom":
      acc = 0;
      if (value.length > 0) {
        value.forEach((element) => {
          if (commoditiesRoomEnum.includes(element)) {
            acc++;
          }
        });
        return acc == value.length ? { check: true } : { check: false };
      }

    case "commoditiesHome":
      acc = 0;
      if (value.length > 0) {
        value.forEach((element) => {
          if (commoditiesHomeEnum.includes(element)) {
            acc++;
          }
        });
        return acc == value.length ? { check: true } : { check: false };
      }

    default:
      break;
  }
};

module.exports = enumCheck;

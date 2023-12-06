const genderEnum = require("../data/genderEnum");
const interestsEnum = require("../data/interestsEnum");
const commoditiesRoomEnum = require("../data/commoditiesRoomEnum")
const commoditiesHomeEnum = require("../data/commoditiesHomeEnum")
const housingTypeEnum = require("../data/housingTypeEnum")

const enumCheck = (type, value) => {
  //type es por donde va a entrar, y value el valor que queramos comprobar si esta en el array
  switch (type) {
    case "gender":
      if (genderEnum.includes(value)) {
        return { check: true, value };
      } else return { check: false };

    case "interests":
      let acc = 0;
      if (value.length > 0) {
        value.forEach((element) => {
          if (interestsEnum.includes(element)) {
            acc++;
          }
        });
        return acc == value.length ? { check: true } : { check: false };
      }

    case "housingType":
      return housingTypeEnum.includes(value) ? true : false;

    case "commoditiesRoom":
      return commoditiesRoomEnum.includes(value) ? true : false;

    case "commoditiesHome":
      return commoditiesHomeEnum.includes(value) ? true : false;

    default:
      break;
  }
};

module.exports = enumCheck;

const genderEnum = require("../data/genderEnum");
const interestsEnum = require("../data/interestsEnum");

const enumCheck = (type, value) => {
    //type es por donde va a entrar, y value el valor que queramos comprobar si esta en el array
    switch (type) {
        case 'gender':
            return genderEnum.includes(value) ? true : false;

        case 'interests':
            return interestsEnum.includes(value) ? true : false;

        case 'interests':
            return housingTypeEnum.includes(value) ? true : false;

        case 'interests':
            return commoditiesRoomEnum.includes(value) ? true : false;

        case 'interests':
            return commoditiesHouseEnum.includes(value) ? true : false;
            
        default:
            break;
    }
}

module.exports = enumCheck;
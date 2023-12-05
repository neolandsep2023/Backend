const enumOk = (gender) => {
  const enumGender = ['hombre', 'mujer'];
  if (enumGender.includes(gender)) {
    return { check: true, gender };
  } else {
    return {
      check: false,
    };
  }
};
const enumOkCate = (categoria) => {
  const enumcate = [
    'limpieza',
    'alimentacion',
    'juguetes',
    'textil',
    'electronica',
    'drogueria',
  ];
  if (enumcate.includes(categoria)) {
    return { check: true, categoria };
  } else {
    return {
      check: false,
    };
  }
};
const enumOkValora = (valoracion) => {
  const enumValor = ['1', '2', '3', '4', '5'];
  if (enumValor.includes(valoracion)) {
    return { check: true, valoracion };
  } else {
    return {
      check: false,
    };
  }
};

module.exports = { enumOk, enumOkCate, enumOkValora };

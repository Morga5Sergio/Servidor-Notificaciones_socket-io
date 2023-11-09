// Generar un número aleatorio único y convertirlo a una cadena sin el punto
const uniqueRandomNumber = (Math.random() + Date.now()).toString().replace('.', '')
// const uniqueRandomNumberWithText = 'UniqueRandom_' + uniqueRandomNumber  // * Llave generada
const uniqueRandomNumberWithText = 'UniqueUnique'

export default uniqueRandomNumberWithText

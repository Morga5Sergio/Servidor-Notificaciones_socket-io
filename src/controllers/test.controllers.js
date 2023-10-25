export const helloWorld = async (req, res) => {
  try {
    const clientIp = req.ip; // Obtiene la dirección IP del cliente
    return res.send('Tu dirección IP es: ' + clientIp);
  } catch (error) {
    console.log({ error })
    return res.render('error', { errorMessage: error.message })
  }
}

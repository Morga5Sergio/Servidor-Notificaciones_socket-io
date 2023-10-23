export const helloWorld = async (req, res) => {
  try {
    return res.json({
      message: 'This new hello world!!'
    })
  } catch (error) {
    console.log({ error })
    return res.render('error', { errorMessage: error.message })
  }
}

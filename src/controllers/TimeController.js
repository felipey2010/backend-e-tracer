module.exports = {
  async greeting(req, res) {
    const hour = new Date().getHours()

    const greetings = ["Bom dia", "Boa tarde", "Boa noite"]
    let greeting = ""

    if (hour < 12) greeting = greetings[0]
    else if (hour < 18) greeting = greetings[1]
    else greeting = greetings[2]

    return res.status(200).json({
      greeting: greeting,
      success: true,
    })
  },
}

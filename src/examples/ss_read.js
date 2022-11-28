// Import SmartSchool client
const ss = require('smartschool-client')
const conf = require('../config/config.ss')

const main = async () => {
  try {
    // Initialiseer configuratie
    await ss.init({
      apiWSDL: conf.apiWSDL,
      accessCode: conf.accessCode
    })

    // Aanspreken van een smartschool-client functie
    const users = await ss.getUsers({
      groupId: '1A1',
      // transformation: {
      //   name: 'naam',
      //   firstName: 'voornaam',
      //   userName: 'gebruikersnaam',
      //   internalNumber: 'internnummer'
      // }
    })

    console.log(users[0])
    console.log(`${users.length} users gevonden`)

  } catch (e) {
    console.log(e)
  }
  console.log('Done')
}
main()
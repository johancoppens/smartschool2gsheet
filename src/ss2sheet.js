
const { google } = require('googleapis')

const ssClient = require('smartschool-client')
const confSS = require('./config/config.ss')

const path = require('path')

const sheets = google.sheets('v4')
const scopes = [ 'https://www.googleapis.com/auth/spreadsheets' ]
// Pad naar credentials file
const credentialsFile = path.resolve(`${__dirname}/./config/prefab-manifest-368610-e87b7c1d0828.json`)
const spreadsheetId = '1jJC7kzQ6hXnZg76CkwabXKjqzRybHpzToNq-4c6ltgY'

let GAuth = null // Google auth token


// Google code
const getGAuthToken = async () => {
  // Get auth token
  const googleAuth = new google.auth.GoogleAuth({
    scopes: scopes,
    keyFile: credentialsFile
  })
  const auth = await googleAuth.getClient()
  return auth
}

const clearSheetRows = async (sheetName, startRow = 2, endRow = 10000 ) => {
  await sheets.spreadsheets.values.batchClear({
    spreadsheetId,
    auth: GAuth,
    ranges: [`${sheetName}!A${startRow}:${endRow}`]
  })
}

const updateSheetData = async (sheetName, startRow = 2, values ) => {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    auth: GAuth,
    valueInputOption: 'RAW',
    range: `${sheetName}!A${startRow}`,
    resource: {
      values
    }
  })
}

const updateTimestamp = async () => {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    auth: GAuth,
    valueInputOption: 'RAW',
    range: `dash!B1`,
    resource: {
      values: [[ new Date().toLocaleString('nl-BE') ]]
    }
  })
}

// Smartschool code

const initSmartschoolClient = async () => {
  await ssClient.init({
    apiWSDL: confSS.apiWSDL,
    accessCode: confSS.accessCode
  })

}

// Utilities

// Transformeer array of objects naar een nested array
const arrayOfObjects2NestedArray = (a) => {
  return a.map((u) => {
    const res = []
    // loop user object and add valkues to res
    for (const [key, value] of Object.entries(u)) {
      res.push(value)
    }
    return res
  })
}

// Veldnamen van een object ophalen als nested array (met één rij)
const getFields = (o) => {
  const fields = Object.getOwnPropertyNames(o)
  return [fields]
}

// Sync functies

const syncLeerlingen = async () => {
  // Get leerlingen
  const users = await ssClient.getUsers({
    groupId: 'lln',
    // groupId: '1A1',
    transformation: {
      Gebruikersnaam: 'gebruikersnaam',
      GebruikersnaamLCase: (row) => {
        return row.gebruikersnaam.toLowerCase()
      },
      Naam: 'naam',
      Voornaam: 'voornaam',
      Geslacht: 'geslacht',
      'InternNummer': 'internnummer',
      OfficieleKlas: (row) => {
        const groups = row.groups
        // We gaan ervan uit dat een leerling is toegewezen aan slechts 
        // één officiele klas
        let oClass = ''
        for (let i = 0; i < groups.length; i++) {
          if (row.groups[i].isOfficial === true) {
            oClass = row.groups[i].name
          }
        }
        return oClass
      },
      KlasGroep: (row) => {
        const groups = row.groups
        // Als er gewerkt wordt met subgroepen is het de klasgroep de groep waar isOfficial !== true
        let grp = ''
        if (row.groups.length > 1 ) { // subgroepen
          for (let i = 0; i < groups.length; i++) {
            if (row.groups[i].isOfficial !== true) {
              grp = row.groups[i].name
            }
          }
        }
        else {
          grp = row.groups[0].name
        }
        return grp
      },
      Klasnummer: 'klasnummer',
      EMail: 'emailadres',
      Mobiel: 'mobielnummer',
      Telefoon: 'telefoonnummer',
      Co1Voornaam: 'voornaam_coaccount1',
      Co1Naam: 'naam_coaccount1',
      Co1Relatie: 'type_coaccount1',
      Co1EMail: 'email_coaccount1',
      Co1Mobiel: 'mobielnummer_coaccount1',
      Co1Telefoon: 'telefoonnummer_coaccount2',
      Co2Voornaam: 'voornaam_coaccount2',
      Co2Naam: 'naam_coaccount2',
      Co2Relatie: 'type_coaccount2',
      Co2EMail: 'email_coaccount2',
      Co2Mobiel: 'mobielnummer_coaccount2',
      Co2Telefoon: 'telefoonnummer_coaccount2'
    }
  })

  // Sorteren op Voornaam
  users.sort((a, b) => {
    if ( a.Voornaam > b.Voornaam ) {
      return 1
    }
    if ( a.Voornaam < b.Voornaam ) {
      return -1
    }
    return 0
  })

  // Sorteren op Naam
  users.sort((a, b) => {
    if ( a.Naam > b.Naam ) {
      return 1
    }
    if ( a.Naam < b.Naam ) {
      return -1
    }
    return 0
  })

  // Sorteren op KlasGroep
  users.sort((a, b) => {
    if ( a.KlasGroep > b.KlasGroep ) {
      return 1
    }
    if ( a.KlasGroep < b.KlasGroep ) {
      return -1
    }
    return 0
  })

  // Ophalen hoofdingen
  const headers = getFields(users[0])

  // Omvormen van een array of users naar een nested array 
  const usersArray = arrayOfObjects2NestedArray(users)
  
  // Clear sheet
  await clearSheetRows('leerlingen', 1, 10000)

  // Update headers
  await updateSheetData('leerlingen', 1, headers)

  // Update sheet data
  await updateSheetData('leerlingen', 2, usersArray)
}

const syncLeerkrachten = async () => {
  // Get Leerkrachten
  const users = await ssClient.getUsers({
    groupId: 'lkn',
    transformation: {
      Gebruikersnaam: 'gebruikersnaam',
      GebruikersnaamLCase: (row) => {
        return row.gebruikersnaam.toLowerCase()
      },
      Naam: 'naam',
      Voornaam: 'voornaam',
      Geslacht: 'geslacht',
      EMail: 'emailadres',
      Mobiel: 'mobielnummer',
      Telefoon: 'telefoonnummer',
      Afkorting: 'koppelingsveldschoolagenda'
    }
  })

  // Sorteren op Gebruikersnaam
  users.sort((a, b) => {
    if ( a.GebruikersnaamLCase > b.GebruikersnaamLCase ) {
      return 1
    }
    if ( a.GebruikersnaamLCase < b.GebruikersnaamLCase ) {
      return -1
    }
    return 0
  })

  // // Ophalen hoofdingen
  const headers = getFields(users[0])

  // // Omvormen van een array of users naar een nested array 
  const usersArray = arrayOfObjects2NestedArray(users)
  
  // Clear sheet
  await clearSheetRows('leerkrachten', 1, 10000)

  // Update headers
  await updateSheetData('leerkrachten', 1, headers)

  // Update sheet data
  await updateSheetData('leerkrachten', 2, usersArray)
}

const syncGroepen = async () => {
  // Get Klassen
  const groups = await ssClient.getGroups({
    groupId: 'lln',
    transformation: {
      Naam: 'name',
      Code: 'code',
      CodeClean: (row) => {
        return row.code
          .replace(' ', '')
          .replace('-', '')
      },
      Omschrijving: 'desc',
      AdministratiefNummer: 'adminNumber',
      isOfficial: 'isOfficial',
      Titularis1:  (row) => {
        if (row.titu && row.titu[0] && row.titu[0].username) {
          return row.titu[0].username
        } else {
          return null
        }
      },
      Titularis2:  (row) => {
        if (row.titu && row.titu[1]&& row.titu[1].username) {
          return row.titu[1].username
        } else {
          return null
        }
      }
    }
  })

  // console.log(groups[0])

  const classes = groups.filter((grp) => {
    // console.log(grp)
    // if (grp.isOfficial && grp.isOfficial === true) {
    //   return true
    // } else {
    //   return false
    // }
    if (grp.Code === 'DEMOKLAS' || grp.Code === 'lln') {
      return false
    }
    return true
  })

  // Sorteren op Naam
  classes.sort((a, b) => {
    if ( a.Naam > b.Naam) {
      return 1
    }
    if ( a.Naam < b.Naam) {
      return -1
    }
    return 0
  })

  // Ophalen hoofdingen
  const headers = getFields(classes[0])

 

  // Omvormen van een array of users naar een nested array 
  const classesArray = arrayOfObjects2NestedArray(classes)
  
  // Clear sheet
  await clearSheetRows('groepen', 1, 10000)

  // Update headers
  await updateSheetData('groepen', 1, headers)

  // Update sheet data
  await updateSheetData('groepen', 2, classesArray)
}


const main = async () => {
  try {
    GAuth = await getGAuthToken()

    await initSmartschoolClient()

    await syncLeerlingen()

    await syncLeerkrachten()

    await syncGroepen()

    await updateTimestamp()

  } catch (e) {
    console.log(e)
  }
  console.log('Done')
}
main()
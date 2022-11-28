// Voorbeeld script om te schrijven naar Google Sheets
const { google } = require('googleapis')
const sheets = google.sheets('v4')
const path = require('path')


const scopes = [ 'https://www.googleapis.com/auth/spreadsheets' ]
// Pad naar credentials file
const credentialsFile = path.resolve(`${__dirname}/../config/prefab-manifest-368610-e87b7c1d0828.json`)
const spreadsheetId = '1jJC7kzQ6hXnZg76CkwabXKjqzRybHpzToNq-4c6ltgY'

const main = async () => {
  try {
    // Get auth token
    const googleAuth = new google.auth.GoogleAuth({
      scopes: scopes,
      keyFile: credentialsFile
    })
    const auth = await googleAuth.getClient()
    // console.log(auth)

    // Get sheet
    const sheet = await sheets.spreadsheets.get({
      spreadsheetId,
      auth
    })
    // console.log(sheet)

    // Get sheet data
    const data = await sheets.spreadsheets.values.get({
      spreadsheetId,
      auth,
      range: 'leerlingen'
    })
    // console.log(data.data.values)

    // Clear sheet except first row
    let res = await sheets.spreadsheets.values.batchClear({
      spreadsheetId,
      auth,
      ranges: ['leerlingen!A2:5000'],
    })
    // console.log(res)

    // Update sheet data
    res = await sheets.spreadsheets.values.update({
      spreadsheetId,
      auth,
      valueInputOption: 'RAW',
      range: 'leerlingen!A2',
      resource: {
        values: [
          [ 'Hello', 'Google', 'Sheets' ],
          [ 'rij2' ],
          [ 'rij3' ],
          [ 'rij4' ]
        ]
      }
    })
    // console.log(res)
  } catch (e) {
    console.log(e)
  }
  console.log('Done')
}
main()
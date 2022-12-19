# Smartschool naar Google Sync

## Installatie

Clone project

```
$ git clone git@github.com:johancoppens/smartschool2gsheet.git

```

Volg onderstaande uitleg voor het opzetten van je eigen Google Cloud Project, het aanmaken en delen van een Google Sheet.

Hernoem de directory config.template naar config

Plaats daarin je key file

Pas config.js aan met jouw gegevens

## Manueel uitvoeren

In project directory

```
$ node src/ss2sheet.js 
Done. Data available at:
https://docs.google.com/spreadsheets/d/1jJC7kzQ6hXnZg76CkwabXKjqzRybHpzToNq-xxxxxxx/edit#gid=364365296

```

## Create cron Job

See https://flaviocopes.com/cron-job-nodejs-app/

## Opzetten Google Cloud Project

Ga naar https://console.cloud.google.com/

Maak een nieuw project aan, bvb Smartschool2GoogleSync

Ga naar APIs and services

Klik op het + ENABLE APIS AND SERVICES bovenaan op de "Enabled APIs and services" pagina

Zoek naar Google Sheets API en klik op ENABLE

Klik op de CREDENTIALS tab op de GoogleSheets API pagina

[TODO] Uitleg waarom service account

Klik op + CREATE CREDENTIALS > Service account

Geef een Service account name, bvb Smartschool2GoogleSync

Laat de Service account ID op de voorgestelde standaard waarde staan

Klik op DONE onderaan op de pagina

De service account verschijnt nu in de lijst. Klik de op de nieuw gemaakte service account om naar de detailpagina te gaan.

Ga naar het tabblad KEYS

Klik op ADD KEY > Create new key

Kies voor JSON type en klik op CREATE

De JSON keyfile wordt vervolgens gedownload. Bewaar deze file op een veilige plaats. Iedereen die in het bezit is van deze file heeft immers toegang tot deze API, en dus ook al de Google Sheets.

Wij gaan dit bestand opslaan in de project folder onder src/config om het later te gebruiken in onze code.

Als je git zou gebruiken om je project te beheren en op te slaan in een publieke repo, bvb Github, vergeet dan niet deze directory op te nemen in je .gitignore file!

## Google Sheet Aanmaken

De volgende stap is een Google Sheet aanmaken. Omdat we de eerder gemaakte service account gaan gebruiken om data te uit te wisselen van en naar de sheet, moeten we de sheet delen met deze account.

Maak een sheet en geef het een naam, bvb SmartschoolMasterData

Klik op Delen, en voeg de service account als bewerker toe met het email adres ervan, bvb smartschool2googlesync@prefab-manifest-xxxxxx.iam.gserviceaccount.com.


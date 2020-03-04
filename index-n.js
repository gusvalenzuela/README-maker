const fs = require(`fs`)
const inquirer = require(`inquirer`)
const moment = require(`moment`)
const util = require(`util`)
const fMode = `Full Mode: Will get prompted for various other sections (Installation, Usage, etc.)`
const bMode = `Basic Mode: Only name, title, and github sections are requested (all else left blank)`
const axios = require(`axios`)

const writeFileSync = util.promisify(fs.writeFile)

const questions = [
    {
        name: `mode`,
        type: `list`,
        message: `Use Basic Mode or Full Mode?`,
        // had idea to have keys, probz not necessary
        choices: [
            {
                key: `b`,
                value: bMode,
            },
            {
                key: `f`,
                value: fMode,
            },

        ],
    },
    {
        name: `name`,
        type: `input`,
        message: `What is your name?`,
    },
    {
        name: `title`,
        type: `input`,
        message: `What is the name of your project (TITLE)?`,
        default: `N/A`,
    },
    {
        name: `description`,
        type: `input`,
        message: `Write a brief description of your project:`,
        default: `N/A`,
        when: (answers) => answers.mode === fMode,
    },
    {
        name: `installation`,
        type: `input`,
        message: `How is your application installed?`,
        default: `N/A`,
        when: (answers) => answers.mode === fMode,
    },
    {
        name: `usage`,
        type: `input`,
        message: `How is your application used?`,
        default: `N/A`,
        when: (answers) => answers.mode === fMode,
    },
    {
        name: `license`,
        type: `input`,
        message: `Which license will you be assigning to this project?`,
        // could make this an option with an [other]
        default: `N/A`,
        when: (answers) => answers.mode === fMode,
    },
    {
        name: `contributing`,
        type: `input`,
        message: `Who contributed to this project?`,
        default: `N/A`,
        when: (answers) => answers.mode === fMode,
    },
    {
        name: `tests`,
        type: `input`,
        message: `Tests?`,
        default: `N/A`,
        when: (answers) => answers.mode === fMode,
    },
    {
        name: `githubName`,
        type: `input`,
        message: `What is your GitHub username?`,
        default: `N/A`,
    },
]

function askUser() {
    return inquirer.prompt(questions)
}

function generateREADME(a, gitPhotoURL, gitEmail) {
    if (gitEmail === undefined || gitEmail === null) {
        gitEmail = `There appears to be no email associated with your GitHub Account`
    }
    if (a.installation === undefined) {
        a.installation = `[Enter installation information here]`
    }
    if (a.description === undefined) {
        a.description = `[Enter project description here]`
    }
    if (a.usage === undefined) {
        a.usage = `[Enter how project is to be used here]`
    }
    if (a.contributing === undefined) {
        a.contributing = `[Enter other contributors here]`
    }
    if (a.license === undefined) {
        a.license = `[Enter licenses used here]`
    }

    return `# A Project by: 
${a.name} (GitHub user: ${a.githubName})
[![GitHub Avatar](${gitPhotoURL})]
My email address: ${gitEmail}

## Title
* ${a.title}

## Description
* ${a.description}

## Installation
* ${a.installation}

## Usage
* ${a.usage}

## License
* ${a.license}

## Contributors
* ${a.name} and ${a.contributing}
`
}

async function renderNewFile() {
    try {
        let filename = `./generated-files/README-` + moment().format(`YYYYMMDDhhmmss`) + `.md`
        let gitPhotoURL, gitEmail

        const answers = await askUser()             // waiting for inquirer prompt to gather all answers from user
        await axios.get(`https://api.github.com/users/${answers.githubName}`).then(function (res) {
            console.log(res.data)
            gitPhotoURL = res.data.avatar_url
            gitEmail = res.data.email

            //   for(i of res.data){
            //     repoArray.push(i.name)
            //   }
        })

        const readmeText = generateREADME(answers, gitPhotoURL, gitEmail)   // send answers obj to generateREADME function to parse 
        writeFileSync(filename, readmeText)                                 // create README.md file (timestamped) with README template

        // console.log(`File created (${filename})!`)
        // console.log(readmeText)

    } catch (err) {
        console.log(err)
    }
}

renderNewFile()
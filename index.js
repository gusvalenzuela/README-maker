const fs = require(`fs`)
const util = require(`util`)
const inquirer = require(`inquirer`)
const moment = require(`moment`)
const axios = require(`axios`)

const fMode = `Full Mode: Will get prompted for various other sections (Installation, Usage, etc.)`
const bMode = `Basic Mode: Only name, title, and github sections are requested (all else left blank)`

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
        message: `What is your full name?`,
        validate: async input => {
            if (input === null || input === ` ` || input === `  ` || input === `   ` || input.length < 3) {
               return `A name is required (min. 3 characters)`
            }
            return true
         }
    },
    {
        name: `githubName`,
        type: `input`,
        message: `Please enter your GitHub username:`,
        validate: async input => {
            if (input === null || input === ` ` || input === `  ` || input === `   ` || input.length < 3) {
               return `must make an entry to continue (min. 3 characters)`
            }
            return true
         }
    },
    {
        name: `title`,
        type: `input`,
        message: `What is the name of your project?`,
        default: `Untitled`,
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
        message: `Which license(s) will you be assigning to this project?`,
        // could make this an option with an [other]
        default: `N/A`,
        when: (answers) => answers.mode === fMode,
    },
    {
        name: `contributing`,
        type: `input`,
        message: `Who else contributed to this project?`,
        default: `N/A`,
        when: (answers) => answers.mode === fMode,
    },
]
const askUser = () => {
    return inquirer.prompt(questions)
}
const generateREADME = (a, gitPhotoURL, gitEmail, gitMainURL) => {
    if (gitEmail === undefined || gitEmail === null) {
        gitEmail = `[no email found]`
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

    let socialBadge = `https://img.shields.io/github/followers/${a.githubName}?style=social`
    return `# ${a.title}
    
A Project by: ${a.name} (GitHub: @${a.githubName}) [![User Followers](${socialBadge})](${gitMainURL+`?tab=followers`})

[![GitHub Avatar](${gitPhotoURL})](${gitMainURL})

My email address: ${gitEmail}

### Description
* ${a.description}

### Installation
* ${a.installation}

### Usage
* ${a.usage}

### License
* ${a.license}

Contributors
* ${a.name} and ${a.contributing}
`
}

async function renderNewFile() {
    try {
        let filename = `./generated-files/README-` + moment().format(`YYYYMMDDhhmmss`) + `.md`
        let gitPhotoURL, gitEmail, gitMainURL

        const answers = await askUser()             // waiting for inquirer prompt to gather all answers from user

        let userURL = `https://api.github.com/users/${answers.githubName}`
        let repoURL = `https://api.github.com/users/${answers.githubName}/repos?sort=created&direction=desc&per_page=100`

        // waiting for an axios call to get GitHub user information before we continue
        await axios.get(userURL).then(res => {
            // console.log(res.data)
            gitPhotoURL = res.data.avatar_url       // saving profile avatar url to variable
            gitEmail = res.data.email               // saving user's email to variable
            gitMainURL = res.data.html_url          // saving user's github url to variable
        })
        // waiting for an axios call to get GitHub user repos data
        // await axios.get(repoURL).then(res => {
        //     console.log(res.data)
        //       for(i of res.data){

        //       }
        // })

        const readmeText = generateREADME(answers, gitPhotoURL, gitEmail, gitMainURL)         // send answers obj to generateREADME function to parse 
        await writeFileSync(filename, readmeText)                                 // create README.md file (timestamped) with README template
        
        console.log(`Thank you ~ File created (${filename}).`)

    } catch (err) {
        console.log(err)
    }
}

renderNewFile()

module.exports = {
    askUser: askUser,
    generateREADME: generateREADME,
    questions:questions,

}
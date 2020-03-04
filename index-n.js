const fs = require(`fs`)
const inquirer = require(`inquirer`)
const moment = require(`moment`)
const util = require(`util`)
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
        message: `What and how is your application used?`,
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

function generateREADME(a, git) {
    return `# Title
* ${a.title} 

# Description
* I see your name is ${a.name}

# Installation
* ${a.installation}

# Usage
* ${a.usage}

# Contributors
* ${a.contributing}

# GitHub information
* ${a.githubName}
`
}

const getGitHubInfo = name => {
    $.ajax({
        queryUrl: `https://api.github.com/users/${name}/repos?per_page=100`,
        method: `GET`,
    }).then(function (res) {
        console.log(res.data)
        //   for(i of res.data){
        //     repoArray.push(i.name)
        //   }
        //   fs.writeFile(`repos.txt`,repoArray.join(`\n`), err => {
        //     if (err) throw err
        //     console.log(`Succesfully added ${repoArray.length} repos into "repos.txt"`)
        //   })
    })
}

async function renderNewFile() {
    try {
        let filename = `./generated-files/README-` + moment().format(`YYYYMMDDhhmmss`) + `.md`

        const answers = await askUser()             // waiting for inquirer prompt to gather all answers from user
        const githubInfo = getGitHubInfo(answers.githubName)
        const readmeText = generateREADME(answers, githubInfo)  // send answers obj to generateREADME function to parse 
        await writeFileSync(filename, readmeText)   // create README.md file (timestamped) with README template

        console.log(`File created (${filename})!`)
        // console.log(readmeText)

    } catch (err) {
        console.log(err)
    }
}

renderNewFile()
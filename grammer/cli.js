#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const archiver = require('archiver')
const request = require('request')
let manifest = require(path.resolve('./manifest.json'))
let webpack = './webpack.config.js'

require('dotenv').load()

const user = {
    email: 'rcpelisco@gmail.com',
    password: 'RCPelisco122497'
}

const signInURL = `http://127.0.0.1:8000/SignIn/?email=${user.email}&password=${user.password}`

const argv = require('yargs')
    .version(false)
    .command('$0', 'Default command', (yargs) => {
        yargs.option('version', {
            alias: 'v',
            description: 'Get current version.',
            demandOption: true
        })
    }, argv => {
        if(argv.version) getManifestVersion()
    })
    .command('build', 'Build grammer', yargs => {
        yargs
            .option('version', {
                description: 'Set new version number',
                alias: 'v',
                demandOption: true
            })
            .option('logic', {
                description: 'Explain logic',
                type: 'string',
                default: '',
            })
            .option('bug', {
                description: 'Describe bugs fixed',
                type: 'string',
                default: '',
            })
            .option('new', {
                description: 'Describe new features',
                type: 'string',
                default: '',
            })
            .option('next', {
                description: 'State what the next version will have',
                type: 'string',
                default: '',
            })
    }, (argv) => build(argv))
    .command('dev', true, () => dev())
    .help()
    .alias('help', 'h')
    .scriptName('grammer')
    .argv

function setWebpackMode(mode) {
    fs.readFile(webpack, {encoding: 'utf-8'}, (err, data) => {
        if(err) return console.log(err)
        if(mode == 'production') { 
            result = data.replace('mode: "development"', 'mode: "production"')
        } else {
            result = data.replace('mode: "production"', 'mode: "development"')
        }
        fs.writeFile(webpack, result, 'utf8', (err) => {
            if(err) return console.log(err)
        })
    })
}

function getManifestVersion() {
    console.log(manifest.version)
}

function setManifestVersion(version) {

    manifest.version = version.toString()
    try {
        fs.writeFileSync(path.resolve('./manifest.json'), 
            JSON.stringify(manifest, null, 2))
    } catch(err) {
        if(err) return console.log(err)
    }
}

function zipFiles() {
    let output = fs.createWriteStream(path.resolve('./grammer.zip'))
    let archive = archiver('zip', { zlib: { level: 9 } })

    archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
          console.log(err)
        } else {
          throw err;
        }
    });

    archive.on('error', function(err) {
        throw err;
    });

    archive.pipe(output);

    archive.directory('dist/', 'dist')
    archive.file('manifest.json', { name: 'manifest.json' })

    return archive.finalize().then(() => console.log(`${chalk.bgGreen(chalk.white(' ZIPPED! '))} Output: ${chalk.blueBright('grammer.zip')} With ${chalk.green(archive.pointer())} total bytes`))
}

function uploadToAdmin(argv) {
    let formData = {
        version: argv.version,
        description_logic: argv.logic,
        description_bug: argv.bug,
        description_new: argv.new,
        description_next: argv.next,
        zip: fs.createReadStream(path.resolve('./grammer.zip'))
    }
    console.log(`${chalk.bgGreen(chalk.white(' UPLOADING '))}`)
    request.get(signInURL, (e,r,b) => {
        let token = JSON.parse(b).token.key
        request.post(
            {
                url: 'http://127.0.0.1:8000/Extension/', 
                formData: formData,
                headers: { Authorization: `Token ${token}` }
            }, 
            (err, response, body) => {
                if(err) return console.log('Upload failed: ', err)
                if(body)
                console.log('Uploaded successful! Server responded with: ', body)
            }
        )
    })
}

function build(argv) {
    setWebpackMode('production')
    setManifestVersion(argv.version)
    zipFiles().then(() => {
        uploadToAdmin(argv)
    })
}

function dev() {
    setWebpackMode('development')
}

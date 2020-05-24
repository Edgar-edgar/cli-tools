#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const chalk = require('chalk');
const { JSDOM } = require('jsdom')
const cssist = require('./cssist')

const argv = require('yargs')
    .usage('Usage: cssist <options>')
    .option('path', {
        alias: 'p',
        description: 'Desired output path of cssist',
        type: 'string',
        demandOption: true
    })
    .option('file', {
        alias: 'f',
        description: 'Filename of compiled cssist',
        default: 'cssist.css'
    })
    .help()
    .alias('help', 'h')
    .argv

// save()
let startPath = 'src'
let filter = '.vue'

read(startPath, filter)

function read(startPath, filter){
    let window = (new JSDOM('<html><body></body></html>')).window
    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    files.forEach((file) => {
        let filename = path.join(startPath, file);
        let stat = fs.lstatSync(filename)
        if(stat.isDirectory()) {
            read(filename, filter)
        } else if(filename.indexOf(filter)>=0) {
            console.log('--- ', filename, ' ---')
            window.document.querySelector('body').innerHTML = fs.readFileSync(filename, 'utf-8')
        
            let css = cssist.init(window)
            console.log(css)
            // let dom = new JSDOM(`<body>${fs.readFileSync(filename, 'utf-8')}</body>`)

            // let ser = dom.window.document.querySelector('').textContent
            // console.log(ser)
            // jquery.parseHTML(contents)
            // console.log(contents)
        }
    })
};
    
function save() {
    fs.readFile(path.resolve(__dirname, './bears.txt'), (err, data) => {
        let bears = data.toString().split('\n');
        let bear = bears[Math.floor(Math.random() * bears.length)];
    
        let dir = path.resolve(argv.path)

        fs.mkdir(dir, { recursive: true}, (err, p) => {
            if(err) { 
                console.error(err) 
                return 
            }
            fs.writeFile(path.resolve(dir, argv.file), bear, () => {
                console.log(`${chalk.bgGreen(chalk.black(' DONE '))} ${chalk.green('Compiled successfully')}\nCSSIST generated on \n${chalk.green(dir)}\nWith the filename ${chalk.green(argv.file)}`)
            })
    
        })
    });
}

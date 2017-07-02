const controller = require('../controller');
const config = require('../config');
const path = require('path');
var commander = require('commander');
 
commander
    .version(config.version)
    .option('-p, --project <directory>', 'input the project directory')
    .parse(process.argv);

if (commander.project) {
    config.project = commander.project;
    if (!path.isAbsolute(config.project)) {
        config.project = path.join(process.cwd(), config.project);
    }
}

config.get()(controller);

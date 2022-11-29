global.$ = $;

const sqlite = require('sqlite3');
const envpath = require('env-paths');
const makedir = require('make-dir');
const fs = require('fs');

const paths = envPaths('AISLE');

const initialized = initialize_db();
//resolve to ensure since async here

async function initialize_db()
{
    if (fs.existsSync(paths.data))
    {
        console.log("No init needed");
    }
    else
    {
        console.log("Make the dir");
        await makedir(paths.data);
    }
}
global.$ = $;

const cheerio = require('cheerio');
const request = require('request-promise');

//use a placeholder which we'll substitute with our query for each site, easier to just parse than do API stuff for now
const recipe_sites = ["https://natashaskitchen.com/?s=QUERY", "https://www.foodnetwork.com/search/QUERY-","https://www.thespruceeats.com/search?q=QUERY&searchType=recipe",
"https://www.spendwithpennies.com/?s=QUERY","https://www.simplyrecipes.com/search?q=QUERY"] 

SearchForRecipe("apple pie");

//we're using request which is 'deprecated' but in the interest of getting this in a working state, we will be using request
function SearchForRecipe(recipe)
{
    for (var i = 0; i < recipe_sites.length; i++)
    {
        ParseRootPage(recipe, i);
    }
}

function ParseRootPage(query, index)
{
    request({method:'GET', uri:recipe_sites[index].replace("QUERY",query)}, (error, response, html) => {
        //yay, inline lambdas!
        if (!error && response.statusCode==200)
        {
            const $ = cheerio.load(html);
            //this code is (unfortunately) dependent on the recipe_sites list staying static, as it uses the index to define how to parse
            switch (index)
            {
                case 0:
                    const block = $('div[class="postgrid clearfix"] ul').first();
                    block.find("li > div > a").each(function (index2, element)
                    {
                        let title = $(element).text();
                        if (title.indexOf("VIDEO") == -1)
                        {
                            //no videos, we don't wanna parse them :)
                            //now parse the recipe's actual HREF and get our recipe info from this
                            let href = $(element).attr('href');
                            console.log(href);
                            console.log(ParseRecipePage(href, index));
                        }
                    })
                    break;
                case 1:break;
                case 2:break;
                case 3:break;
                case 4:break;
                default:
                    console.log("Outside of programmed cases! ERROR"); break;
            }
        }
    })
}

function ParseRecipePage(href, index)
{
    //this is the fun part, especially when the website is programmed not great
    request({method:'GET', uri:href}, (error, response, html) => {
        //yay, inline lambdas!
        if (!error && response.statusCode==200)
        {
            const $ = cheerio.load(html);
            //this code is (unfortunately) dependent on the recipe_sites list staying static, as it uses the index to define how to parse
            switch (index)
            {
                case 0:
                    var block = $('h2:contains("Ingredients")');
                    if (block.text() == "")
                    {
                        //uh oh! they switched to an h3 for this one
                        //perform the search again, with an h3
                        block = $('h3:contains("Ingredients")');
                    }
                    console.log("Url for this one was " + href);
                    console.log(block.text());
                    console.log(block.next().text());
                    var ingredients = block.next().text();
                    //now, we need to parse these ingredients
                    //works for everything but dashes:
                    //\d?((\/| ){1}\d{1,2}){0,2}
                    //works for everything when newlines are enforced per item:
                    //^\d{1,3}(\/\d{1,3}| \d{1,3}\/\d{1,3}|-\d{1,3})?
                    //actual final version:
                    //\n(\d{1,3}(?:\/\d{1,3}| \d{1,3}\/\d{1,3}|-\d{1,3})?)
                    //this doesn't work the way I expected, it's actually splitting around instead of chopping at the match
                    //so let's be simpler and just split it at the newlines with a lookahead
                    const regex = new RegExp('\\n(\\d{1,3}(?:\\/\\d{1,3}| \\d{1,3}\\/\\d{1,3}|-\\d{1,3})?)');
                    const regex2 = new RegExp('\\n(?=\\d+)');
                    ingredients = ingredients.split(regex2);
                    //TODO: Figure out how to determine if an ingredients list is parsed bad programmatically
                    for (var x = 0; x < ingredients.length; x++)
                    {
                        //cleaned ingredients
                        console.log(ingredients[x].replace("\\n",""));
                    }
                    break;
                case 1:break;
                case 2:break;
                case 3:break;
                case 4:break;
                default:
                    console.log("Outside of programmed cases! ERROR"); break;
            }
        }
    })  
}


global.$ = $;

const cheerio = require('cheerio');
const request = require('request-promise');

//use a placeholder which we'll substitute with our query for each site, easier to just parse than do API stuff for now
const recipe_sites = ["https://natashaskitchen.com/?s=QUERY", "https://www.foodnetwork.com/search/QUERY-","https://www.thespruceeats.com/search?q=QUERY&searchType=recipe",
"https://www.spendwithpennies.com/?s=QUERY","https://www.simplyrecipes.com/search?q=QUERY"] 

//simple test code 
//const fallows = SearchForRecipe("apple pie");
//fallows.then(console.log);

//we're using request which is 'deprecated' but in the interest of getting this in a working state, we will be using request
//time to use async since webreqs, cool :)
async function SearchForRecipe(recipe)
{
    var recipes = [];
    for (var i = 0; i < recipe_sites.length; i++)
    {
        try
        {
            var siterecipes = await ParseRootPage(recipe, i);
            for (var x = 0; x < siterecipes.length; x++)
            {
                siterecipes[x].then(function(result)
                {
                    recipes.push(result);
                }, function(error)
                {
                    console.log("Failed to fetch a recipe");
                });
            }
        }
        catch (e)
        {
            console.log("Caught an error!");
        }
        finally
        {
            //no cleanups for now :)
            return recipes;
        }
    }
}

function ParseRootPage(query, index)
{
    return new Promise((resolve, reject) => {
        var options = {
            method:'GET',
            uri:recipe_sites[index].replace("QUERY",query)
        };
        request(options, (error, response, html) => {
        //yay, inline lambdas!
        if (!error && response.statusCode==200)
        {
            const $ = cheerio.load(html);
            //this code is (unfortunately) dependent on the recipe_sites list staying static, as it uses the index to define how to parse
            switch (index)
            {
                case 0:
                    const block = $('div[class="postgrid clearfix"] ul').first();
                    var recipes = [];
                    block.find("li > div > a").each(function (index2, element)
                    {
                        let title = $(element).text();
                        if (title.indexOf("VIDEO") == -1)
                        {
                            //no videos, we don't wanna parse them :)
                            //now parse the recipe's actual HREF and get our recipe info from this
                            let href = $(element).attr('href');
                            //console.log(href);
                            recipes.push(ParseRecipePage(href, index));
                        }
                    })
                    resolve(recipes);
                    break;
                case 1:break;
                case 2:break;
                case 3:break;
                case 4:break;
                default:
                    console.log("Outside of programmed cases! ERROR"); break;
            }
        }
        else
        {
            reject(error);
        }
    });
})
}

function ParseRecipePage(href, index)
{
    //this is the fun part, especially when the website is programmed not great
    return new Promise((resolve, reject) => {
        var options = {
            method:'GET',
            uri:href
        };
        request(options, (error, response, html) => {
        //yay, inline lambdas!
        if (!error && response.statusCode==200)
        {
            const $ = cheerio.load(html);
            //this code is (unfortunately) dependent on the recipe_sites list staying static, as it uses the index to define how to parse
            switch (index)
            {
                case 0:
                    //let's try something more efficient :)
                    var bl2 = $('script[type="application/ld+json"]');
                    var json = JSON.parse(bl2.text());
                    jsondata = json["@graph"][7];
                    //console.log(jsondata);
                    //TODO: this data has a ton in it, like difficulty, price, etc
                    //for now, only grab ingredients, but in the future it might be cool to integrate more of this :)
                    if (jsondata["@type"] == "Recipe")
                    {
                        //solid recipe catch, return ingredients
                        resolve({'ingredients':jsondata["recipeIngredient"], 'image':jsondata["image"][0], 'title':jsondata['name'],'desc':jsondata['description']});
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
        else
        {
            reject(error);
        }
    }); 
}) 
}


const cssBtnItem = "position: fixed; left: 100px; top: 30px; padding: 15px; color: white; cursor: pointer; background: #48c774; box-shadow: #90ff9166 0px 0px 10px;";
const cssBtnRecipe = cssBtnItem+"left: 400px!important";
const idBtnItem = "btnitem";
const idBtnRecipe = "btnrecipe";
let clickBtnItemMajCount = 1;
let clickBtnRecipeMajCount = 1;

const recipeBases = {};

/* slugify */
String.prototype.slugify = function () {
    let str = this.toString();

    let map = {
        '-' : ' ',
        '-' : '_',
        'a' : 'á|à|ã|â|À|Á|Ã|Â',
        'e' : 'é|è|ê|É|È|Ê',
        'i' : 'í|ì|î|Í|Ì|Î',
        'o' : 'ó|ò|ô|õ|Ó|Ò|Ô|Õ',
        'u' : 'ú|ù|û|ü|Ú|Ù|Û|Ü',
        'c' : 'ç|Ç',
        'n' : 'ñ|Ñ',
        ''  :  "'",
        ''  :  ":",
    };
    
    for (var pattern in map) {
        str = str.replace(new RegExp(map[pattern], 'g'), pattern);
    };

    return String(str);
};

/* fingerprint string */
const fingerPrintString = str => {
    return String(str).slugify().replace(/\s/g,'').toLowerCase();
}

/* copy to clipboard function*/
const copyToClipboard = str => {
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };



/* btn export */
let btnItemElem = document.createElement('div');
btnItemElem.setAttribute('id', idBtnItem);
btnItemElem.textContent = 'Copier liste des items';
btnItemElem.style.cssText = cssBtnItem;
/* btn item export behavior */ 
btnItemElem.addEventListener('click', elem => {
    let itemValues = "Nom;Lvl;Quantité\n";
    /* cols paths*/
    let itemNamePath = document.querySelectorAll("#job_app > table:nth-child(2) div.media-content");
    let itemLvlPath = document.querySelectorAll("#job_app > table:nth-child(2) > tbody > tr > td:nth-child(2)");
    let itemQtePath = document.querySelectorAll("#job_app > table:nth-child(2) > tbody > tr > td.is-paddingless > div > input");

    itemNamePath.forEach((element, i) => {
        itemValues += element.textContent.trim() +';'
        + itemLvlPath[i].textContent.trim() + ';'
        + itemQtePath[i].value + '\n';
    });

    copyToClipboard(itemValues);
    btnItemElem.textContent = "Copier la liste des items (maj "+(clickBtnItemMajCount++)+")";

});


let btnRecipeElem = document.createElement('div');
btnRecipeElem.setAttribute('id', idBtnRecipe);
btnRecipeElem.textContent = "Exporter la liste des ressources";
btnRecipeElem.style.cssText = cssBtnRecipe;
/* step 1 listen all recipe clicked*/
document.querySelector('#job_app').addEventListener('click', evt => {
    
    let targetClassName = "button is-small is-success";
    let currentElem = evt.toElement;
    
    if (currentElem.nodeName == 'SPAN') { currentElem = currentElem.parentElement; }

    let rowTable =  currentElem.parentElement.parentElement.parentElement;

    if (currentElem.className == targetClassName && rowTable.nodeName == "TR") {
        //console.log("OK", rowTable.childNodes[4].childNodes[0].textContent);
        console.log("OK");
        let recipeName = rowTable.childNodes[0].childNodes[0].childNodes[0].textContent.trim();
        let recipePath = rowTable.childNodes[4].childNodes[0].childNodes;
        let recipeIngredients= [];

        recipePath.forEach((elem,i) => {
            recipeIngredients.push({ 
                name: elem.childNodes[0].childNodes[0].textContent.split(' x')[0],
                qte: elem.childNodes[0].childNodes[0].textContent.split(' x')[1]
            });
        });

        recipeBases[fingerPrintString(recipeName)] = 
        { 
            name: recipeName, 
            ingredients: recipeIngredients
        };
    }
   
});

/* step 2 make exprt all recipe */
btnRecipeElem.addEventListener('click', elem => {

    let ingredientsValues = 'Nom;Quantité\n';
    let ingredientsRecipe = {};
    /* get all selected item */
    let itemNamePath = document.querySelectorAll("#job_app > table:nth-child(2) div.media-content");
    let itemQtePath = document.querySelectorAll("#job_app > table:nth-child(2) > tbody > tr > td.is-paddingless > div > input");

    itemNamePath.forEach((elem, i) => {
        let itemNamePrinted = fingerPrintString(elem.textContent.trim());
        let itemQte = itemQtePath[i].value;

        /* get item recipt */
        let itemRecipeBase = recipeBases[itemNamePrinted];
        for (let i in itemRecipeBase.ingredients) {
            let ingredient = itemRecipeBase.ingredients[i];
            let ingredientQteTotal = parseInt(ingredient.qte, 10) * itemQte; 

            /* check if ingredient already existe */
            if (ingredientsRecipe.hasOwnProperty(fingerPrintString(ingredient.name))) {
                ingredientsRecipe[fingerPrintString(ingredient.name)].qte += ingredientQteTotal;
            } else {
                ingredientsRecipe[fingerPrintString(ingredient.name)] = {
                    name: ingredient.name,
                    qte: ingredientQteTotal
                }
            }           
        }
    });

    console.log(ingredientsRecipe);
    for (const ingredient in ingredientsRecipe) {
        ingredientsValues += ingredientsRecipe[ingredient].name + ";" + ingredientsRecipe[ingredient].qte + "\n";
    }

    copyToClipboard(ingredientsValues);
    btnRecipeElem.textContent = "Liste des ressources (Presse papier à jour "+clickBtnRecipeMajCount+")";


})

document.body.appendChild(btnItemElem);
document.body.appendChild(btnRecipeElem);


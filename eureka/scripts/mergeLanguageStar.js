const fs = require('fs');

/**
 * Take source object as definition of all translations.
 * in "useLocalizatin" find all trnanslations in differente language.
 * The main idea is, to have only one source of truth. So if some tranzlation key is removed from "source',
 * it shuold be also removed in result merged file.
 * @param source
 * @param destination
 * @returns {*}
 */
function deepMerge(source, useLozalization) {
  const resp = {...source};
  for (const key in source) {
    if (useLozalization.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        resp[key] = deepMerge(source[key], useLozalization[key]);
      }else {
        resp[key] = useLozalization[key] ;
      }
    }
  }
  return resp;
}

function mergeJSONFiles(star, source, destination) {
  // Read the JSON data from file A and file B
  const dataStar = fs.readFileSync(star, 'utf8');
  // const dataNoStar = dataStar;
  const dataNoStar = dataStar.replaceAll("☆","");
  const dataA = JSON.parse(dataNoStar);
  const dataB = JSON.parse(fs.readFileSync(destination, 'utf8'));

  // Merge the JSON data from file A into file B
  const mergedData = deepMerge(dataA, dataB);

  // Write the merged result back into file B
  fs.writeFileSync(destination, JSON.stringify(mergedData, null, 2), 'utf8');
  fs.writeFileSync(source, dataNoStar, 'utf8');
}

// Usage
const japansesFile = '../App/assets/languages/ja.json';
const englishFile = '../App/assets/languages/en.json';
const englishStarFile = '../App/assets/languages/enStar.json';
try{
  mergeJSONFiles(englishStarFile,englishFile, japansesFile);
}catch (error){
  console.error(error)
}

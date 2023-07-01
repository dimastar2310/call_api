//import Promise from 'bluebird';

//const p = require(@bluebird/Promise)
import fetch from "node-fetch";
import log from "@ajar/marker";
import Promise from "bluebird";


function getCountryPopulation(country) {
  return new Promise((resolve, reject) => {
    const url = `https://countriesnow.space/api/v0.1/countries/population`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ country }),
    };
    fetch(url, options) //returning a promise which is fulfilled once the response is available.
      .then((res) => res.json()) //res is response obj
      .then((json) => {
        //onse of them happens its like return on resolve or on rejcet
        if (json?.data?.populationCounts)
          resolve(json.data.populationCounts.at(-1).value);
        else reject(new Error(`My Error: no data for ${country}`)); //app logic error message
      })
      .catch((err) => reject(err)); // network error - server is down for example...
    // .catch(reject)  // same same, only shorter...
  });
}


//--------------------------------------------------------
//  Manual - call one by one...
//--------------------------------------------------------
function manual() {
  getCountryPopulation("France") //this should return first
    .then((population) => {
      //onse promise returned its inside population ,we get resolved obj here
      console.log(`population of France is ${population}`);
      return getCountryPopulation("Germany"); //getting rpomise indside him
    })
    .then((population) => console.log(`population of Germany is ${population}`)) //using the rpomise before
    .catch((err) => console.log("Error in manual: ", err.message)); //or using the rpomise before on err
}
//manual()

//------------------------------
//   Sequential processing
//------------------------------
const countries = [
  "France",
  "Russia",
  "Germany",
  "United Kingdom",
  "Portugal",
  "Spain",
  "Netherlands",
  "Sweden",
  "Greece",
  "Czechia",
  "Romania",
  "Israel",
  "Picky",
];
// i need to put promise handler
function sequence() {
  Promise.each(countries, (item) => {
    log.info("Start processing item:", item);
    return getCountryPopulation(item)
      .then((population) => {
        log.magenta(`The population of ${item}:`, population);
      })
      .catch((err) => log.red("Error:", err.message));
  })
    .then((originalArr) => {
      log.green("All tasks are done now...", originalArr);
    })
    .catch((err) => log.red("Error in sequence:", err.message));
}

sequence();

function sequence2() {// lets say i want to quit if the item not exics 
  Promise.each(countries, (item) => {

    log.info("Start processing item:", item);
    return getCountryPopulation(item)
      .then((population) => {
        log.magenta(`The population of ${item}:`, population);
      })
      .catch((err) => {
        log.red("Error:", err.message);
        throw err; // Rethrow the error to exit the loop
      });
  })
    .then((originalArr) => {
      log.green("All tasks are done now...", originalArr);
    })
    .catch((err) => log.red("Error in sequence:", err.message));
}

//sequence2();

//--------------------------------------------------------
//  Parallel processing
//--------------------------------------------------------

function parallel() { //execution happens here 1 after another because of Promise of blubird
  //much elegant way

  Promise.map(countries, (country) => {
    log.info("start processing item", country);

    return getCountryPopulation(country).then(
      (population) => {
        //marker.blue(`the population of ${country} is :`, population);
        return population;
      },
      (err) => {
        log.red(`Error processing ${country}:`, err.message);
        return null; // Return a null value or any other placeholder value to continue the chain
      }
    );
  }).then(
    (resultArr) => {
      //console.log('all tasks are done now...',resultArr);
      resultArr.forEach((pop, index) =>
        console.log(`the population of ${countries[index]} is :${pop}`)
      );
    },
    (err) => {
      log.red("Error:", err.message);
    }
  );
}
parallel();

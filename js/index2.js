import fetch from "node-fetch";
import log from "@ajar/marker";

async function getCountryPopulation(country) { //this function returns pending promise
  try {
    const url = `https://countriesnow.space/api/v0.1/countries/population`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ country }),
    };

    const response = await fetch(url, options);
    const json_obj = await response.json();

    if (json_obj?.data?.populationCounts) {
      return json_obj.data.populationCounts.at(-1).value;
    } else {
      throw new Error(`My Error: no data for ${country}`);
    }
  } catch (err) {
    console.log(err.message);
    throw err; // i want to ensure so the user will get the error
  }
}
//kinda ping pong 

async function manual() {
  try {
  let population =await getCountryPopulation("France"); //after that pending promise becomes resolved
  console.log(`population of France is ${population}`);
  population = await getCountryPopulation("Germany"); //without await [pending Promise]
  console.log(`population of Germany is ${population}`);
  }
  catch(err) {
    console.log("Error in manual:", err.message);
  }
   
}

//manual();

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




function parallel() {
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
//parallel();

async function parallel2(){  //this one is easies

//its not going to be 1 after another we need mdn allSettles
 //const res = countries.map(async country => await getCountryPopulation(country)); //map makes me new arr  //we returning pending promise
  const pending = countries.map(coutry => getCountryPopulation(coutry));
  //print when all of the popluations are available //settled all returnes me all anyway
  const population = await Promise.allSettled(pending); //one after another will return
  population.forEach((population,index) => {
    if(population.status === 'fulfilled'){
      log.info(countries[index],`population of ${countries[index]} is ${population.value}`);
    }
    else if(population.status==='rejected'){
      log.info(countries[index],"no population found");
    }

  })

}


//parallel2();

//will check by the speed after
async function sequence2() { //in first try it wasnt sequantially
  
  // countries.forEach(async country => {
  //     try {
  //   const population = await getCountryPopulation(country);
  //   log.info(country,`population of ${country} is ${population}`)
  //   }catch(err){
  //     log.red(country , 'no population found')
      
  //   }



  //   })

  for (const country of countries){
    try {
      const population = await getCountryPopulation(country); //nimzaim be scope shel sync
      log.info(country,`population of ${country} is ${population}`)
      }catch(err){
        log.red(country , 'no population found')
        
      }
  }

}


 sequence2();
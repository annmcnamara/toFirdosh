function buildMetadata(userData) {

  result = userData;
  //console.log("result build meta\n", result);
  var PANEL = d3.select("#sample-metadata");
  PANEL.html("");

  // Use `Object.entries` to add each key and value pair to the panel
  // Hint: Inside the loop, you will need to use d3 to append new
  // tags for each key-value in the metadata.  
  // Object.entries(result).forEach(([key, value]) => {
  //   PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
  // }); 


  function sum(obj) {
    return Object.keys(obj).reduce((sum,key)=>sum+parseFloat(obj[key]||0),0);
  }
 
  
  PANEL.append("h5").text(`${result[0].State_Name}`)
  //NOTE 93 is LAST DATA POINT
  PANEL.append("h6").text(`Cases:${result[93].Act_Total_Cases}`)
  PANEL.append("h6").text(`Deaths: ${result[93].Act_Total_Deaths}`)
  PANEL.append("h6").text(`Population: ${result[93].Population}`)


  cases      = result[93].Act_Total_Cases;
  deaths     = result[93].Act_Total_Deaths;
  population = result[93].Population;

  var CASES = d3.select("#numcases");
  CASES.html("");
  CASES.append("h2").text(`${cases}`)
  CASES.append("h3").text(`${((cases/population)*100).toFixed(2)}%`)

  var DEATHS = d3.select("#numdeaths");
  DEATHS.html("");
  DEATHS.append("h2").text(`${deaths} `)
  DEATHS.append("h3").text(`${((deaths/population)*100).toFixed(2)}%`)


  var unaffected = population - (cases + deaths)
  var UNAFFECTED = d3.select("#numun");
  UNAFFECTED.html("");
  UNAFFECTED.append("h2").text(`${unaffected} `)
  UNAFFECTED.append("h3").text(`${((unaffected/population)*100).toFixed(2)}%`)




  buildPie(result[93].Act_Total_Deaths, result[93].Act_Total_Cases, result[93].Population)

  //buildGauge(result[0].data.Act_Total_Deaths * 1000000 / data.Population );
}

function buildPie(deaths, cases, pop){

  
  d = deaths/pop;
  c = cases/pop;
  u = pop - (deaths+cases)/pop;

  console.log(d + " " + c + " " + u)
  unaffected = pop - (deaths+cases);

  var pidata = [{
    values: [(deaths/pop), (cases/pop), (unaffected/pop)],
    labels: ['Deaths', 'Cases', 'Unaffected'],
    //hole: 0.6,
    text:"Cases",
    textposition: 'inside',
    name: 'Covid-19',
    hoverinfo: 'label+percent+name',
    type: 'pie', 
    marker: {
      colors: ["red", "orange", "lightgray"], 
      line: {width:.5}

    },

  }];
  
  var pilayout = {
    height: 300,
    width: 400, 
    //title_text:'Van Gogh: 5 Most Prominent Colors Shown Proportionally',
    showlegend:true, 
    margin:{l:25, r:20, t:10, b:20}, 
    legend: {
      x: 1,
      xanchor: 'left',
      y: 0.3, 
      orientation:'h'
    }
  };
  
  Plotly.newPlot('myPie', pidata, pilayout);

}



function buildCharts(sample) {
 
  // var dataUrl = `http://127.0.0.1:5000/api/v1.0/cases/${sample}`;
  var dataUrl = `/api/v1.0/cases/${sample}`;
  //console.log(dataUrl)
  var userInfo;
  d3.json(dataUrl).then((data) => {
    //console.log(data)

    userInfo = data;

    //console.log("POPULATION: ", userInfo)

    var deaths = data.map(info => info.Act_Total_Deaths);
    var cases  = data.map(info => info.Act_Total_Cases)
    //console.log(deaths)
    //console.log(deaths.length)
   
    buildMetadata(userInfo);

  });

}

function makeBarChart(dates, trace1y, trace2y, statename, dataname, divname){
  var trace1color = "black"
  var trace2color = "gray"

  var trace1 = {
    x: dates,
    y: trace1y,
    type: "bar",
    animation_frame:dates,
    name:statename + ": Actual " + dataname,
    mode: 'markers',
      opacity: 1,
      marker: {
          color: trace1color,
      }

  };
  
  var trace2 = {
    x: dates,
    y: trace2y,
    type: "bar",
    name:statename+": Predicted " + dataname, 
    animation_frame:dates,
    mode: 'markers',
      opacity: .75,
      marker: {
          color: trace2color,
      }

  };
  
  var mydata = [trace1, trace2];
  
  var mylayout = {
    title: statename+': Actual Versus Predicted ' + dataname,
    margin: { t: 30, l: 150 },
    xaxis: {
      autorange: true,
      range: ['2020-03-17', '2020-06-02'],
      rangeselector: {buttons: [
          {
            count: 7,
            label: '1W',
            step: 'day',
            stepmode: 'backward'
          },
          {
            count: 21,
            label: '3W',
            step: 'day',
            stepmode: 'backward'
          },
          {step: 'all'}
        ]},
      rangeslider: {range: ['2020-03-01', '2020-06-02']},
      type: 'date'
    },
  };
  
  var update = {
      opacity: 0.5,
      marker: {
      size: [40, 60, 80, 100],
      color: ['rgb(93, 164, 214)', 'rgb(255, 144, 14)',  'rgb(44, 160, 101)', 'rgb(255, 65, 54)']
    }
  }
  
  Plotly.newPlot(divname, mydata, mylayout);


}

function makeBubble(state){
  console.log("MAKE BUBBLE")
  // var dataUrl = `http://127.0.0.1:5000/api/v1.0/cases/${state}`;
  var dataUrl = `/api/v1.0/cases/${state}`;
  //console.log(dataUrl)
  var userInfo;
  d3.json(dataUrl).then((data) => {
    //console.log(data)

    // userInfo = data[0].Population;

    // console.log("POPULATION: ", userInfo)

    var deaths     = data.map(d => d.Act_Total_Deaths);
    var deathspred = data.map(d => d.Est_Total_Deaths);
   
    var cases     = data.map(d => d.Act_New_Cases);
    var casespred = data.map(d => d.Est_New_Cases);

    var dailydeaths     = data.map(d => d.Act_New_Deaths);
    var preddailydeaths = data.map(d => d.Estimated_New_Deaths);


    var dates  = data.map(info => info.Date);
    var states = data.map(info => info.State_Name);
    var states_abbr = data.map(info => info.State_Abbr);

    var lat = data.map(d=>d.Latitude);
    var lon = data.map(d=>d.Longitude);
    // console.log("LATITUDE: ", lat[0]);
    // console.log("LONGITUDE: ", lon[0]);

    // console.log(states_abbr)
    // console.log(deaths)
    // console.log(deaths.length)

    var ranking = data.map(d => d.Ranking_ATDPM)
    ranking = ranking[0];
    console.log("RANKING: ", ranking)


    // Build the charts
    // call function makeBarChart(dates, trace1y, trace2y, statename, dataname, divname){

    var statename = data[0].State_Name;
    makeBarChart(dates, deaths,      deathspred, statename,      "Deaths",       "bubble");
    makeBarChart(dates, cases,       casespred, statename,       "Daily Cases",  "bubble2");
    makeBarChart(dates, dailydeaths, preddailydeaths, statename, "Daily Deaths", "dailydeaths");


    var pidata = [{
      values: [19, 26, 55],
      labels: ['Deaths', 'Cases', 'Unaffected'],
      hole: 0.4,
      textposition: 'inside',
      name: 'Covid-19',
      hoverinfo: 'label+percent+name',
      type: 'pie', 
      marker: {
        colors: ["black", "grey", "lightblue"]
      },

    }];
    
    var pilayout = {
      height: 300,
      width: 400
    };
    
    //Plotly.newPlot('myPie', pidata, pilayout);

    // var barData = [
    //   {
    //     x: dates,
    //     y: deaths,
    //     text:"",
    //     type: "bar",
    //     markder: {color:'lightblue'}
    //     //orientation: "h",
    //   }
    // ];
    // var barData2 = [
    //   {
    //     x: dates,
    //     y: deathspred,
    //     text:"",
    //     type: "bar",
    //     marker: {color:"green"}
    //     //orientation: "h",
    //   }
    // ];
 
    // var barLayout = {
    //   title: data[0].State_Name + ': Total Actual Deaths',
    //   margin: { t: 30, l: 150 }
    // };

    // var barLayout2 = {
    //   title: data[0].State_Name + ': Total Predicted Deaths',
    //   margin: { t: 30, l: 150 },
    //   color:deaths,
    //   //yaxis: {range: [2,5]}
    // };
 
    // Plotly.newPlot("alldeath", barData, barLayout);
    // Plotly.newPlot("preddeath", barData2, barLayout2);



    // var barData = [
    //   {
    //     x: dates,
    //     y: cases,
    //     text:"",
    //     type: "bar",
    //     markder: {color:'lightblue'}
    //     //orientation: "h",
    //   }
    // ];
    // var barData2 = [
    //   {
    //     x: dates,
    //     y: casespred,
    //     text:"",
    //     type: "bar",
    //     marker: {color:"green"}
    //     //orientation: "h",
    //   }
    // ];
 
    // var barLayout = {
    //   title: data[0].State_Name + ': Daily Actual Cases',
    //   margin: { t: 30, l: 150 }
    // };

    // var barLayout2 = {
    //   title: data[0].State_Name + ': Daily Predicted Cases',
    //   margin: { t: 30, l: 150 },
    //   color:deaths
    // };
 
    // Plotly.newPlot("allcases", barData, barLayout);
    // Plotly.newPlot("predcases", barData2, barLayout2);



    // var barData = [
    //   {
    //     x: dates,
    //     y: dailydeaths,
    //     text:"",
    //     type: "bar",
    //     markder: {color:'lightblue'}
    //     //orientation: "h",
    //   }
    // ];
    // var barData2 = [
    //   {
    //     x: dates,
    //     y: preddailydeaths,
    //     text:"",
    //     type: "bar",
    //     marker: {color:"green"}
    //     //orientation: "h",
    //   }
    // ];
 
    // var barLayout = {
    //   title: data[0].State_Name + ': Daily Actual Deaths',
    //   margin: { t: 30, l: 150 }
    // };

    // var barLayout2 = {
    //   title: data[0].State_Name + ': Daily Predicted Deaths',
    //   margin: { t: 30, l: 150 },
    //   color:deaths
    // };
 
    // Plotly.newPlot("dailydeaths", barData, barLayout);
    // Plotly.newPlot("preddailydeaths", barData2, barLayout2);



    //MAP
    locations = [ "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY" ],

    myURL = `/api/v1.0/deaths/2020-06-02`;

    //console.log(dataUrl)
    d3.json(myURL).then((data) => {
        //console.log(statename);
        var deathsacc     = data.map(info => info.Act_Total_Deaths);

        var mapdata = [{
          type: "choroplethmapbox",
          name: "US states",
          geojson: "https://raw.githubusercontent.com/python-visualization/folium/master/examples/data/us-states.json",
          locations: locations,
         z:deathsacc,
         zmin: 25, zmax: 280,  
         colorscale:'Greys', opacity:.8,
         colorbar: {y: 0, yanchor: "bottom", title: {text: "Deaths", side: "left"}}}
       
          ];
         
         var layout = {mapbox: {style: "light", center: {lon: lon[0], lat: lat[0]}, zoom: 4},
         width: 600, height: 400, margin: {t: 0, b: 100}};
         
         var config = {mapboxAccessToken: "pk.eyJ1IjoiYW5ubWNuYW1hcmEiLCJhIjoiY2s5YTNiOXI0MDNvOTNlbDdwOXdtejRiYSJ9.W1SBSUR6jrI3YgWdhDV2sA"};
         
         Plotly.newPlot('map', mapdata, layout, config);

    });
 

    var element = document.querySelector('#guage-chart')
    d3.select("#guage-chart").html("");
     /// NEED TO GET RANKING
    //needle = Math.floor(Math.random() * 50);
    needle = ranking * 1.999999999;  //if its 50 we want it to be 100 - the gauge goes from 0 to 100
    ///console.log("NEEDLE", needle, "  ", needle/2);
    midNo = (Math.round(needle/2)).toString() //the number to display is max 50 so we scale it down /2 to get right number.
    // Properties of the gauge
    let gaugeOptions = {
     hasNeedle: true,
     needleColor: 'gray',
     needleUpdateSpeed: 1000,
     arcColors: ['rgb(44, 151, 222)', 'lightgray'],
     arcDelimiters: [needle],
     rangeLabel: ['0', '50'],
     centralLabel: midNo,
   }
   
        // Drawing and updating the chart
    // element, chartwidth )(height is always 0.5 * chartWidth), options, value
    // needle value is a number from 0 to 100.

    GaugeChart.gaugeChart(element, 300, gaugeOptions).updateNeedle(needle);

    //  var element = document.querySelector('#guage-chart')
    //  d3.select("#guage-chart").html("");
    //   /// NEED TO GET RANKING
     
    //  total_deaths = data.map( v => v.Act_New_Deaths ).reduce( (total_deaths, current) => total_deaths + current, 0 );
    //  statePopulaton = data[0].Population
    //  needle = parseInt(total_deaths * 100 * 100 / (statePopulaton * 0.1545), 10);
    //  console.log ("NEEDLE: ",needle)
    //  midNo = needle.toString()
    //  // Properties of the gauge
    //  let gaugeOptions = {
    //   hasNeedle: true,
    //   needle: needle,
    //   needleColor: 'gray',
    //   needleUpdateSpeed: 1000,
    //   arcColors: ['rgb(44, 151, 222)', 'lightgray'],
    //   arcDelimiters: [needle],
    //   rangeLabel: ['0', '100'],
    //   centralLabel: midNo,
    // }

    //  // Drawing and updating the chart
    //  // element, chartwidth )(height is always 0.5 * chartWidth), options, value
    //  // needle value is a number from 0 to 100.
    //  GaugeChart.gaugeChart(element, 300, gaugeOptions);

    buildMetadata(data);
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/api/v1.0/ids").then((data) => {
    var sampleNames = data;
    console.log("States: ", sampleNames.length)
    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    //console.log("Begin with:", firstSample)
    makeBubble(firstSample)

  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  //console.log(`change ${{newSample}}`)
  makeBubble(newSample);
  
}

// Initialize the dashboard
init();

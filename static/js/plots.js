
var wholeMap = true;

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function buildMetadata(result) {

  //NOTE 100 is LAST DATA POINT
  //I WANT TO CHANGE THIS
  state_name = result[98].State_Name;
  cases      = result[98].Act_Total_Cases;
  deaths     = result[98].Act_Total_Deaths;
  population = result[98].Population;

  buildPanels(deaths, cases, population);
  buildPie(deaths, cases, population);

}

function buildPanels(deaths, cases, population){
  //select and empty the panel div
  var PANEL = d3.select("#sample-metadata");
  PANEL.html("");
  //add the data to the panel div
  PANEL.append("h4").text(`${state_name}`);
  PANEL.append("h6").text(`Total Cases: ${numberWithCommas(cases)}`);
  PANEL.append("h6").text(`Total Deaths: ${numberWithCommas(deaths)}`);
  PANEL.append("h6").text(`Population: ${numberWithCommas(population)}`);

  //select and empty the cards 
  //populate the cards
  var DEATHS = d3.select("#numdeaths");
  DEATHS.html("");
  DEATHS.append("h2").text(`${(numberWithCommas(deaths))} `);
  DEATHS.append("h3").text(`${((deaths/population)*100).toFixed(2)}%`);

  var CASES = d3.select("#numcases");
  CASES.html("");
  CASES.append("h2").text(`${(numberWithCommas(cases))}`);
  CASES.append("h3").text(`${((cases/population)*100).toFixed(2)}%`);

  var unaffected = population - (cases + deaths);
  var UNAFFECTED = d3.select("#numun");
  UNAFFECTED.html("");
  UNAFFECTED.append("h2").text(`${(numberWithCommas(unaffected))}`);
  UNAFFECTED.append("h3").text(`${((unaffected/population)*100).toFixed(2)}%`);
}


function buildPie(deaths, cases, pop){
  d = deaths/pop;
  c = cases/pop;
  u = pop - (deaths+cases)/pop;

  //console.log(d + " " + c + " " + u)
  unaffected = pop - (deaths+cases);

  var piedata = [{
    values: [(deaths/pop), (cases/pop), (unaffected/pop)],
    labels: ['Total Deaths', 'Total Cases', 'Total Unaffected'],
    hole: 0.6,
    text:"Cases",
    textposition: 'inside',
    name: 'Covid-19',
    hoverinfo: 'label+percent+name',
    type: 'pie', 
    marker: {
      colors: ["#262626", "#6E6A6B", "#69AFFF"], 
      line: {width:.5}

    },

  }];
  
  var pielayout = {
    height: 290,
    width: 300, 
    showlegend:true, 
    legend_orientation:'h',
    margin:{l:25, r:20, t:0, b:30}, 
    legend: {
      x: -0.0,
      xanchor: 'left',
      y: -0.0, 
      yanchor: 'top',
      legend_orientation:'h'
    }, 
  };
  
  Plotly.newPlot('myPie', piedata, pielayout);
}

//GAUGE
function createGauge(ranking){
    console.log('GUAGE');
    console.log('RANKING', ranking);
     var element = document.querySelector('#guage-chart')
     d3.select("#guage-chart").html("");

     // If ranking is 50 we want it to be 100 - the gauge goes from 0 to 100 but not greater
     needle = ranking * 1.99;     
     // The number to display is max 50 so we scale it down by 1/2 to get right number.              
     midNo  = (Math.round(needle/2)).toString()
     // Properties of the gauge
     let gaugeOptions = {
      hasNeedle: true,
      needleColor: 'gray',
      needleUpdateSpeed: 1000,
      arcColors: ['#69AFFF', '#6E6A6B'],
      arcDelimiters: [needle],
      rangeLabel: ['0', '50'],
      centralLabel: midNo,
    }
    
     // Drawing and updating the chart
     // element, chartwidth )(height is always 0.5 * chartWidth), options, value
     // needle value is a number from 0 to 100 (not 100).
 
     GaugeChart.gaugeChart(element, 300, gaugeOptions).updateNeedle(needle);
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
    title: `<b>${statename}: Actual Versus Predicted ${dataname}</b>`,
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
      rangeslider: {range: ['2020-03-01', '2020-06-07']},
      type: 'date'
    },
    yaxis: { 
      title:"Number of " + dataname
    }, 
  };
  
  // var update = {
  //     opacity: 0.5,
  //     marker: {
  //     size: [40, 60, 80, 100],
  //     color: ['rgb(93, 164, 214)', 'rgb(255, 144, 14)',  'rgb(44, 160, 101)', 'rgb(255, 65, 54)']
  //   }
  // }
  
  Plotly.newPlot(divname, mydata, mylayout);
}

function buildDashboard(state){
  //Get the JSON data for the selected state
  var dataUrl = `/api/v1.0/cases/${state}`;

  d3.json(dataUrl).then((data) => {
    //console.log(data)

    var deaths     = data.map(d => d.Act_Total_Deaths);
    var deathspred = data.map(d => d.Est_Total_Deaths);
   
    var cases      = data.map(d => d.Act_New_Cases);
    var casespred  = data.map(d => d.Est_New_Cases);

    var dailydeaths     = data.map(d => d.Act_New_Deaths);
    var preddailydeaths = data.map(d => d.Estimated_New_Deaths);


    var dates  = data.map(info => info.Date);
    var states = data.map(info => info.State_Name);
    var states_abbr = data.map(info => info.State_Abbrev);

    var lat = data.map(d=>d.Latitude);
    var lon = data.map(d=>d.Longitude);

    var ranking = data.map(d => d.Ranking_ATDPM)
    ranking = ranking[0];

    //Build the Gauge
    createGauge(ranking);

    // Build the charts
    // call function makeBarChart(dates, trace1y, trace2y, statename, dataname, divname){

    var statename = data[0].State_Name;
    makeBarChart(dates, deaths,      deathspred,      statename, "Total Deaths", "bubble");
    makeBarChart(dates, cases,       casespred,       statename, "Daily Cases",  "bubble2");
    makeBarChart(dates, dailydeaths, preddailydeaths, statename, "Daily Deaths", "dailydeaths");

    //Build the Map
    myURL = `/api/v1.0/deaths/2020-06-07`;
    //console.log(dataUrl)
    d3.json(myURL).then((data) => {
        var deathsacc     = data.map(info => parseInt(info.Act_Total_Deaths));
        var locations     = data.map(d=>d.State_Abbrev);

        mapdata = [{
          type: "choroplethmapbox", 
          locations: locations, 
          z: deathsacc,
          geojson: "https://raw.githubusercontent.com/python-visualization/folium/master/examples/data/us-states.json", 
          colorscale:'Blues', 
          opacity:.8, 
          reversescale:true,
          colorbar: {
            y: 0, 
            yanchor: "bottom", 
            side:"right", 
            title: {
              text: "Total Deaths", 
              side:  "right"
            }
          }
        }];

        lat = lat[0];
        lon = lon[0];
        zoom = 4.5;

        if(wholeMap == true){  //center on whole us
          lon  = -95.7129;
          lat  = 38.0902;
          zoom = 2.5;
          wholeMap = false;
        }
     
        
        var layout = {
          mapbox: {
            style:"light", 
            center: {
              lon: lon, 
              lat: lat
            }, 
            zoom: zoom, 
            margin:{"r":0,"t":0,"l":0,"b":50}
            },
            width : 650, 
            height: 600,
            margin:{"r":0,"t":0,"l":0,"b":50}
          };

        var config = {
          mapboxAccessToken: "pk.eyJ1IjoiYW5ubWNuYW1hcmEiLCJhIjoiY2s5YTNiOXI0MDNvOTNlbDdwOXdtejRiYSJ9.W1SBSUR6jrI3YgWdhDV2sA"
        };
         
        Plotly.newPlot('map', mapdata, layout, config);

    });
 

    
    //Build the Panels & Cards
    buildMetadata(data);
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/api/v1.0/ids").then((data) => {
    var sampleNames = data;
    // console.log("States: ", sampleNames.length)
    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    //console.log("Begin with:", firstSample)
    buildDashboard(firstSample)

  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  //console.log(`change ${{newSample}}`)
  buildDashboard(newSample);
  
}

// Initialize the dashboard
init();

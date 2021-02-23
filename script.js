let covidData, stateInfo;
const chartSize = {w: 800, h: 750};
const margin = {t: 50, l: 120, b: 40, r: 45};
const svg = d3.select('.chart').append('svg');
const containerG = svg.append('g');
const dispatch = d3.dispatch('changeState');

svg.attr('width', chartSize.w)
    .attr('height', chartSize.h)

Promise.all([
    d3.csv('data/covid_data.csv'),
    d3.csv('data/state_descriptions.csv')
]).then(function(data){
    covidData = data[0].map(d => {
        d.cases = +d.cases;
        d.deaths = +d.deaths;
        d.lat = +d.lat;
        d.long = +d.long;
        return d;
    });
    stateInfo = data[1];

    addBanners();

    let scrollActions = new ScrollActions();
    scrollActions.setDispatch(dispatch);
    scrollActions.trigger();

    let bar = new barChart();
    bar.setSelection(containerG)
        .setData(covidData)
        .setMargin(margin)
        .setSize(chartSize)
        .setDispatch(dispatch)
        .setFilterState('Alabama')
        .draw();
});



//------FUNCTIONS------



//STATE BLOCK FUNCTION
function addBanners(){
    let banners = d3.select('.banners');

    stateInfo.forEach((d, i) =>{

        let covidByStates = covidData.filter(c => c.state == d.State);
        let totalCases = d3.sum(covidByStates, d=>d.cases);
        let totalDeaths = d3.sum(covidByStates, d=>d.deaths);

        let stateBanner = banners.append('div').attr('class','block');
        let text = `<h2>${d.State}</h2><p><b>Total Cases:</b>${totalCases}</p><p><b>Total Deaths:</b>${totalDeaths}<br></p><a href='${d.StateProfileReport}' target='_blank'>Detailed State Profile Report</a>`;

        stateBanner
            .append('div')
            .attr('class',`stateBanner`)
            .attr('id', `banner${i}`)
            .attr('value',`${d.State}`)
            .html(text);
    });
}
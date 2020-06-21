'use strict';

(function (d3) {

  const svg = d3.select('svg');

  const width = +svg.attr('width');
  const height = +svg.attr('height');

  const render = (data, correctedData) => {
    const title = 'Life Expecpectancy: Male vs. Female';
    var title_year = +correctedData.Year;

    const xValue = d => d.Male;
    const xAxisLabel = 'Male';
    
    const yValue = d => d.Female;
    const circleRadius = 10;
    const yAxisLabel = 'Female';
    
    const margin = { top: 60, right: 40, bottom: 88, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, xValue))
      .range([0, innerWidth])
      .nice();

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, yValue))
      .range([innerHeight, 0])
      .nice();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const xAxis = d3.axisBottom(xScale)
      .tickSize(-innerHeight)
      .tickPadding(15);
    
    const yAxis = d3.axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickPadding(10);
    
    const yAxisG = g.append('g').call(yAxis);
    yAxisG.selectAll('.domain').remove();
    
    yAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', -93)
        .attr('x', -innerHeight / 2)
        .attr('fill', 'black')
        .attr('transform', `rotate(-90)`)
        .attr('text-anchor', 'middle')
        .text(yAxisLabel);
    
    const xAxisG = g.append('g').call(xAxis)
      .attr('transform', `translate(0,${innerHeight})`);
    
    xAxisG.select('.domain').remove();
    
    xAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', 75)
        .attr('x', innerWidth / 2)
        .attr('fill', 'black')
        .text(xAxisLabel);

    var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("background", "#fff")
    .text("a simple tooltip");

    g.selectAll('circle').data(data)
      .enter().append('circle')
        .attr('cy', d => yScale(yValue(d)))
        .attr('cx', d => xScale(xValue(d)))
        .attr('r', circleRadius)
        .style("width", function(d) { return xScale(d) + "px"; })
        .text(function(d) { return d; })
        .on("mouseover", function(d) {
            console.log(d);
            console.log(d.Country);
            var text = d.Country
            tooltip.text(text);
            return tooltip.style("visibility", "visible");
         })
          .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
          .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

    g.append('text')
        .attr('class', 'title')
        .attr('y', -10)
        .text(title);

    g.append('text')
        .attr('class', 'title-year')
        .attr('x',( (innerWidth / 2) - 50) )
        .attr('y', innerHeight / 2)
        .text(title_year);
  };

  $.get("/countries")
        .then(response => {      //Promise
            var data = JSON.parse(response);
            var Years = [];
            for(var key in data[0].data.data){
                Years.push(key);
            }
            var Countries = [];
            data.forEach(d => Countries.push(d.name));
            var correctedData = [];

            Years.forEach((year, i) => {
                var yearData = []
                Countries.forEach((country, j) => {
                    var data1 = {
                        Country: country,
                        Male: data[j].data.males[year],
                        Female: data[j].data.females[year],
                        Total: data[j].data.data[year],
                        Population: data[j].data.population[year]
                    }
                    yearData.push(data1);
                });

                var obj = {
                    Year: year,
                    Data: yearData
                }
                correctedData.push(obj);

            });
            correctedData.forEach((d, i) => {
                d.year = +d.Year
                for (var j in Countries) {
                    d.population = +d.Data[j].Population;
                    d.male = +d.Data[j].Male;
                     d.female = +d.Data[j].Female;
                }
            });

//        var num = 15;
//        console.log(correctedData[num].Data);
//        console.log(correctedData);
//        console.log(correctedData[num]);
        render(correctedData[0].Data, correctedData[0]);  //TRY i = 9-15
//        debugger

    d3.select("body")
      .append("div")
        .attr("class","container")
      .append("button")
        .attr("type","button")
        .attr("class","btn btn-btn btn-info")
        .attr("id",function(d) {return 'button '; })
        .append("span")
          .attr("class","label glyphicon glyphicon-play")
          .text(function(d) { return 'Play';})
          .on('click', function(d) {
            var i = 0;
            var interval = setInterval(frame, 1000);
                function frame() {
                    if (i == Years.length) {
                        clearInterval(interval);
                    } else {
                        svg.selectAll("*").remove();
                        render(correctedData[i].Data, correctedData[i]);
                        i++;
                    }
                }
          });
    });

}(d3));
var regionsAttribs = {
    class: 'region',
    scale: 1900,
    center: [2.554071, 46.679229],
    geojson: 'data/regions-avant-redecoupage-2015.geojson',
};

var idfAttribs = {
    class : 'idf',
    scale : 13000,    
    center : [2.454071, 48.679229],
    geojson : 'data/departements-ile-de-france.geojson',
};

var regionsAttribsFr = {
    name: 'Région',
    csv: 'data/YolandBresson-Regions-fr.csv'
};

var idfAttribsFr = {
    name : 'Département',
    csv : 'data/YolandBresson-Idf-fr.csv'
};

var regionsAttribsEn = {
    name: 'Region',
    csv: 'data/YolandBresson-Regions-en.csv'
};

var idfAttribsEn = {
    name : 'Departement',
    csv : 'data/YolandBresson-Idf-en.csv'
};

var attribsFr = {
    PRICE: 'Prix',
    PRICE_M2: 'Prix au m²',
    START: 'Démarrer',
    STOP: 'Arrêter'
}

var attribsEn = {
    PRICE: 'Price',
    PRICE_M2: 'Price per m²',
    START: 'Start',
    STOP: 'Stop'
}

function build_YB_FR_IDF() {
    build_YB(Object.assign({}, idfAttribs, idfAttribsFr, attribsFr));
}

function build_YB_FR_REG() {
    build_YB(Object.assign({}, regionsAttribs, regionsAttribsFr, attribsFr));
}

function build_YB_EN_IDF() {
    build_YB(Object.assign({}, idfAttribs, idfAttribsEn, attribsEn));
}

function build_YB_EN_REG() {
    build_YB(Object.assign({}, regionsAttribs, regionsAttribsEn, attribsEn));
}

function build_YB(config) {

    var DATE_DURATION = 750, REF_DURATION = 750;
    var DATE_LABEL_CLASS = 'dateLabel', TOOLTIP_CLASS = 'tooltip';
    var START_BUTTON_CLASS = 'start';
    var DATE_EVENT = 'dateChange', REF_EVENT = 'refChange', AREA_EVENT = 'areaChange';

    var parseTime = d3.timeParse("%d/%m/%Y");
    var areaFilter = e => (e.CODE.length != 0);
    var refFilter = e => (e.CODE.length == 0);
    var dateColumnFilter = e => (parseTime(e) != null);
    var f = d3.format('.2f');

    var dispatch = d3.dispatch(DATE_EVENT, REF_EVENT, AREA_EVENT);

    // Append a DIV for the tooltip
    var tooltip = d3.select("body").append("div")
        .attr("class", TOOLTIP_CLASS)
        .style("opacity", 0);

    d3.text(config.csv, function (error, text) {
        if (error) {
            throw error;
        }
        d3.selectAll('.csvContent.' + config.class).html(text);
    });

    d3.csv(config.csv, function (rows) {
        buildGraphs(rows);
    });

    function buildGraphs(rows) {
        var selectedDateIndex = 0;

        var areaRows = rows.filter(areaFilter);
        var refRows = rows.filter(refFilter);
        var areaDates = d3.keys(areaRows[0]).filter(dateColumnFilter);

        initDateSelector()
        initStartButton();
        buildRefGraphs();

        function initDateSelector() {
            var dateSelect = d3.select('.dateSelect.' + config.class);

            dateSelect.selectAll("option")
                .data(areaDates)
                .enter().append("option")
                .text(function (d) { return d; })
                .attr('value', function (d) { return d; });
            dateSelect.property('selectedIndex', 0);
            dateSelect.on('change', function () {
                selectedDateIndex = this.selectedIndex;
                dispatch.call(DATE_EVENT, this, config.class);
            });

            dispatch.on(DATE_EVENT + '.' + config.class, function (areaClass) {
                if (areaClass == config.class) {
                    d3.selectAll('.dateSelect.' + config.class).each(function (d, i) {
                        d3.select(this).property('selectedIndex', selectedDateIndex);
                    });
                }
            });
        }

        function initStartButton() {
            var dateSelect = d3.select('.dateSelect.' + config.class);
            var dateSelectId = dateSelect.attr('id');

            var startButton = d3.selectAll('.' + START_BUTTON_CLASS + '.' + dateSelectId);
            startButton.on("click", function () {
                if (startButton.attr('value') == config.STOP) {
                    startButton.attr('value', config.START);
                }
                else {
                    startButton.attr('value', config.STOP);
                    // Increment date selection index every 750 ms
                    var interval = d3.interval(function (elapsed) {
                        var dateCount = d3.selectAll("#" + dateSelectId + ">option").size();
                        // Increment date selection index or go back to beginning
                        selectedDateIndex = (selectedDateIndex + 1) % dateCount;
                        dispatch.call(DATE_EVENT, this, config.class);

                        // Check if 'Stop' has been clicked
                        if (startButton.attr('value') == config.START) {
                            interval.stop();
                        }
                    }, DATE_DURATION);
                }
            });
        }

        function buildRefGraphs() {
            var chartsHeight = 225;

            var dateSelect = d3.select('.dateSelect.' + config.class);
            var dateSelectId = dateSelect.attr('id');

            d3.selectAll('.refSelect.' + config.class).each(function (d, i) {
                var selectedRefIndex = i;
                var refSelectId = d3.select(this).attr('id');

                initReferenceSelector.call(this);

                createChoroplethMap();
                createLineChart();

                function initReferenceSelector() {
                    d3.select(this).selectAll("option")
                        .data(refRows)
                        .enter().append("option")
                        .text(function (d) { return d.NAME; })
                        .attr('value', function (d) { return d.NAME; });
                    d3.select(this).property('selectedIndex', selectedRefIndex);
                    d3.select(this).on('change', function () {
                        selectedRefIndex = this.selectedIndex;
                        dispatch.call(REF_EVENT, this, refSelectId);
                    });
                }

                function createChoroplethMap() {
                    var refMapChart = d3.select('.map.' + config.class + '.' + refSelectId + '.' + dateSelectId);
                    var mapId = refMapChart.attr('id');

                    var mapChartWidth = 450, mapChartHeight = 386;
                    var colorScaleAxisId = mapId + 'ColorScaleAxis';

                    // Create a path object to manipulate geo data
                    var path = d3.geoPath();

                    // Define projection property
                    var projection = d3.geoConicConformal() // Lambert-93
                        .center(config.center) // Center on Paris
                        .scale(config.scale)
                        .translate([mapChartWidth / 2 - 50, mapChartHeight / 2]);

                    path.projection(projection); // Assign projection to path object

                    // Create the DIV that will contain our map
                    var svg = d3.select('#' + mapId).append("svg")
                        .attr("width", mapChartWidth)
                        .attr("height", mapChartHeight)
                        .attr("class", "Blues");

                    // Append the group that will contain our paths
                    var mapGroup = svg.append("g");

                    // Load GeoJSON data and build paths to append to group
                    d3.json(config.geojson, function (req, geojson) {
                        mapGroup.selectAll("path")
                            .data(geojson.features)
                            .enter().append("path")
                            .attr('id', function (d) { return config.class + mapId + d.properties.code; })
                            .attr("d", path);

                        // Set colors on map
                        updateMapColors();

                        // Initialize date label
                        svg.append("text")
                            .attr("class", DATE_LABEL_CLASS + ' ' + config.class)
                            .attr("text-anchor", "end")
                            .attr("y", mapChartHeight - 24)
                            .attr("x", mapChartWidth)
                            .text(getSelectedDate());

                        var colorScale = svg.append('g')
                            .attr('transform', 'translate(385, 30)');

                        colorScale.selectAll('.colorbar')
                            .data(d3.range(9))
                            .enter().append('svg:rect')
                            .attr('y', function (d) { return d * 25 + 'px'; })
                            .attr('height', '25px')
                            .attr('width', '25px')
                            .attr('x', '0px')
                            .attr("class", function (d) { return "q" + (8 - d) + "-9"; });

                        var maxPrice = getMaxPrice();
                        var legendScale = d3.scaleLinear()
                            .domain([0, maxPrice])
                            .range([9 * 25, 0]);

                        var colorScaleAxis = d3.axisRight(legendScale);
                        svg.append("g")
                            .attr("id", colorScaleAxisId)
                            .attr('transform', 'translate(410, 30)')
                            .call(colorScaleAxis)
                            .append("text")
                            .attr("fill", "#000")
                            .attr("transform", "rotate(-90)")
                            .attr("x", -9 * 12.5)
                            .attr("y", -40)
                            .attr("dy", "0.71em")
                            .attr("text-anchor", "middle")
                            .text(config.PRICE + " (" + getSelectedRef() + ")");

                        // Refresh prices on date selection
                        dispatch.on(DATE_EVENT + '.' + mapId, function (areaClass) {
                            if (areaClass == config.class) {
                                updateMapColors();
                                d3.selectAll('.' + DATE_LABEL_CLASS + '.' + areaClass).text(getSelectedDate());
                            }
                        });

                        // Refresh prices on reference selection
                        dispatch.on(REF_EVENT + '.' + mapId, function (refSelectIdEvent) {
                            if (refSelectIdEvent == refSelectId) {
                                setTimeout(function () {
                                    updateMapColors();
                                }, REF_DURATION);
                                updateColorScaleAxis();
                            }
                        });

                        // React when area selection changes
                        dispatch.on(AREA_EVENT + '.' + mapId, function (areaClass, areaCode) {
                            if (areaClass == config.class) {
                                svg.select('.area.a' + areaCode).classed('selected', true);
                                var areaRow = areaRows.filter(r => r.CODE == areaCode)[0];
                                svg.select('rect.q' + getQuantile()(getPrice(areaRow)) + '-9').classed('selected', true);
                            }
                        });

                        initTooltipCallbacks();

                        function updateColorScaleAxis() {
                            // Scale the range of the data again 
                            legendScale.domain([0, getMaxPrice()]);

                            var t = d3.transition()
                                .duration(REF_DURATION)
                                .ease(d3.easeLinear);

                            // Change the y axis
                            svg.select('#' + colorScaleAxisId)
                                .transition(t)
                                .call(colorScaleAxis);

                            svg.select("#" + colorScaleAxisId + ">text")
                                .text(config.PRICE + " (" + getSelectedRef() + ")");
                        }

                        function getQuantile() {
                            var maxPrice = getMaxPrice();

                            // Build 'quantile' - which maps an input domain to a discrete range, that is 0...max(prices) to 1...9
                            var quantile = d3.scaleQuantile()
                                .domain([0, maxPrice])
                                .range(d3.range(9));

                            return quantile;
                        }

                        function updateMapColors() {
                            var quantile = getQuantile();
                            areaRows.forEach(function (areaRow, i) {
                                d3.select('#' + config.class + mapId + areaRow.CODE)
                                    // Use 'colorbrewer.css' colors through class attribute
                                    .attr("class", "area q" + quantile(getPrice(areaRow)) + "-9 a" + areaRow.CODE);
                            });
                        }

                        function initTooltipCallbacks() {
                            areaRows.forEach(function (areaRow) {
                                d3.select('#' + config.class + mapId + areaRow.CODE)
                                    .on("mouseover", function () {
                                        tooltip.transition()
                                            .duration(200)
                                            .style("opacity", .8);
                                        tooltip.html("<b>" + config.name + " : </b>" + areaRow.NAME + "<br>"
                                            + "<b>" + config.PRICE_M2 + ": </b>" + f(getPrice(areaRow)) + " (" + getSelectedRef() + ")")
                                            .style("left", (d3.event.pageX + 30) + "px")
                                            .style("top", (d3.event.pageY - 30) + "px");
                                        mouseOverArea(config.class, areaRow.CODE);
                                    })
                                    .on("mouseout", function () {
                                        tooltip.transition()
                                            .duration(200)
                                            .style("opacity", 0);
                                        mouseOutArea(config.class, areaRow.CODE);
                                    });
                            });
                        }
                    });
                }

                function createLineChart() {
                    var refLineChart = d3.select('.chart.' + config.class + '.' + refSelectId + '.' + dateSelectId);
                    var chartId = refLineChart.attr('id');

                    var data = areaRows.map(function (row) {
                        var entries = d3.entries(row);
                        return { 'name': row.NAME, 'code': row.CODE, 'values': entries.filter(e => dateColumnFilter(e.key)) };
                    });

                    // Set the dimensions of the chart
                    var margin = { top: 30, right: 20, bottom: 30, left: 50 },
                        lineChartWidth = 450 - margin.left - margin.right;

                    // Create the svg that will contain our chart
                    var lineChart = d3.select('#' + chartId);
                    var svg = lineChart.append("svg")
                        .attr("width", lineChartWidth + margin.left + margin.right)
                        .attr("height", chartsHeight + margin.top + margin.bottom);
                    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    // Set the ranges
                    var x = d3.scaleTime().rangeRound([0, lineChartWidth]);
                    var y = d3.scaleLinear().rangeRound([chartsHeight, 0]);
                    var z = d3.scaleOrdinal(d3.schemeCategory20);

                    // Scale the range of the data
                    x.domain(d3.extent(data[0].values, function (d) { return parseTime(d.key); }));
                    y.domain([0, getMaxPrice()]);
                    z.domain(data.map(function (d) { return d.name; }));

                    // Define the line            
                    var line = d3.line()
                        .x(function (d) { return x(parseTime(d.key)); })
                        .y(function (d) { return y(+d.value / getRefValue(d.key)); });

                    // Add the X Axis
                    g.append("g")
                        .attr("transform", "translate(0," + chartsHeight + ")")
                        .call(d3.axisBottom(x));

                    // Add the Y Axis
                    var yAxis = d3.axisLeft(y);
                    g.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                        .append("text")
                        .attr("fill", "#000")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 6)
                        .attr("dy", "0.71em")
                        .attr("text-anchor", "end")
                        .text(config.PRICE + " (" + getSelectedRef() + ")");

                    // Add the 'line' for each area.
                    g.selectAll(".gLine")
                        .data(data)
                        .enter().append("g")
                        .attr("class", "gLine")
                        .append("path")
                        .attr("class", function (d) { return "line a" + d.code; })
                        .attr("d", function (d) { return line(d.values); })
                        .style("stroke", function (d) { return z(d.name); })
                        .on("mouseover", function (d) { mouseOverArea(config.class, d.code); })
                        .on("mouseout", function (d) { mouseOutArea(config.class, d.code); });

                    g.append('line')
                        .attr("class", "xLocLine")
                        .attr("x1", 0)
                        .attr("y1", 0)
                        .attr("x2", 0)
                        .attr("y2", chartsHeight)
                        .attr("transform", "translate(" + x(parseTime(getSelectedDate())) + ",0)");

                    var xDates = areaDates.map(d => x(parseTime(d)));
                    g.append('line')
                        .attr("class", "xDragLine")
                        .attr("x1", 0)
                        .attr("y1", 0)
                        .attr("x2", 0)
                        .attr("y2", chartsHeight)
                        .attr("transform", "translate(" + x(parseTime(getSelectedDate())) + ",0)")
                        .attr("opacity", 0)
                        .call(d3.drag()
                            .on("start", function (d) {
                                var lineChart = d3.selectAll(".box.chart." + config.class);
                                lineChart.select('.xDragLine').classed("dragged", true);
                                lineChart.select('.xLocLine').style("display", "none");
                            })
                            .on("drag", function (d) {
                                var lineChart = d3.selectAll(".box.chart." + config.class);
                                lineChart.select('.xDragLine').attr("transform", "translate(" + d3.event.x + ",0)");
                                var newDateIndex = d3.bisect(xDates, d3.event.x);
                                if (newDateIndex == areaDates.length) {
                                    newDateIndex = areaDates.length - 1;
                                }
                                else if (newDateIndex > 0 && (d3.event.x - xDates[newDateIndex - 1]) < (xDates[newDateIndex] - d3.event.x)) {
                                    newDateIndex--;
                                }
                                if (selectedDateIndex != newDateIndex) {
                                    selectedDateIndex = newDateIndex;
                                    dispatch.call(DATE_EVENT, this, config.class);
                                }
                            })
                            .on("end", function (d) {
                                var lineChart = d3.selectAll(".box.chart." + config.class);
                                lineChart.select('.xDragLine').classed("dragged", false);
                                lineChart.select('.xLocLine').style("display", null);
                                dispatch.call(DATE_EVENT, this, config.class);
                            }));

                    g.append('line')
                        .attr("class", "yLocLine")
                        .attr("x1", 0)
                        .attr("y1", 0)
                        .attr("x2", lineChartWidth)
                        .attr("y2", 0)
                        .style("display", "none");

                    // Add the legend
                    var legend = d3.select('#' + chartId)
                        .append("div")
                        .attr("class", "legend")
                        .selectAll(".legendItem")
                        .data(data);

                    legend.enter().append("div")
                        .attr("class", function (d) { return "legendItem a" + d.code; })
                        .html(function (d) { return d.name; })
                        .style("color", function (d) { return z(d.name); })
                        .on("mouseover", function (d) { mouseOverArea(config.class, d.code); })
                        .on("mouseout", function (d) { mouseOutArea(config.class, d.code); });

                    // Refresh lines location
                    dispatch.on(DATE_EVENT + '.' + chartId, function (areaClass) {
                        if (areaClass == config.class) {
                            var xLoc = x(parseTime(getSelectedDate()));
                            svg.selectAll('.xLocLine').attr("transform", "translate(" + xLoc + ",0)");
                            svg.selectAll('.xDragLine').filter(d => !d3.select(this).classed("dragged")).attr("transform", "translate(" + xLoc + ",0)");
                        }
                    });

                    // Refresh chart on reference selection
                    dispatch.on(REF_EVENT + '.' + chartId, function (refSelectIdEvent) {
                        if (refSelectIdEvent == refSelectId) {
                            updateChart();
                        }
                    });

                    // React when area selection changes
                    dispatch.on(AREA_EVENT + '.' + chartId, function (areaClass, areaCode) {
                        if (areaClass == config.class) {
                            lineChart.selectAll('.line').classed("faded", true);
                            lineChart.selectAll('.line.a' + areaCode).classed("faded", false);

                            lineChart.selectAll('.legendItem').classed("faded", true);
                            lineChart.selectAll('.legendItem.a' + areaCode).classed("faded", false);

                            lineChart.selectAll('.yLocLine')
                                .attr("transform", "translate(0," + y(getPrice(areaRows.filter(r => (r.CODE == areaCode))[0])) + ")")
                                .style("display", null);
                        }
                    });

                    function updateChart() {
                        // Scale the range of the data again 
                        y.domain([0, getMaxPrice()]);

                        var t = d3.transition()
                            .duration(REF_DURATION)
                            .ease(d3.easeLinear);

                        // Change the lines
                        svg.selectAll(".line")
                            .transition(t)
                            .attr("d", function (d) { return line(d.values); });

                        // Change the y axis
                        svg.select(".y.axis")
                            .transition(t)
                            .call(yAxis);
                        svg.select(".y.axis>text")
                            .text(config.PRICE + " (" + getSelectedRef() + ")");
                    }
                }

                function getSelectedDate() { return areaDates[selectedDateIndex]; }

                function getSelectedRef() { return refRows[selectedRefIndex].NAME; }

                function getRefValue(date) { return refRows.find(e => e.NAME == getSelectedRef())[date]; }

                function getPrice(areaRow) {
                    var selectedDate = getSelectedDate();
                    var refValue = getRefValue(selectedDate);
                    return +areaRow[selectedDate] / refValue;
                }

                function getMaxPrice() {
                    var maxPrice = d3.max(areaRows, function (row) {
                        var priceEntries = d3.entries(row).filter(e => dateColumnFilter(e.key));
                        return d3.max(priceEntries, function (e) {
                            var refValue = getRefValue(e.key);
                            return e.value / refValue;
                        });
                    });

                    return maxPrice;
                }

                function mouseOverArea(areaClass, areaCode) {
                    dispatch.call(AREA_EVENT, this, areaClass, areaCode);
                }

                function mouseOutArea(areaClass, areaCode) {
                    var mapChart = d3.selectAll(".box.map." + areaClass);
                    mapChart.select('.area.a' + areaCode).classed('selected', false);
                    mapChart.selectAll('rect').classed('selected', false);

                    var lineChart = d3.selectAll(".box.chart." + areaClass);

                    lineChart.selectAll('.line').classed('faded', false);
                    lineChart.selectAll('.legendItem').classed('faded', false);
                    lineChart.selectAll('.yLocLine').style("display", "none");
                }
            });
        }
    }
}

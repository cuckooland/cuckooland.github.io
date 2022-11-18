// On utilise une IEF pour ne pas polluer l'espace global(function () {
    var linkOpacity = 0.5, tooltipOpacity = 0.9,
        totalWidth = 750,
        totalHeight = 400,
        margin = {top: 30, right: 120, bottom: 30, left: 70},
        width = totalWidth - margin.left - margin.right,
        height = totalHeight - margin.top - margin.bottom,
        tooltipDuration = 200, 
        phaseDuration = 1000, isTransitioning = false;
    
    var fr_FR = {
      "decimal": ",",
      "thousands": " ",
      "grouping": [3],
      "currency": ["F", ""],
      "dateTime": "%a %b %e %X %Y",
      "date": "%d/%m/%Y",
      "time": "%H:%M:%S",
      "periods": ["AM", "PM"],
      "days": ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
      "shortDays": ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
      "months": ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
      "shortMonths": ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"]
    };
    
    var frLocale = d3.locale(fr_FR);
    
    //var formatNumber = d3.format(",.0f"),
    var formatNumber = frLocale.numberFormat(",.0f"),
        format = function(d) { return formatNumber(d) + " F"; },
        unformat = function(d) { return d.replace(/\s/g, '').replace('F', ''); },
        color = d3.scale.category10();
    
    var money1 = 150,
        money2 = 300,
        money3 = 450;
    var c = 0.1,
        taxRate = 0.1,
        N = 3;
    var epsilon = 0.001;
    
    function ac2nvRemoval(money) {
      return 99 * money;
    }
    
    function nv2acCreation(money) {
      return 99 * money;
    }
    
    function monetarySupply() {
      return money1 + money2 + money3;
    }
    
    function du() {
      return monetarySupply() * c / N;
    }
    
    function rdb() {
      return monetarySupply() * taxRate / N;
    }
    
    function toConstantSupply(money) {
      return (money + du()) / (1 + c);
    }
    
    function constantSupplyRem(money) {
      return c * (money + du()) / (1 + c);
    }
    
    function taxAmount(money) {
      return money * taxRate;
    }
    
    function applyTax(money) {
      return money * (1 -taxRate);
    }
    
    var trI1I2 = 100, trI1I3 = epsilon;
    var trI2I3 = 100, trI2I1 = 50;
    var trI3I2 = 50, trI3I1 = 50;
    
    function noExch1ChartNodes() {
        return [
            {"name":"I1-a1", "desc":"Amina - Année 1", "commentId":"noExch1_Ia1"},
            {"name":"I2-a1", "desc":"Justine - Année 1", "commentId":"noExch1_Ia1"},
            {"name":"I3-a1", "desc":"Liliane - Année 1", "commentId":"noExch1_Ia1"},
            {"name":"I1-a2", "desc":"Amina - Année 2", "commentId":"noExch1_Ia2"},
            {"name":"I2-a2", "desc":"Justine - Année 2", "commentId":"noExch1_Ia2"},
            {"name":"I3-a2", "desc":"Liliane - Année 2", "commentId":"noExch1_Ia2"}
        ];
    }
    
    function noExch1ChartLinks() {
        return [
            {"source":"I1-a1","target":"I1-a2","value":money1 - trI1I2 - trI1I3, "commentId":"solde1Comment"},
            {"source":"I1-a1","target":"I2-a2","value":trI1I2, "commentId":"exch1Comment"},
            {"source":"I1-a1","target":"I3-a2","value":trI1I3, "commentId":"exch1Comment"},
            {"source":"I2-a1","target":"I2-a2","value":money2 - trI2I3 - trI2I1, "commentId":"solde1Comment"},
            {"source":"I2-a1","target":"I3-a2","value":trI2I3, "commentId":"exch1Comment"},
            {"source":"I2-a1","target":"I1-a2","value":trI2I1, "commentId":"exch1Comment"},
            {"source":"I3-a1","target":"I3-a2","value":money3 - trI3I2 - trI3I1, "commentId":"solde1Comment"},
            {"source":"I3-a1","target":"I2-a2","value":trI3I2, "commentId":"exch1Comment"},
            {"source":"I3-a1","target":"I1-a2","value":trI3I1, "commentId":"exch1Comment"},
        ];
    }
    
    function noExch2ChartNodes() {
        return [
            {"name":"I1-a1", "desc":"Amina - Année 1", "commentId":"noExch2_Ia1"},
            {"name":"I2-a1", "desc":"Justine - Année 1", "commentId":"noExch2_Ia1"},
            {"name":"I3-a1", "desc":"Liliane - Année 1", "commentId":"noExch2_Ia1"},
            {"name":"I1-a2", "desc":"Amina - Année 2", "commentId":"noExch2_Ia2"},
            {"name":"I2-a2", "desc":"Justine - Année 2", "commentId":"noExch2_Ia2"},
            {"name":"I3-a2", "desc":"Liliane - Année 2", "commentId":"noExch2_Ia2"}
        ];
    }
    
    function noExch2ChartLinks() {
        return [
            {"source":"I1-a1","target":"I1-a2","value":money1, "commentId":"noExch2Comment"},
            {"source":"I2-a1","target":"I2-a2","value":money2, "commentId":"noExch2Comment"},
            {"source":"I3-a1","target":"I3-a2","value":money3, "commentId":"noExch2Comment"},
        ];
    }
    
    function nvFrancChartNodes() {
        return [
            {"name":"I1-a1", "desc":"Amina - Année 1", "commentId":"nvFranc_I1a1"},
            {"name":"I2-a1", "desc":"Justine - Année 1", "commentId":"nvFranc_I2a1"},
            {"name":"I3-a1", "desc":"Liliane - Année 1", "commentId":"nvFranc_I3a1"},
            {"name":"I1-a2", "desc":"Amina - Année 2", "commentId":"nvFranc_I1a2"},
            {"name":"I2-a2", "desc":"Justine - Année 2", "commentId":"nvFranc_I2a2"},
            {"name":"I3-a2", "desc":"Liliane - Année 2", "commentId":"nvFranc_I3a2"},
            {"name":"Di-1", "desc":"Destruction pour changement de référence", "commentId":"nvFranc_Di1"}
        ];
    }
    
    function nvFrancChartLinks() {
        return [
            {"source":"I1-a1","target":"I1-a2","value":money1, "commentId":"nvFrancLinkComment"},
            {"source":"I2-a1","target":"I2-a2","value":money2, "commentId":"nvFrancLinkComment"},
            {"source":"I3-a1","target":"I3-a2","value":money3, "commentId":"nvFrancLinkComment"},
            {"source":"I1-a1","target":"Di-1","value":ac2nvRemoval(money1), "commentId":"ac2nvRemoval"},
            {"source":"I2-a1","target":"Di-1","value":ac2nvRemoval(money2), "commentId":"ac2nvRemoval"},
            {"source":"I3-a1","target":"Di-1","value":ac2nvRemoval(money3), "commentId":"ac2nvRemoval"},
            {"source":"Di-1","target":"I1-a2","value":epsilon, "commentId":"epsilon"},
            {"source":"Di-1","target":"I2-a2","value":epsilon, "commentId":"epsilon"},
            {"source":"Di-1","target":"I3-a2","value":epsilon, "commentId":"epsilon"}
        ];
    }
    
    function acFrancChartNodes() {
        return [
            {"name":"I1-a1", "desc":"Amina - Année 1", "commentId":"acFranc_I1a1"},
            {"name":"I2-a1", "desc":"Justine - Année 1", "commentId":"acFranc_I2a1"},
            {"name":"I3-a1", "desc":"Liliane - Année 1", "commentId":"acFranc_I3a1"},
            {"name":"I1-a2", "desc":"Amina - Année 2", "commentId":"acFranc_I1a2"},
            {"name":"I2-a2", "desc":"Justine - Année 2", "commentId":"acFranc_I2a2"},
            {"name":"I3-a2", "desc":"Liliane - Année 2", "commentId":"acFranc_I3a2"},
            {"name":"Cr-1", "desc":"Création monétaire", "commentId":"acFranc_Cr1"}
        ];
    }
    
    function acFrancChartLinks() {
        return [
            {"source":"I1-a1","target":"I1-a2","value":money1, "commentId":"acFrancLinkComment"},
            {"source":"I2-a1","target":"I2-a2","value":money2, "commentId":"acFrancLinkComment"},
            {"source":"I3-a1","target":"I3-a2","value":money3, "commentId":"acFrancLinkComment"},
            {"source":"I1-a1","target":"Cr-1","value":epsilon, "commentId":"epsilon"},
            {"source":"I2-a1","target":"Cr-1","value":epsilon, "commentId":"epsilon"},
            {"source":"I3-a1","target":"Cr-1","value":epsilon, "commentId":"epsilon"},
            {"source":"Cr-1","target":"I1-a2","value":nv2acCreation(money1), "commentId":"nv2acCreation"},
            {"source":"Cr-1","target":"I2-a2","value":nv2acCreation(money2), "commentId":"nv2acCreation"},
            {"source":"Cr-1","target":"I3-a2","value":nv2acCreation(money3), "commentId":"nv2acCreation"}
            ];
    }
    
    function duQuantChartNodes() {
        return [
            {"name":"I1-a1", "desc":"Amina - Année 1", "commentId":"duQuant_I1a1"},
            {"name":"I2-a1", "desc":"Justine - Année 1", "commentId":"duQuant_I2a1"},
            {"name":"I3-a1", "desc":"Liliane - Année 1", "commentId":"duQuant_I3a1"},
            {"name":"I1-a2", "desc":"Amina - Année 2", "commentId":"duQuant_I1a2"},
            {"name":"I2-a2", "desc":"Justine - Année 2", "commentId":"duQuant_I2a2"},
            {"name":"I3-a2", "desc":"Liliane - Année 2", "commentId":"duQuant_I3a2"},
            {"name":"Cr-1", "desc":"Co-création monétaire", "commentId":"duQuant_Cr1"}
        ];
    }
    
    function duQuantChartLinks() {
        return [
            {"source":"I1-a1","target":"I1-a2","value":money1, "commentId":"duQuantLinkComment"},
            {"source":"I2-a1","target":"I2-a2","value":money2, "commentId":"duQuantLinkComment"},
            {"source":"I3-a1","target":"I3-a2","value":money3, "commentId":"duQuantLinkComment"},
            {"source":"I1-a1","target":"Cr-1","value":epsilon, "commentId":"epsilon"},
            {"source":"I2-a1","target":"Cr-1","value":epsilon, "commentId":"epsilon"},
            {"source":"I3-a1","target":"Cr-1","value":epsilon, "commentId":"epsilon"},
            {"source":"Cr-1","target":"I1-a2","value":du(), "commentId":"du"},
            {"source":"Cr-1","target":"I2-a2","value":du(), "commentId":"du"},
            {"source":"Cr-1","target":"I3-a2","value":du(), "commentId":"du"}
        ];
    }
    
    function duRelChartNodes() {
        return [
            {"name":"I1-a1", "desc":"Amina - Année 1", "commentId":"duRel_I1a1"},
            {"name":"I2-a1", "desc":"Justine - Année 1", "commentId":"duRel_I2a1"},
            {"name":"I3-a1", "desc":"Liliane - Année 1", "commentId":"duRel_I3a1"},
            {"name":"I1-a2", "desc":"Amina - Année 2", "commentId":"duRel_I1a2"},
            {"name":"I2-a2", "desc":"Justine - Année 2", "commentId":"duRel_I2a2"},
            {"name":"I3-a2", "desc":"Liliane - Année 2", "commentId":"duRel_I3a2"},
            {"name":"I1-a2-mc", "desc":"Amina - Année 2 - En Franc de l'année 1", "commentId":"duRel_I1a2mc"},
            {"name":"I2-a2-mc", "desc":"Justine - Année 2 - En Franc de l'année 1", "commentId":"duRel_I2a2mc"},
            {"name":"I3-a2-mc", "desc":"Liliane - Année 2 - En Franc de l'année 1", "commentId":"duRel_I3a2mc"},
            {"name":"Cr-1", "desc":"Co-création monétaire", "commentId":"duRel_Cr1"},
            {"name":"Di-1", "desc":"Résidu quand changement de référence", "commentId":"duRel_Di1"}
        ];
    }
    
    function duRelChartLinks() {
        return [
            {"source":"I1-a1","target":"I1-a2","value":money1, "commentId":"duQuantLinkComment"},
            {"source":"I2-a1","target":"I2-a2","value":money2, "commentId":"duQuantLinkComment"},
            {"source":"I3-a1","target":"I3-a2","value":money3, "commentId":"duQuantLinkComment"},
            {"source":"I1-a1","target":"Cr-1","value":epsilon, "commentId":"epsilon"},
            {"source":"I2-a1","target":"Cr-1","value":epsilon, "commentId":"epsilon"},
            {"source":"I3-a1","target":"Cr-1","value":epsilon, "commentId":"epsilon"},
            {"source":"Cr-1","target":"I1-a2","value":du(), "commentId":"du"},
            {"source":"Cr-1","target":"I2-a2","value":du(), "commentId":"du"},
            {"source":"Cr-1","target":"I3-a2","value":du(), "commentId":"du"},
            {"source":"I1-a2","target":"I1-a2-mc","value":toConstantSupply(money1), "commentId":"toConstantSupply"},
            {"source":"I2-a2","target":"I2-a2-mc","value":toConstantSupply(money2), "commentId":"toConstantSupply"},
            {"source":"I3-a2","target":"I3-a2-mc","value":toConstantSupply(money3), "commentId":"toConstantSupply"},
            {"source":"I1-a2","target":"Di-1","value":constantSupplyRem(money1), "commentId":"constantSupplyRem"},
            {"source":"I2-a2","target":"Di-1","value":constantSupplyRem(money2), "commentId":"constantSupplyRem"},
            {"source":"I3-a2","target":"Di-1","value":constantSupplyRem(money3), "commentId":"constantSupplyRem"},
            {"source":"Di-1","target":"I1-a2-mc","value":epsilon, "commentId":"epsilon"},
            {"source":"Di-1","target":"I2-a2-mc","value":epsilon, "commentId":"epsilon"},
            {"source":"Di-1","target":"I3-a2-mc","value":epsilon, "commentId":"epsilon"},
        ];
    }
    
    function rdbChartNodes() {
        return [
            {"name":"I1-a1", "desc":"Amina - Année 1", "commentId":"rdb_I1a1"},
            {"name":"I2-a1", "desc":"Justine - Année 1", "commentId":"rdb_I2a1"},
            {"name":"I3-a1", "desc":"Liliane - Année 1", "commentId":"rdb_I3a1"},
            {"name":"I1-a2-mc", "desc":"Amina - Année 2", "commentId":"rdb_I1a2mc"},
            {"name":"I2-a2-mc","desc":"Justine - Année 2", "commentId":"rdb_I2a2mc"},
            {"name":"I3-a2-mc","desc":"Liliane - Année 2", "commentId":"rdb_I3a2mc"},
            {"name":"Ca-1", "desc":"Caisse allocation RdB", "commentId":"rdb_Ca1"}
        ];
    }
    
    function rdbChartLinks() {
        return [
            {"source":"I1-a1","target":"I1-a2-mc","value":applyTax(money1), "commentId":"applyTax"},
            {"source":"I2-a1","target":"I2-a2-mc","value":applyTax(money2), "commentId":"applyTax"},
            {"source":"I3-a1","target":"I3-a2-mc","value":applyTax(money3), "commentId":"applyTax"},
            {"source":"I1-a1","target":"Ca-1","value":taxAmount(money1), "commentId":"taxAmount"},
            {"source":"I2-a1","target":"Ca-1","value":taxAmount(money2), "commentId":"taxAmount"},
            {"source":"I3-a1","target":"Ca-1","value":taxAmount(money3), "commentId":"taxAmount"},
            {"source":"Ca-1","target":"I1-a2-mc","value":rdb(), "commentId":"rdbLinkComment"},
            {"source":"Ca-1","target":"I2-a2-mc","value":rdb(), "commentId":"rdbLinkComment"},
            {"source":"Ca-1","target":"I3-a2-mc","value":rdb(), "commentId":"rdbLinkComment"}
        ];
    }
    
    var charts = 
        [{id : "#noExch1", nodes : noExch1ChartNodes(), links : noExch1ChartLinks(), label : "Echanges équilibrés"},
         {id : "#noExch2", nodes : noExch2ChartNodes(), links : noExch2ChartLinks(), label : "Echanges équilibrés (version simplifiée)"},
         {id : "#nvFranc", nodes : nvFrancChartNodes(), links : nvFrancChartLinks(), label : "Passage de l’ancien au nouveau franc"},
         {id : "#acFranc", nodes : acFrancChartNodes(), links : acFrancChartLinks(), label : "Retour à l’ancien franc"},
         {id : "#duQuant", nodes : duQuantChartNodes(), links : duQuantChartLinks(), label : "Dividende Universel via une création monétaire"},
         {id : "#duRel", nodes : duRelChartNodes(), links : duRelChartLinks(), label : "Dividende Universel via une création monétaire (vu en masse constante)"},
         {id : "#rdb", nodes : rdbChartNodes(), links : rdbChartLinks(), label : "Revenu de Base via une taxe"}];
         
    function adaptLinks(nodes, links) {
    	var nodeMap = {};
        nodes.forEach(
            function(x) { nodeMap[x.name] = x; 
        });
        links = links.map(function(x) {
            return {
                source: nodeMap[x.source],
                target: nodeMap[x.target],
                value: x.value,
    			commentId: x.commentId
            };
        });
        return links;
    }
    
    function disableUserInterractions(time) {
        isTransitioning = true;
        setTimeout(function() {
            isTransitioning = false;
        }, time);
    }

    function showLinkTooltip(link, d) {
        if (isTransitioning) {
            return;
        }
    	d3.selectAll(".tooltip")
    		.style("opacity", 0);
    
        d3.selectAll("span.value").text(format(d.value));
        d3.selectAll("span.sourceDesc").text(d.source.desc.replace(/ .*/, ""));
        d3.selectAll("span.sourceValue").text(format(d.source.value));
        d3.selectAll("span.targetDesc").text(d.target.desc.replace(/ .*/, ""));
        d3.selectAll("span.targetValue").text(format(d.target.value));
    	
        var tooltip = d3.select(".tooltip#" + d.commentId);
        
        var bbox = link.getBBox();
        var matrix = link.getScreenCTM().translate(bbox.x,bbox.y);
        
        tooltip.style("left", (window.pageXOffset + matrix.e) + "px")
            .style("top", (d3.event.pageY) + "px");
        
        tooltip.transition()
            .duration(tooltipDuration)
            .style("opacity", tooltipOpacity);
    }
    
    function showNodeTooltip(node, d) {
        if (isTransitioning) {
            return;
        }
    	d3.selectAll(".tooltip")
    		.style("opacity", 0);
    
        d3.selectAll("span.value").text(format(d.value));
        d3.selectAll("span.nodeDesc").text(d.desc.replace(/ .*/, ""));
    	
        var tooltip = d3.select(".tooltip#" + d.commentId);
        
        var matrix = node.getScreenCTM().translate(node.getAttribute("x"),node.getAttribute("y"));
        var left = window.pageXOffset + matrix.e;
        if (node.__data__.x > width / 2) {
            var tooltipBB = tooltip.node().getBoundingClientRect();
            left = left - tooltipBB.width;
        }
        tooltip.style("left", left + "px")
            .style("top", (d3.event.pageY) + "px");
        
        tooltip.transition()
            .duration(tooltipDuration)
            .style("opacity", tooltipOpacity);
    }
    
    function hideTooltip(d) {
        if (isTransitioning) {
            return;
        }
        var tooltip = d3.select(".tooltip#" + d.commentId);
        tooltip.transition()        
            .duration(500)      
            .style("opacity", 0);  
    }

    function changeChart(chartLabel) {
        charts.forEach(function(chartDef) {
            if (chartLabel === chartDef.label) {
                updateChart(chartDef);
            }
        });
    };
    
    function updateChart(chartDef) {
    	d3.selectAll(".tooltip")
    		.style("opacity", 0);

        selectedChart = chartDef;
        var newNodes = chartDef.nodes;
        var newLinks = adaptLinks(newNodes, chartDef.links);
            
        var sankey = d3.sankey()
            .nodeWidth(30)
            .nodePadding(10)
            .size([width, height]);
    
        var path = sankey.link();
            
        sankey
            .nodes(newNodes)
            .links(newLinks)
            .layout(32);
        sankey.relayout();
            
        var link = svg.selectAll(".link").data(newLinks, getLinkKey);
        var linkExit = link.exit();
            
        var node = svg.selectAll(".node").data(newNodes, getNodeKey);
        var nodeExit = node.exit();
    
        var xUpTitle = svg.selectAll(".xUpTitle").data(newNodes.filter(function(d) { return d.name.startsWith("I1"); }));
        var xUpTitleExit = xUpTitle.exit();
            
        var xDwnTitle = svg.selectAll(".xDwnTitle").data(newNodes.filter(function(d) { return d.name.startsWith("I1"); }));
        var xDwnTitleExit = xDwnTitle.exit();
        
        var updating = !(link.empty() && node.empty() && xUpTitle.empty() && xDwnTitle.empty());
        var exiting = !(linkExit.empty() && nodeExit.empty() && xUpTitleExit.empty() && xDwnTitleExit.empty());
        
        var updDuration = phaseDuration;
        var enterDuration = phaseDuration;
        var exitDuration = exiting ? phaseDuration : 0;
            
        var updDelay = exitDuration;
        var enterDelay = updDelay + updDuration;
        if (!exiting) {
            enterDelay -= updDelay;
            updDelay -= exitDuration;
        }
        if (!updating) {
            enterDelay -= updDuration;
        }
        disableUserInterractions(enterDuration + enterDelay);
        
        link.transition()
            .duration(updDuration)
            .delay(updDelay)
            .attr("d", path)
            .style("stroke-width", linkWidth)
            .style("visibility", linkVisibility)
            
        var linkEnter = link.enter().append("path")
            .attr("class", "link")
            .attr("d", path)
            .style("stroke-width", linkWidth)
            .sort(function(a, b) { return b.dy - a.dy; })
            .style("visibility", linkVisibility)
            .attr("stroke", function(d) { return d.source.color = color(d.source.desc.replace(/ .*/, "")); })
            .attr("opacity", 0)
//            .on("click", function(d) { showLinkTooltip(this, d); });
            .on("mouseover", function(d) { showLinkTooltip(this, d); })
            .on("mouseout", function(d) { hideTooltip(d); });
    
        linkEnter.transition()
            .duration(enterDuration)
            .delay(enterDelay)
            .style("opacity", linkOpacity);
    
        linkExit.transition()
            .duration(exitDuration)
            .style('opacity', 0)
            .remove();
        
        node.transition()
            .duration(updDuration)
            .delay(updDelay)
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    
        svg.selectAll(".node>rect")
            .data(newNodes, getNodeKey)
            .transition()
            .duration(updDuration)
            .delay(updDelay)
            .attr("height", function(d) { return d.dy; });
    
        svg.selectAll(".node>.desc")
            .data(newNodes, getNodeKey)
            .transition()
            .duration(updDuration)
            .delay(updDelay)
    //        .delay(updDuration + updDelay)
            .attr("x", 6 + sankey.nodeWidth())
            .attr("y", function(d) { return d.dy / 2; })
            .attr("text-anchor", "start")
            .text(function(d) { return d.desc.replace(/ .*/, ""); })
            .styleTween("font-size", function(d) {
                var t0Size = this.style.getPropertyValue("font-size");
                return d3.interpolate(
                    t0Size,
                    computeFontSize(d.dy) + "%"
                );
            });
          
        svg.selectAll(".node>.value")
            .data(newNodes, getNodeKey)
            .transition()
            .duration(updDuration)
            .delay(updDelay)
    //        .delay(updDuration + updDelay)
            .attr("x", -6)
            .attr("y", function(d) { return d.dy / 2; })
            .attr("text-anchor", "end")
            .styleTween("font-size", function(d) {
                var t0Size = this.style.getPropertyValue("font-size");
                return d3.interpolate(
                    t0Size,
                    computeFontSize(d.dy) + "%"
                );
            })
            .tween("text", function(d) {
                var t0Content = unformat(this.textContent);
                var interpol = d3.interpolate(t0Content, d.value);
                return function(value) {
                    this.textContent = format(interpol(value));
                };
            });
          
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
          .call(d3.behavior.drag()
            .origin(function(d) { return d; })
            .on("dragstart", function() {
                if (!isTransitioning) {
                    this.parentNode.appendChild(this);
                }
            })
            .on("drag", function(d) {
                if (!isTransitioning) {
                    d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
                    sankey.relayout();
                    svg.selectAll(".link").attr("d", path);
                }
            }))
            .style("opacity", 0);
            
        nodeEnter.append("rect")
            .attr("height", function(d) { 
            return d.dy; })
            .attr("width", sankey.nodeWidth())
            .style("fill", function(d) { return d.color = color(d.desc.replace(/ .*/, "")); })
            .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
//            .on("click", function(d) { showNodeTooltip(this, d); });
            .on("mouseenter", function(d) { showNodeTooltip(this, d); })
            .on("mouseout", function(d) { hideTooltip(d); });
            
        nodeEnter.transition()
            .duration(enterDuration)
            .delay(enterDelay)
            .style("opacity", 1);
    
        nodeEnter.append("text")
            .attr("class", "desc")
            .attr("x", 6 + sankey.nodeWidth())
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .attr("transform", null)
            .text(function(d) { return d.desc.replace(/ .*/, ""); })
            .style("font-size",
                function(d) {
                    return computeFontSize(d.dy) + "%";
                })
          
        nodeEnter.append("text")
            .attr("class", "value")
            .attr("x", -6)
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text(function(d) { return format(d.value); })
            .style("font-size",
                function(d) {
                    return computeFontSize(d.dy) + "%";
                })
          
        nodeExit.transition()
            .duration(exitDuration)
            .style('opacity', 0)
            .remove();
      
        var xUpTitleEnter = xUpTitle.enter().append("text")
            .attr("x", function(i) {return i.dx / 2})
            .attr("y", function(i) {return -15})
            .attr("opacity", 0)
            .attr("text-anchor", "middle")
            .attr("class", "xUpTitle")
            .attr("transform", function(d) { return "translate(" + d.x + "," + 0 + ")"; })
            .text(function(d, i) { return d.desc.replace(/.* - /, ""); });
    
        xUpTitle.transition()
            .duration(updDuration)
            .delay(updDelay)
            .attr("x", function(i) {return i.dx / 2})
            .attr("y", function(i) {return -15})
            .attr("transform", function(d) { return "translate(" + d.x + "," + 0 + ")"; })
            .text(function(d, i) { return d.desc.replace(/.* - /, ""); });
            
        xUpTitleEnter.transition()
            .duration(enterDuration)
            .delay(enterDelay)
            .style("opacity", 1);
    
        xUpTitleExit.transition()
            .duration(exitDuration)
            .style('opacity', 0)
            .remove();
    
        var xDwnTitleEnter = xDwnTitle.enter().append("text")
            .attr("x", function(i) {return i.dx / 2})
            .attr("y", function(i) {return -15})
            .attr("opacity", 0)
            .attr("text-anchor", "middle")
            .attr("class", "xDwnTitle")
            .attr("transform", function(d) { return "translate(" + d.x + "," + (totalHeight - 15) + ")"; })
            .text(function(d, i) { 
                var suffix = d.name.replace(/.*-/, "");
                var filtered = newNodes.filter(function(d2) { 
                    return d2.name.endsWith(suffix);
                });
                var total = filtered.map(function(obj){ return obj.value; }).reduce(function(a, b) { 
                    return a + b;
                });
                return "Masse : " + format(total);
            });
    
        xDwnTitle.transition()
            .duration(updDuration)
            .delay(updDelay)
            .attr("x", function(i) {return i.dx / 2})
            .attr("y", function(i) {return -15})
            .attr("transform", function(d) { return "translate(" + d.x + "," + (totalHeight - 15) + ")"; })
            .text(function(d, i) { 
                var suffix = d.name.replace(/.*-/, "");
                var filtered = newNodes.filter(function(d2) { 
                    return d2.name.endsWith(suffix);
                });
                var total = filtered.map(function(obj){ return obj.value; }).reduce(function(a, b) { 
                    return a + b;
                });
                return "Masse : " + format(total);
            });
    
        xDwnTitleEnter.transition()
            .duration(enterDuration)
            .delay(enterDelay)
            .style("opacity", 1);
    
        xDwnTitleExit.transition()
            .duration(exitDuration)
            .style('opacity', 0)
            .remove();
            
        d3.selectAll(".chartComment").transition()
            .duration(enterDelay)
            .style('opacity', 0)
          .transition()
            .style("display", "none");
            
        d3.selectAll(".chartComment" + chartDef.id).transition()
            .delay(enterDelay)
            .style("display", "block")
          .transition()
            .duration(enterDuration)
            .style('opacity', 1);
    		
    }
    
    function computeFontSize(dy) {
        var textSize = Math.sqrt(3 * dy / height);
        if (textSize > 1.5) {
            textSize = 1.5;
        }
        if (textSize < 0.75) {
            textSize = 0.75;
        }
        return textSize * 100;
    }
    
    function getNodeKey(d) {
        return d.name;
    }
    
    function getLinkKey(d) {
        return d.source.name + d.target.name;
    }
    
    function linkWidth(d) {
        return Math.max(1, d.dy);
    }
    
    function log(msg) {
        setTimeout(function() {
            throw new Error(msg);
        }, 0);
    }
    
    function linkVisibility(d) {
        if (d.value == epsilon) {
            return "hidden";
        } else {
            return "visible";
        }
    }
    
    d3.selectAll("h2")
        .remove();
        
    d3.selectAll(".imageWhenNoJS")
        .remove();
        
    d3.selectAll(".tooltip")
        .style("position", "absolute");
        
    var selectedChart = charts[0];
     
    var paragraph = d3.select("#sankeyChart");
    
    var chartMenu = paragraph.append("div")
        .attr("class", "chartMenu")
      .append("select")
        .on("change", function() {
            changeChart(this.value);
        });
        
    chartMenu.selectAll("option")
        .data(charts)
      .enter().append("option")
        .text(function(d) { return d.label; });
    
    var svg = paragraph.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    d3.selectAll(".chartComment")
        .style("display", "none")
        .style("opacity", 0); // It will live unseen until it's moment of revelation arrives
        
    d3.selectAll(".tooltip")
        .style("opacity", 0); // It will live unseen until it's moment of revelation arrives
        
    changeChart(selectedChart.label);

})();
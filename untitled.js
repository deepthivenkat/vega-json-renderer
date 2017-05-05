function createAndBindAxis(Axis_details, data, axisName){
	var Scale, Axis;
	if(axisName==="x"){
		switch (Axis_details.type){
		case "quantitative":
			Scale = d3.scale.linear().range([0, width]);
			break;
		case "nominal":
			Scale = d3.scale.ordinal().range([0, width]);
			break;
		case "temporal":
			Scale = d3.time.scale.utc().range([0, width]);
			timeFormat = d3.time.format('%Y-%m-%dT%H:%M:%S%Z');
			break;
		case "ordinal":
			Scale = d3.scale.ordinal().range([0, width]);
			break;
		}
	}
	else{
		switch (Axis_details.type){
		case "quantitative":
			Scale = d3.scale.linear().range([height,0]);
			break;
		case "nominal":
			Scale = d3.scale.ordinal().range([height,0]);
			break;
		case "temporal":
			Scale = d3.time.scale.utc().range([height,0]);
			timeFormat = d3.time.format('%Y-%m-%dT%H:%M:%S%Z');
			break;
		case "ordinal":
			Scale = d3.scale.ordinal().range([height,0]);
			break;
		}
	}

	Axis = d3.svg.axis().scale(Scale);
	Scale.domain([d3.min(data,function(d){return +d[Axis_details.field];}),d3.max(data,function(d){return +d[Axis_details.field]})]);
	return {"scale":Scale, "axis":Axis};
}


function dragmove(d) {
	var color;
	// console.log("I am here !!");

	if(d3.select(this)[0][0].style.fill){
		color = d3.select(this)[0][0].style.fill;
  	console.log("hi", d3.select(this)[0][0].style.fill)
  }
  else{
  	console.log('No style property for the selection. Applying default style')
  }


	// if(typeof color!='undefined'){
	// 	this.parentNode.parentNode.parentNode.parentNode.childNodes[1].childNodes[0].childNodes[2].childNodes.forEach(function(d,i){
	// 	d.style.fill=color;
	// });
	// }
	// console.log(d3.event.x, d3.event.y);
 //  d3.select(this).attr("transform", "translate(" +  d3.event.x + "," + d3.event.y + ")");
 //  console.log(d3.select.attr("transform"));
  d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);

}

function processScatterPlot(spec,data,id){

	var axis_details = spec["encoding"];

	var xAxisDetails = createAndBindAxis(axis_details["x"], data, "x");
	var x = xAxisDetails["scale"];
	var xAxis = xAxisDetails["axis"];
	xAxis.orient("bottom");
	var yAxisDetails = createAndBindAxis(axis_details["y"], data, "y");
	var y = yAxisDetails["scale"];
	var yAxis = yAxisDetails["axis"];
	yAxis.orient("left");

	if(axis_details.color){
		var colorField = axis_details.color["field"], colorType = axis_details.color["type"];
	switch(colorType){
		case "nominal":
			var colorScale = d3.scale.category20();
			break;
		case "quantitative":
		case "ordinal":
			var numColors = 8;
			var dataset = data.map(function(d){
				return d[colorField]
			});
			var colorScale = d3.scale.quantize()
  								.domain(d3.extent(dataset))
  								.range(colorbrewer.Reds[numColors]);
  			break;
  		default:
  			var numColors = 8;
			var dataset = data.map(function(d){
				return d[colorField]
			});
			var colorScale = d3.scale.quantize()
  								.domain(d3.extent(dataset))
  								.range(colorbrewer.Reds[numColors]);
	}
	}

	if(typeof id!=="string"){
var chart = d3.select('.div4')
	.append('svg:svg').attr("id", id)
	.attr('width', width + margin.right + margin.left)
	.attr('height', height + margin.top + margin.bottom)
	.attr('class', 'chart');
	}

	else{
		var chart = d3.select('.div1')
	.append('svg:svg').attr("id", id)
	.attr('width', width + margin.right + margin.left)
	.attr('height', height + margin.top + margin.bottom)
	.attr('class', 'chart')
	}

	var main = chart.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
	.attr('width', width)
	.attr('height', height)
	.attr('class', 'main');

 main.append("g")
 .classed("x axis", true)
 .attr("transform","translate(0,"+height+")")
.call(xAxis)
.append("text")
.classed("label",true)
.attr("x", width)
.attr("y", -margin.bottom/2)
.style("text-anchor","end")
.text(axis_details["x"].field);

    main.append('g')
	.classed("y axis",true)
	.call(yAxis)
	.append("text")
      .classed("label",true)
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(axis_details["y"].field);

    var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    var g = main.append("svg:g");

    var drag = d3.behavior.drag()
    .on("drag", dragmove);


      if(axis_details.size){
      	var size_field = axis_details.size.field;
      	var data_size = data.map(function(d){return d[size_field];});
      	var circleSize = d3.scale.linear()
								 .domain(d3.extent(data_size))
								 .range([2, 10]);

      	var scatter = g.selectAll("scatter-dots")
      .data(data)
      .enter().append("svg:circle")
          .attr("cx", function (d,i) {
          	return x(d[axis_details["x"].field]); } )
          .attr("cy", function (d) {
          	return y(d[axis_details["y"].field]); } )
          .attr("r", function(d){
          	return circleSize(d[size_field]);
          }).on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["Name"] + "<br/> (" + d[axis_details["x"]["field"]]
	        + ", " + d[axis_details["y"]["field"]] + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      }).call(drag);
      }
      else{
      	var scatter = g.selectAll("scatter-dots")
      .data(data)
      .enter().append("svg:circle")
          .attr("cx", function (d,i) {
          	return x(d[axis_details["x"].field]); } )
          .attr("cy", function (d) {
          	return y(d[axis_details["y"].field]); } )
          .attr("r", 4).on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["Name"] + "<br/> (" + d[axis_details["x"]["field"]]
	        + ", " + d[axis_details["y"]["field"]] + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      }).call(drag);
      }

      if(axis_details.color){
      	scatter.style("fill",function(d){
      		return colorScale(d[colorField])
      	});
      }

}

d3.select('.div4').on("click", function() {
  console.log("rect");
  // d3.select('.div1')[0][0].children[1].children[0].children[2].children = d3.event.target.children[0].children[2].children;
  length_data = d3.event.target.children[0].children[2].children.length;
  var i =0;
  for(i=0;i<length_data;i++){
  	d3.select('.div1')[0][0].children[1].children[0].children[2].children.item(i).style.fill=d3.event.target.children[0].children[2].children.item(i).style.fill;
  }
  d3.event.stopPropagation();
});

function compare_and_render_color(spec_array, data_array) {
	source_spec = spec_array[0];
	target_spec = spec_array[1];
	if(source_spec.encoding.color){
		var color_attribute = source_spec.encoding.color;
	}
	else{
		return;
	}
	field_type = color_attribute.type;
	possible_spec_array = [];
	target_data = data_array[1];
	data_item = target_data[0];
	data_type_per_field = {};
	for (var property in data_item){
		if(data_item.hasOwnProperty(property)){
			if(typeof data_item[property]==='string'){
				data_type_per_field[property] = "nominal";
			}
			else if (typeof data_item[property]==="number"){
				data_type_per_field[property]="quantitative";
			}
			else if(data_item[property] instanceof Date){
				data_type_per_field[property]="ordinal";
			}
		}
	}
	switch(field_type){
		case "quantitative":
			var quantitative_field = [];
			for(var property in data_type_per_field){
				if(data_type_per_field[property]=="quantitative"){
					quantitative_field.push(property)
				}
			}
			var tree = require('tree-kit');
			// var emp = require('fs');
			// var fs = require('file-system');
			quantitative_field.map(function(d,i){
				var copy = tree.clone(target_spec);
				copy.encoding.color = {"field":d,"type":"quantitative"}
				possible_spec_array.push(copy);
			});
			var recommendation_id = [];
			possible_spec_array.map(function(d,i){
				recommendation_id.push(i)
			});
			possible_spec_array.map(function(d,i){
				processScatterPlot(d,target_data,recommendation_id[i]);
			});
			// possible_spec_array.map(function(d,i){
			// 		emp.writeFile("generated_json/"+i.toString()+".json", 'hey', function(err,data){
			// 			if(err){
			// 				return console.log(err);
			// 			}
			// 			console.log(data);
			// 		});
			// 	});
			break;
		case "nominal":
			var nominal_field = [];
			for(var property in data_type_per_field){
				if(data_type_per_field[property]=="nominal"){
					nominal_field.push(property)
				}
			}
			nominal_field.map(function(d,i){
				target_spec.encoding.color = {"field":d,"type":"nominal"}
				possible_spec_array.push(target_spec);
			});
			break;
		case "ordinal":
			var ordinal_field = [];
			for(var property in data_type_per_field){
				if(data_type_per_field[property]=="ordinal"){
					ordinal_field.push(property)
				}
			}
			ordinal_field.map(function(d,i){
				target_spec.encoding.color = {"field":d,"type":"temporal"}
				possible_spec_array.push(target_spec);
			});
			break;

	}

	return possible_spec_array;

}


var margin = {top: 20, right: 120, bottom: 30, left: 120},
    width = 390 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var spec_array = []; // contains no_color.json and quantitative_color.json
var data_array = []; // read the data

var q = d3.queue();  // making the process of reading files sequentional
q
.defer(d3.json,"quantitative_color_vega.json")
.defer(d3.json,"no_color.json")
.awaitAll(vega_ready);

function vega_ready(error, results){
	//  results will have two objects one contains no color and another contains quantitative_color_vega
	if(error) throw error;
	var files_to_be_read = [];
	spec_array = results;
	spec_array.map(function(d,i){ // getting the URL for each data file
		files_to_be_read.push(d.data.url);
	});

	var data_q = d3.queue();
	files_to_be_read.map(function(d,i){ // Reading each data
		URL = d;
		path_array = URL.split("/");
		filename = path_array[path_array.length-1];
		filetype = filename.split(".")[1];
		switch (filetype){
			case "csv":
				data_q.defer(d3.csv,URL);
				break;
			case "tsv":
				data_q.defer(d3.tsv,URL);
				break;
			case "json":
				data_q.defer(d3.json,URL);
				break;
			default:
				seperator = "|";
				var psv = d3.dsv("|","text/plain");
				psv(URL, function(filecontent){
					data = filecontent;
				});
		}
	});

	data_q.awaitAll(data_ready);
}

function data_ready(error,results){
	if(error) throw error;
	data_array = results;
	type_array = ['source', 'target']
	data_array.map(function(d,i){
		switch (spec_array[i].mark){
			case "line":
				processLineChart(spec_array[i],data_array[i]);
				break;
			case "bar":
				processBarChart(spec_array[i],data_array[i]);
				break;
			case "point":
			case "circle":
			case "square":
				processScatterPlot(spec_array[i],data_array[i],type_array[i]);
				break;
}

	});

other_specs = compare_and_render_color(spec_array, data_array);

}

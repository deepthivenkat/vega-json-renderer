var global_spec ;
global_spec = [];
var global_data ;
global_data = [];
function createAndBindAxis(Axis_details, data, axisName){
	var Scale, Axis;
	if(axisName==="x"){
		switch (Axis_details.type){
		case "quantitative":
			Scale = d3.scale.linear().range([0, width/2]);
			break;
		case "nominal":
			Scale = d3.scale.ordinal().range([0, width/2]);
			break;
		case "temporal":
			Scale = d3.time.scale.utc().range([0, width/2]);
			timeFormat = d3.time.format('%Y-%m-%dT%H:%M:%S%Z');
			break;
		case "ordinal":
			Scale = d3.scale.ordinal().range([0, width/2]);
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
	Scale.domain([0,d3.max(data,function(d){return +d[Axis_details.field]})]);
	return {"scale":Scale, "axis":Axis};
}


function processScatterPlot(spec,data,id, title){

	global_spec.push(spec);
	global_data.push(data);
	var axis_details = spec["encoding"];

	var xAxisDetails = createAndBindAxis(axis_details["x"], data, "x");
	var x = xAxisDetails["scale"];
	var xAxis = xAxisDetails["axis"];
	xAxis.orient("bottom");
	var yAxisDetails = createAndBindAxis(axis_details["y"], data, "y");
	var y = yAxisDetails["scale"];
	var yAxis = yAxisDetails["axis"];
	yAxis.orient("left");



	if(axis_details.color && typeof axis_details.color !="string"){
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
	var chart1;

	if(typeof id!=="string"){
		
;
var chart = d3.select('.div4')
	.append('svg:svg').attr("id", id)
	.attr('width', width + margin.right + margin.left)
	.attr('height', height + margin.top + margin.bottom)
	.attr('class', 'chart');
// 	.append("text")
// .attr("x", (width / 2)-margin.left)             
// .attr("y", 0 - (margin.top / 3))
// .attr("text-anchor", "middle")  
// .style("font-size", "16px") 
// .style("color","blue")
// .style("fill","blue")
// .style("text-decoration", "underline")  
// .classed("label",true)
// .text("Value vs Date Graph");

 chart.append("g")
 .classed("x axis", true)
 .attr("transform", "translate("+margin.left+"," + height + ")")
.call(xAxis)
.append("text")
.classed("label",true)
.attr("x", width/4)
.attr("y", margin.bottom)
.style("text-anchor","middle")
.text(axis_details["x"].field);


 chart.append('g')
	.classed("y axis",true)
	.attr("transform", "translate(" + margin.left + ",0)")
	.call(yAxis)
	.append("text")
      .classed("label",true)
      .attr("transform", "translate(" + -margin.left/24 + ","+height/2+")rotate(-90)")
      .attr("y", -margin.left/3)
      .style("text-anchor", "middle");
// chart1 = chart;
var scatter = chart.selectAll("scatter-dots")
      .data(data)
      .enter().append("circle")
          .attr("cx", function (d,i) {
          	return x(d[axis_details["x"].field]); } )
          .attr("cy", function (d) {
          	return y(d[axis_details["y"].field]); } )
          .attr("r", 4);

    var textnode = document.createTextNode(title);

	d3.select('.div4')[0][0].appendChild(textnode);
	d3.select('.div4')[0][0].style.fontSize = "10px";


	}

	else{

		

		if (d3.select('#source')[0][0]!= null){
			var chart = d3.select('#source');
			chart.append("g")
			 .classed("x axis", true)
			 .attr("transform", "translate("+(width/2+margin.left+margin.left)+"," + height + ")")
			.call(xAxis)
			.append("text")
			.classed("label",true)
			.attr("x", width/4)
			.attr("y", margin.bottom)
			.style("text-anchor","middle")
			.text(axis_details["x"].field);

    chart.append('g')
	.classed("y axis",true)
	.attr("transform", "translate(" + (width/2+margin.left+margin.left) + ",0)")
	.call(yAxis)
	.append("text")
      .classed("label",true)
      .attr("transform", "translate(" + -margin.left/24 + ","+height/2+")rotate(-90)")
      .attr("y", -margin.left/3)
      .style("text-anchor", "middle")
      .text(axis_details["y"].field);

      var target_g = chart.append("g")
            .attr("class","target_area")
            .attr("transform", "translate("+(width/2 + margin.left +margin.left)+","  + "0)")
            .attr("width",width/2)
            .attr("height",height);

          chart1 = target_g;

          var scatter = chart1.selectAll("scatter-dots")
      .data(data)
      .enter().append("circle")
          .attr("cx", function (d,i) {
          	return x(d[axis_details["x"].field]); } )
          .attr("cy", function (d) {
          	return y(d[axis_details["y"].field]); } )
          .attr("r", 4);

          var textnode = document.createTextNode(title);

	d3.select('.div1')[0][0].appendChild(textnode)
;
d3.select('.div1')[0][0].style.fontSize = "10px";

	
}
		else{
			var textnode = document.createTextNode(title);

	d3.select('.div1')[0][0].appendChild(textnode)
;
d3.select('.div1')[0][0].style.fontSize = "10px";

			var chart = d3.select('.div1')
	.append('svg:svg').attr("id", id)
	.attr('width', width + margin.right + margin.left)
	.attr('height', height + margin.top + margin.bottom)
	.attr('class', 'chart');

	chart.append("g")
 .classed("x axis", true)
 .attr("transform", "translate("+margin.left+"," + height + ")")
.call(xAxis)
.append("text")
.classed("label",true)
.attr("x", width/4)
.attr("y", margin.bottom)
.style("text-anchor","middle")
.text(axis_details["x"].field);

    chart.append('g')
	.classed("y axis",true)
	.attr("transform", "translate(" + margin.left + ",0)")
	.call(yAxis)
	.append("text")
      .classed("label",true)
      .attr("transform", "translate(" + -margin.left/24 + ","+height/2+")rotate(-90)")
      .attr("y", -margin.left/3)
      .style("text-anchor", "middle")
      .text(axis_details["y"].field);
      chart1 = chart;

      var scatter = chart1.selectAll("scatter-dots")
      .data(data)
      .enter().append("circle")
          .attr("cx", function (d,i) {
          	return x(d[axis_details["x"].field]); } )
          .attr("cy", function (d) {
          	return y(d[axis_details["y"].field]); } )
          .attr("r", 4)
          .classed("baseCircle", true);

        		   function moveCircle() {
            d3.select(this)
                .attr('cx', d3.event.x)
                .attr('cy', d3.event.y);
        }

        var drag = d3.behavior.drag()
            .on("dragstart", dragstart)
            .on("drag", drag_func)
            .on("dragend", dragend);

         scatter.call(drag);

         var targetCircle = scatter;
        var tempCircle = scatter;

        function dragstart() {
            console.log("circle dragged is::" + d3.select(this).attr("id"));
            if (d3.select(this).classed("baseCircle") === true) {

                targetCircle = chart.append("circle")
                    .attr("r", 4) 
                    .attr("cx", targetCircle.attr("cx"))
                    .attr("cy", targetCircle.attr("cy"))
                    .style("fill", d3.select(this)[0][0].style.fill);
            } else {
                targetCircle = d3.select(this);
                tempCircle = this;
            }
            targetCircle.classed("dragTarget", true);
        }

        function drag_func() {
            targetCircle.attr("cx", d3.event.x)
                .attr("cy", d3.event.y);
        }

        var groupAll = d3.behavior.drag()
            .origin(Object)
            .on("drag", function(d, i) {
                var child = this;
                var move = d3.transform(child.getAttribute("transform")).translate;
                var x = d3.event.dx + move[0];
                var y = d3.event.dy + move[1];
                d3.select(child).attr("transform", "translate(" + x + "," + y + ")");
                
            });

        var that = this;
        that.spec = global_spec[1];
        that.data = global_data[1];

        function dragend(d) {
           
            var tx = targetCircle.attr("cx"),
                ty = targetCircle.attr("cy");

            var nearness;

            if (8*ty < tx)
            {
            	nearness = 'y'
            }
            else if (tx - 3*ty < 200)
            {
            	nearness = 'x'
            }
            else{
            	nearness = 'center'
            }

 			var color_to_fill = targetCircle[0][0].style.fill;
 			render_spec(color_to_fill, nearness);
            targetCircle.remove();
           
        }

        function render_spec(color_to_fill, nearness){
        	global_spec[1].encoding.color = color_to_fill;
        	if(nearness == 'x'){
        	compare_and_render_color([global_spec[0],global_spec[1]],[global_data[0],global_data[1]])
        	processScatterPlot(global_spec[1],global_data[1],2, 'Color by current selection');
        	}
        	else if (nearness == 'y'){
        		
        	compare_and_render_color([global_spec[0],global_spec[1]],[global_data[0],global_data[1]])
        	processScatterPlot(global_spec[1],global_data[1],2, 'Color by current selection');
        	}
        	else{
        		processScatterPlot(global_spec[1],global_data[1],2, 'Color by current selection');
        	compare_and_render_color([global_spec[0],global_spec[1]],[global_data[0],global_data[1]])
        	
        	}
        	

        }


		}






	}

      if(axis_details.color && typeof axis_details.color != "string"){
      	scatter.style("fill",function(d){
      		return colorScale(d[colorField])
      	});
      }
      else if (axis_details.color && typeof axis_details.color == "string"){
      	scatter.style("fill",axis_details.color);
      }

}

d3.select('.div4').on("click", function() {

  length_data = d3.event.target.children.length;
  var i =0;
  var source_circles = []
  for(i=0;i<length_data;i++){
  	if(i>1){
  		source_circles.push(d3.event.target.children.item(i));
  		}
  	
  }
  // source_circles = d3.event.target.children.forEach(function(d,i){if(i>1){return d;}})
  target_circles = d3.select('.target_area')[0][0].children;
  target_length = target_circles.length;

  for(i=0;i<target_length;i++){
  	target_circles.item(i).style.fill=source_circles[i].style.fill;
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
			var title_reco = [];
			possible_spec_array.map(function(d,i){
				title_reco.push(d.encoding.color.field+'-'+ d.encoding.color.type+' field');
			});
			var recommendation_id = [];
			possible_spec_array.map(function(d,i){
				recommendation_id.push(i)
			});
			possible_spec_array.map(function(d,i){
				processScatterPlot(d,target_data,recommendation_id[i],title_reco[i]);
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





var margin = {top: 30, right: 30, bottom: 30, left: 80}
            , width = 960 - margin.left - margin.right
            , height = 300 - margin.top - margin.bottom;

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
	title_array = ['Cars data - colored by Displacement, a quantitative field', 'Chocolate data']
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
				processScatterPlot(spec_array[i],data_array[i],type_array[i], title_array[i]);
				break;
}

	});

// other_specs = compare_and_render_color(spec_array, data_array);

}

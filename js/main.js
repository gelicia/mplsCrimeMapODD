/*
things: 
this gets a range of reds each month. every month is on a 1-100 scale, it does not make a scale by what all the months are


to improve:
option to leave out certain neighborhoods
option to leave out certain crimes
auto play

*/

//we only use the month and year of this date.
var minYear = 2012;
var minMonth = 0;

var dateOfInterest = new Date(minYear, minMonth, 1);

var regex = /[\s\.]/g;

var monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];

function offsetToMonth(offset){
	dateOfInterest.setYear(minYear + Math.floor(offset/12));
	dateOfInterest.setMonth(minMonth + (offset%12));
	return monthNames[dateOfInterest.getMonth()] + " " + dateOfInterest.getFullYear();
}

function dateToFileName(){
	var monthStr = String(dateOfInterest.getMonth() + 1);
	monthStr = (monthStr.length == 1 ? '0' + monthStr : monthStr);
	return String(dateOfInterest.getFullYear()) + monthStr;
}

//Init is to make sure everything loads properly
function init(){
	var loadPromise = loadDataset();
	loadPromise.done( function(){
		redraw();
	});
}

function redraw(){
		var noDowntownWest = $(noDW).attr('checked') === undefined ? false : true;

		var ds = new Miso.Dataset({
		url : "data/" + dateToFileName() + ".csv",
		delimiter : ","
		});

		_.when(
			ds.fetch({
			success : function() {
				var thisMax = this.where({ 
					rows : function(row) {
						return !noDowntownWest || row.NEIGHBORHOOD !== 'DOWNTOWN WEST';
					}
				}).max('Total ');

				//color range between white and red
				var colorRange = d3.scale.linear().domain([0, thisMax]).range(["#FFFFFF", "#FF0000"]);

				this.each(
					function(row){
						//console.log(row.NEIGHBORHOOD.replace(regex, "").toLowerCase() + " = " + row["Total "]);
						if (row.NEIGHBORHOOD !== null && (!noDowntownWest || row.NEIGHBORHOOD !== 'DOWNTOWN WEST')){
							d3.select("#" + (row.NEIGHBORHOOD).replace(regex, "").toLowerCase())
								.attr({"dataDate" : dateToFileName()})
								.transition()
								.duration(1000)
								.ease("linear")
								.attr({
									fill : colorRange(row["Total "])
								});
						}
						
					}
				);
			}
			})
		).then(
			function(){
				//I couldn't get this to work with a pure selector
				var allPaths = d3.selectAll("svg g path");

				allPaths.each(function(){
					var thisPath = d3.select(this);

					if (thisPath.attr("dataDate") != dateToFileName() || (noDowntownWest && thisPath.attr("id") == 'downtownwest')){
						thisPath
							.transition()
							.duration(1000)
							.ease("linear")
							.attr("fill", "#666666");
					}
				});
			}
		);
}

function loadDataset(){
	var deferred = $.Deferred();

	var width = 810;
	var height = 600;
	
	//so many magic numbers...TODO
	var path = d3.geo.path().projection(
		d3.geo.mercator().center([-93.26144099999999, 44.970675]).
		scale(800000).translate([width / 2, height / 2]));

	// Create the states variable
	var neigh = d3.select("svg")
	.attr({
		width : width,
		height: height
	})
	.append("g");

   var geoJson = d3.json("data/minneapolis.geojson", function(collection) {
		neigh
			.selectAll("path")
			.data(collection.features)
			.enter()
			.append("path")
			.attr(
				{
					"d" : path,
					fill : "#666666", //Init at gray to show neighborhoods not matched up
					stroke : "#000000",
					id : function(d) {return (d.properties.name).replace(regex, "").toLowerCase();},
					"dataDate" : "00",
					"title" : function(d) {return (d.properties.name);}
				}
			)
			.on("click", function(d) {
				console.log((d.properties.name).replace(regex, "").toLowerCase());
			});

			deferred.resolve();
	});

   //get the crime and neighborhood listings for selective toggling
   //neighborhood listings come from the original geojson
   //the crimes list assumes the first crime list has all the crimes (the crimes list was consistant for 2012)

   var crimesList;

   var neighborhoodList;

   return deferred.promise();
}
function loadDataset(){
	var width = 810;
	var height = 600;
	var regex = /[\s\.]/g;
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

	// Sorry about the stupid color names
   d3.json("data/minneapolis.geojson", function(collection) {
		neigh
			.selectAll("path")
			.data(collection.features)
			.enter()
			.append("path")
			.attr(
				{
					"d" : path,
					fill : "grey",
					stroke : "black",
					id : function(d) {return (d.properties.name).replace(regex, "").toLowerCase();}
				})
				.on("click", function(d) {
					console.log((d.properties.name).replace(regex, "").toLowerCase());
				});
	});

   var ds = new Miso.Dataset({
		url : "data/201202.csv",
		delimiter : ","
		});

		ds.fetch({
			success : function() {
				var thisMax = this.max('Total ');
				var colorRange = d3.scale.linear().domain([0, thisMax]).range(["white", "red"]);

				this.each(
					function(row){
						//console.log(row.NEIGHBORHOOD.replace(regex, "").toLowerCase() + " = " + row["Total "]);
						if (row.NEIGHBORHOOD !== null){
							d3.select("#" + (row.NEIGHBORHOOD).replace(regex, "").toLowerCase())
								.attr({
									fill : colorRange(row["Total "])
								})
								.on("click", function(d) {
									console.log((d.properties.name).replace(regex, "").toLowerCase() + " " + row["Total "]);
								});
						}
						
					}
				);
			}
		});

}
import  React from 'react';
import * as d3 from 'd3';

export class Curve2 extends React.Component{

    // state={
    //     triples : [
    //         {
    //             "subject": "http://www.moma.org/collection/works/9876",
    //             "predicate": "dc:creator",
    //             "object": "http://momaexmple.org/artworks/9876/artist/"
    //         },
    //         {
    //             "subject": "http://momaexmple.org/artworks/9876/artist/",
    //             "predicate": "skos:prefLabel",
    //             "object": "Pablo Picasso"
    //         },
    //         {
    //             "subject": "http://www.moma.org/collection/works/9876",
    //             "predicate": "dct:medium",
    //             "object": "Ink on paper"
    //         },
    //         {
    //             "subject": "http://www.moma.org/collection/works/9876",
    //             "predicate": "dc:type",
    //             "object": "Drawing"
    //         },
    //         {
    //             "subject": "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.szepmuveszeti.hu%2Fdata%2Fmutargykepek%2F1%2F4378%2F14378.jpg",
    //             "predicate": "dc:creator",
    //             "object": "http://cmoaexample.com/cmoa/things/c20f15d2-18f0-4f62-866a-ac383809ce97/provider/"
    //         },
    //         {
    //             "subject": "http://cmoaexample.com/cmoa/things/c20f15d2-18f0-4f62-866a-ac383809ce97/provider/",
    //             "predicate": "skos:prefLabel",
    //             "object": "Alan G. and Jane A. Lehman Fund, Robert S. Waters Charitable Trust Fund, and Charles J. Rosenbloom Fund"
    //         },
    //         {
    //             "subject": "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.szepmuveszeti.hu%2Fdata%2Fmutargykepek%2F1%2F4378%2F14378.jpg",
    //             "predicate": "dct:medium",
    //             "object": "Ink on paper"
    //         },
    //         {
    //             "subject": "https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&type=IMAGE&uri=http%3A%2F%2Fwww.szepmuveszeti.hu%2Fdata%2Fmutargykepek%2F1%2F4378%2F14378.jpg",
    //             "predicate": "dc:type",
    //             "object": "Drawings"
    //         },
    //         {
    //             "subject": "http://www.moma.org/collection/works/9876",
    //             "predicate": "dc:creator",
    //             "object": "http://dbpedia.org/resource/Pablo_Picasso"
    //         },
    //         {
    //             "subject": "http://dbpedia.org/resource/Pablo_Picasso",
    //             "predicate": "skos:prefLabel",
    //             "object": "Pablo Picasso"
    //         },
    //         {
    //             "subject": "http://www.moma.org/collection/works/9876",
    //             "predicate": "dct:medium",
    //             "object": "Ink on paper"
    //         },
    //         {
    //             "subject": "http://www.moma.org/collection/works/9876",
    //             "predicate": "dc:type",
    //             "object": "Drawing"
    //         }
    //     ]
    // }

    componentDidMount() {
        const svg = d3.select("#svg-body").append("svg")
				.attr("width", 1000)
				.attr("height", 600)
				;

        // const force = d3.layout.force().size([800, 600]);
        const simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.id; }))
            .force('charge', d3.forceManyBody().strength(-40))
            .force('center', d3.forceCenter(1000 / 2, 600 / 2));

        this.filterNodesById = (nodes,id) => {
            return nodes.filter((n) => { return n.id === id; });
        };

        this.filterNodesByType = (nodes,value) => {
            return nodes.filter((n) => { return n.type === value; });
        };

        this.triplesToGraph = (triples) =>{

            svg.html("");
            //Graph
            var graph={nodes:[], links:[], triples:[]};

            //Initial Graph from triples
            triples.forEach((triple) =>{
                var subjId = triple.subject;
                var predId = triple.predicate;
                var objId = triple.object;

                var subjNode = this.filterNodesById(graph.nodes, subjId)[0];
                var objNode  = this.filterNodesById(graph.nodes, objId)[0];

                if(subjNode==null){
                    subjNode = {id:subjId, label:subjId, weight:1, type:"node"};
                    graph.nodes.push(subjNode);
                }

                if(objNode==null){
                    objNode = {id:objId, label:objId, weight:1, type:"node"};
                    graph.nodes.push(objNode);
                }

                var predNode = {id:predId, label:predId, weight:1, type:"pred"} ;
                graph.nodes.push(predNode);

                var blankLabel = "";

                graph.links.push({source:subjNode, target:predNode, predicate:blankLabel, weight:1});
                graph.links.push({source:predNode, target:objNode, predicate:blankLabel, weight:1});

                graph.triples.push({s:subjNode, p:predNode, o:objNode});

            });

            return graph;
        }

        const graph = this.triplesToGraph(this.props.triples);

        // ==================== Add Marker ====================
        svg.append("svg:defs").selectAll("marker")
            .data(["end"])
            .enter().append("svg:marker")
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 30)
            .attr("refY", -0.5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("svg:polyline")
            .attr("points", "0,-5 10,0 0,5")
        ;

        // ==================== Add Links ====================
        const links = svg.selectAll(".link")
            .data(graph.triples)
            .enter()
            .append("path")
            .attr("marker-end", "url(#end)")
            .attr("class", "link")
        ;

        // ==================== Add Link Names =====================
        const linkTexts = svg.selectAll(".link-text")
            .data(graph.triples)
            .enter()
            .append("text")
            .attr("class", "link-text")
            .text(function (d) {
                return d.p.label;
            })
        ;

        // ==================== Add Link Names =====================
        const nodeTexts = svg.selectAll(".node-text")
            .data(this.filterNodesByType(graph.nodes, "node"))
            .enter()
            .append("text")
            .attr("class", "node-text")
            .text(function (d) {
                return d.label;
            })
        ;

        // ==================== Add Node =====================
        const nodes = svg.selectAll(".node")
            .data(this.filterNodesByType(graph.nodes, "node"))
            .enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", 8)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));
            // .call(force.drag) #######################################
        ;//nodes

        // ==================== Force ====================
        simulation.on("tick", function() {
            nodes
                .attr("cx", function(d){ return d.x; })
                .attr("cy", function(d){ return d.y; })
            ;

            links
                .attr("d", function(d) {
                    return "M" 	+ d.s.x + "," + d.s.y
                        + "S" + d.p.x + "," + d.p.y
                        + " " + d.o.x + "," + d.o.y;
                })
            ;

            nodeTexts
                .attr("x", function(d) { return d.x + 12 ; })
                .attr("y", function(d) { return d.y + 3; })
            ;


            linkTexts
                .attr("x", function(d) { return 4 + (d.s.x + d.p.x + d.o.x)/3  ; })
                .attr("y", function(d) { return 4 + (d.s.y + d.p.y + d.o.y)/3 ; })
            ;
        });

        simulation.nodes(graph.nodes);
       //   simulation.links(graph.links); //#####################################
       // d3.forceLink([links]).links([graph.links])
        simulation.force("link")
            .links(graph.links);


        // .links(graph.links);
            // .charge(-500)
            // force.linkDistance(50)
            // .start()

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(-0.3);
            d.fx = null;
            d.fy = null;
        }

    }

    render() {
        return <div id="svg-body" className="panel-body"/>
    }
}
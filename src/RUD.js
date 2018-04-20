////
////
////

// Let jshint pass over over our external globals (browserify takes
// care of it all).
/* global jQuery */
/* global Plotly */
/* global global_data */
/* global global_summary_data */

var us = require('underscore');
var cytoscape = require('cytoscape');
var regCose = require('cytoscape-cose-bilkent');
regCose( cytoscape ); // register extension

// Aliases
var each = us.each;

// Code here will be ignored by JSHint, as we are technically
// "redefining" jQuery (although we are not).
/* jshint ignore:start */
// var jQuery = require('jquery');
/* jshint ignore:end */

///
/// ...
///

var DEBUG = true;
function ll(str){
    if(DEBUG){
        console.log(str);
    }
}

///
var SourceTable = function(table_id){

    console.log('Running source table...');

    var tbl = jQuery('#' + table_id).DataTable({
        //{autoWidth: true, "order": [[3, "desc"], [0, "asc"]]}
        autoWidth: true
    });

    console.log('...table init...');

    // Initialize for license commentary popups.
    jQuery(function(){
        jQuery('[data-toggle="popover"]').popover();
    });
    // And on paging redraw (they are separate).
    tbl.on("draw", function(){
        //console.log('DataTable draw event');
        jQuery('[data-toggle="popover"]').popover();
    });

    console.log('...done.');
};

/// High-level summary of curated data resources
var SummaryViewer = function(summary_data, graph_id){

    console.log('In summary graph init...');
    console.log(summary_data);

    var layout = {
        title: 'High-level summary of curated data resources',
        //width: 500,
        //height: 300,
        paper_bgcolor: "rgb(236, 238, 239)",
        plot_bgcolor: "rgb(236, 238, 239)",
        xaxis: {
            //tickangle: -45
            tickangle: -25
        },
        barmode: 'stack'
    };

    Plotly.newPlot(graph_id, summary_data, layout);

    console.log('...done.');
};

/// Licenses used
var LicenseViewer = function(global_data, graph_id){

    // Generate simple tracks.
    var licount = {};
    each(global_data, function(n){

	if( n['status'] === 'complete' ){

	    var nid = n['id'];
	    var nlbl = n['source'];
	    var lic = n['license'];

	    // Ensure.
	    if( typeof(licount[lic]) === 'undefined' ){
		licount[lic] = 0;
	    }

	    licount[lic] = licount[lic] +1;
	}
    });

    var values = [];
    var labels = [];
    each(licount, function(v, k){
	values.push(v);
	labels.push(k);
    });

    var data = [{
	values: values,
	labels: labels,
	hole: '0.37',
	type: 'pie'
    }];

    var layout = {
        title: 'Licenses used',
	height: 500,
	width: 500
    };

    Plotly.newPlot(graph_id, data, layout);

};

/// Overall license reuse categories
var LicenseTypeViewer = function(global_data, graph_id){

    // Generate simple tracks.
    var licount = {};
    each(global_data, function(n){

	if( n['status'] === 'complete' ){

	    var nid = n['id'];
	    var nlbl = n['source'];
	    var lic = n['license-type'];

	    // Ensure.
	    if( typeof(licount[lic]) === 'undefined' ){
		licount[lic] = 0;
	    }

	    licount[lic] = licount[lic] +1;

	}
    });

    var values = [];
    var labels = [];
    each(licount, function(v, k){
	values.push(v);
	labels.push(k);
    });

    var data = [{
	values: values,
	labels: labels,
	hole: '0.37',
	type: 'pie'
    }];

    var layout = {
        title: 'Overall license reuse categories',
	height: 500,
	width: 500
    };

    Plotly.newPlot(graph_id, data, layout);

};

/// Reuse categories for custom (non-standard) licenses
var LicenseCustomTypeViewer = function(global_data, graph_id){

    // Generate simple tracks.
    var licount = {};
    each(global_data, function(n){

	if( n['status'] === 'complete' ){

	    var nid = n['id'];
	    var nlbl = n['source'];
	    var lictype = n['license-type'];
	    var lic = n['license'];

	    // Filter out all non-custom licenses too.
	    if( lic === 'custom' ){
		// Ensure.
		if( typeof(licount[lictype]) === 'undefined' ){
		    licount[lictype] = 0;
		}

		licount[lictype] = licount[lictype] +1;
	    }
	}
    });

    var values = [];
    var labels = [];
    each(licount, function(v, k){
	values.push(v);
	labels.push(k);
    });

    var data = [{
	values: values,
	labels: labels,
	hole: '0.37',
	type: 'pie'
    }];

    var layout = {
        title: 'Reuse categories for custom (non-standard) licenses',
	height: 500,
	width: 500
    };

    Plotly.newPlot(graph_id, data, layout);

};

/// Standard license groups
var LicenseStandardViewer = function(global_data, graph_id){

    // Generate simple tracks.
    var licount = {};
    each(global_data, function(n){

	if( n['status'] === 'complete' ){

	    var nid = n['id'];
	    var nlbl = n['source'];
	    var lictype = n['license-type'];
	    var lic = n['license'];

	    // Figure out what category any license is in.
	    var category_bin = 'unmapped';

	    if( us.contains(['CC0-1.0', 'CC-BY-4.0', 'CC-BY-3.0', 'CC-BY-SA-4.0', 'CC-BY-SA-3.0', 'CC-BY-NC-4.0', 'CC-BY-NC-3.0', 'CC-BY-ND-4.0', 'CC-BY-ND-3.0'], lic) ){
		category_bin = 'Creative Commons';
	    }else if( us.contains(['MIT', 'GPL-3.0'], lic) ){
		category_bin = 'OSI (standard software)';
	    }else if( us.contains(['ODbL-1.0'], lic) ){
		category_bin = 'ODC (standard data)';
	    }else if( lic === 'all rights reserved' || lic === 'unlicensed' ){
		category_bin = 'US copyright (inc. none)';
	    }else if( lic === 'public domain' ){
		category_bin = 'US public domain';
	    }else if( lic === 'custom' ){
		category_bin = 'custom';
	    }else if( lic === 'inconsistent' ){
		category_bin = 'inconsistent';
	    }

	    // We missed something...
	    if( category_bin === 'unmapped' ){
		console.log('WARNING: missed standard license category: '+lic+'!');
	    }

	    // Ensure and count.
	    if( typeof(licount[category_bin]) === 'undefined' ){
		licount[category_bin] = 0;
	    }
	    licount[category_bin] = licount[category_bin] +1;
	}
    });

    var values = [];
    var labels = [];
    each(licount, function(v, k){
	values.push(v);
	labels.push(k);
    });

    var data = [{
	values: values,
	labels: labels,
	hole: '0.37',
	type: 'pie'
    }];

    var layout = {
        title: 'Standard license groups',
	height: 500,
	width: 500
    };

    Plotly.newPlot(graph_id, data, layout);

};

/// Score distribution
var ScoreViewer = function(global_data, graph_id){

    // Base track.
    var x = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

    // Generate size scaling.
    var scount = {};
    each(global_data, function(n){

	if( n['status'] === 'complete' ){

	    var nid = n['id'];
	    var nlbl = n['source'];
	    var score = n['grade-automatic'];

	    // Ensure.
	    if( typeof(scount[score]) === 'undefined' ){
		scount[score] = 0;
	    }

	    scount[score] = scount[score] +1;
	}
    });
    var size = [];
    each(x, function(t){
	var cnt = 0;
	if( typeof(scount[t]) !== 'undefined' ){
	    //mag = scount[t.toString()] * 10;
	    cnt = scount[t];
	}
	size.push(cnt);
    });

    console.log(x);
    console.log(size);

    // Assemble trace.
    var trace = {
	x: x,
	y: size,
	marker: {
	    color: 'rgb(158,202,225)',
	    opacity: 0.6,
	    line: {
		color: 'rbg(8,48,107)',
		width: 1.5
	    },
	},
	type: 'bar'
    };
    var data = [trace];

    var layout = {
	title: 'Score distribution',
	xaxis: {
	    title: "Score",
	    autotick: false,
	    dtick: 0.5
	},
	yaxis: {title: "Count"}
    };

    Plotly.newPlot(graph_id, data, layout);
};

var internal_metadata = {
    "groups": [
        {
            "name": "Linking RDF data to the Japanese content in review articles",
	    "themes": [
		"Software infrastructure"
	    ],
            "comment": "Added to align manuscript and slides for apparent subgroup"
        },
        {
            "name": "BioRuby",
	    "themes": [
		"Software infrastructure"
	    ],
            "comment": "Added to align manuscript and slides for apparent subgroup"
        },
        {
            "name": "Pitagora-Galaxy",
	    "themes": [
		"Software infrastructure"
	    ],
            "comment": "Added to align manuscript and slides for apparent subgroup"
        },
        {
            "name": "PPPeptide",
	    "themes": [
		"Omics integration and accessibility"
	    ],
            "comment": "Added denovo for singleton naito"
        },
        {
            "name": "Submit papers of BH13-14 and BH15!",
	    "themes": [
	    ],
            "comment": ""
        },
        {
            "name": "LODVectors",
	    "themes": [
		"Machine learning"
	    ],
            "comment": "Added to clarify manuscript and align with wrap-up slides"
        },
        {
            "name": "scJSON-LD",
	    "themes": [
		"Software infrastructure"
	    ],
            "comment": "Added to clarify manuscript and align with wrap-up slides for bonnal"
        },
        {
            "name": "Fastastic Graphalicious",
	    "themes": [
		"Omics integration and accessibility"
	    ],
            "comment": ""
        },
        {
            "name": "Glycoinformatics",
	    "themes": [
		"Omics integration and accessibility"
	    ],
            "comment": ""
        },
        {
            "name": "gBWT-sparql-hack",
	    "themes": [
		"Omics integration and accessibility"
	    ],
            "comment": "Theme guessed from group members at https://github.com/jltsiren/gbwt"
        },
        {
            "name": "Building FAIR Projectors",
	    "themes": [
		"Interoperability and reuse"
	    ],
            "comment": ""
        },
        {
            "name": "Harmonization of chemical name concepts",
	    "themes": [
		"Machine learning"
	    ],
            "comment": "Apparently the PubChem group"
        },
        {
            "name": "Writ of hackathons",
	    "themes": [
	    ],
            "comment": ""
        },
        {
            "name": "Data Analysis Pipelines and Reproducibility",
	    "themes": [
		"Interoperability and reuse"
	    ],
            "comment": ""
        },
        {
            "name": "YACLE",
	    "themes": [
		"Software infrastructure"
	    ],
            "comment": "Added theme as SI as was in workflow in wrap-up"
        },
        {
            "name": "Localization (Translation) and Security stuff of Galaxy",
	    "themes": [
		"Interoperability and reuse"
	    ],
            "comment": ""
        },
        {
            "name": "Linked ICGC",
	    "themes": [
		"Interoperability and reuse"
	    ],
            "comment": ""
        },
        {
            "name": "Blockchain, IPFS and Smart Contracts in the Life Sciences",
	    "themes": [
		"Software infrastructure"
	    ],
            "comment": ""
        },
        {
            "name": "API interoperability facilitated by JSON-LD, OpenAPI and more",
	    "themes": [
		"Interoperability and reuse"
	    ],
            "comment": ""
        },
        {
            "name": "Bioschemas",
	    "themes": [
		"Interoperability and reuse"
	    ],
            "comment": ""
        },
        {
            "name": "Construct genome graphs",
	    "themes": [
		"Omics integration and accessibility"
	    ],
            "comment": "Guessed from vg shout-out in wrap-up"
        },
        {
            "name": "EBI RDF Platform",
	    "themes": [
		"Interoperability and reuse"
	    ],
            "comment": "??? Norio (interested) [ed--ambiguous, picked shinkai]"
        },
        {
            "name": "LOD Surfer",
	    "themes": [
		"Software infrastructure"
	    ],
            "comment": ""
        },
        {
            "name": "Imaging Database and Morphomics Platform",
	    "themes": [
		"Interoperability and reuse"
	    ],
            "comment": ""
        },
        {
            "name": "A smartAPI for Spontaneous Reporting Systems (SRS) - FDA FAERS",
	    "themes": [
		"Interoperability and reuse"
	    ],
            "comment": ""
        },
        {
            "name": "EnvO and MEO mapping",
	    "themes": [
		"Interoperability and reuse"
	    ],
            "comment": ""
        },
        {
            "name": "How to improve OBO ontology development for hackability",
	    "themes": [
		"Interoperability and reuse"
	    ],
            "comment": ""
        },
        {
            "name": "Linking bio/omics data to the Sustainable Development Goals",
	    "themes": [
		"Interoperability and reuse"
	    ],
            "comment": "??? Norio (interested) [ed--picked shinkai]; theme inferred from BH17 sub-groups description"
        },
        {
            "name": "FAIR Metrics",
	    "themes": [
		"Interoperability and reuse"
	    ],
            "comment": ""
        },
        {
            "name": "PubCaseFinder REST API development and integration",
	    "themes": [
		"Interoperability and reuse"
	    ],
            "comment": ""
        },
        {
            "name": "Develop Docker container for Monarch semantic similarity measures",
	    "themes": [
		"Software infrastructure"
	    ],
            "comment": ""
        },
        {
            "name": "Matchmaker Exchange tooling",
	    "themes": [
		"Interoperability and reuse"
	    ],
            "comment": ""
        },
        {
            "name": "Ontology term requestor service",
	    "themes": [
		"Software infrastructure"
	    ],
            "comment": "Theme inferred from people and BH17 sub-groups description"
        },
        {
            "name": "Variant Subscription Service",
	    "themes": [
		"Omics integration and accessibility"
	    ],
            "comment": ""
        },
        {
            "name": "Citation Graph Visualization",
	    "themes": [
		"Software infrastructure"
	    ],
            "comment": ""
        },
        {
            "name": "iMETHYL database",
	    "themes": [
		"Omics integration and accessibility"
	    ],
            "comment": ""
        },
        {
            "name": "Extending properties of a bioscience ontology developed from JST thesaurus",
	    "themes": [
	    ],
            "comment": "Hard to categorize"
        },
        {
            "name": "Medical Genomics Japan Variant Database (MGeND)",
	    "themes": [
		"Omics integration and accessibility"
	    ],
            "comment": ""
        },
        {
            "name": "Visualize and export genomics data via trackHub",
	    "themes": [
		"Omics integration and accessibility"
	    ],
            "comment": ""
        },
        {
            "name": "DBCLS SRA & AOE (All of gene expression)",
	    "themes": [
		"Omics integration and accessibility"
	    ],
            "comment": ""
        },
        {
            "name": "smart protocols",
	    "themes": [
		"Software infrastructure"
	    ],
            "comment": ""
        },
        {
            "name": "Journal of (Biomedical|FAIR) Open Data",
	    "themes": [
	    ],
            "comment": ""
        },
        {
            "name": "Neuro-symbolic learning on a rare disease oriented graph for drug repurposing",
	    "themes": [
		"Machine learning"
	    ],
            "comment": ""
        },
        {
            "name": "Harnessing the standardized Orthology Ontology for inferring new information",
	    "themes": [
		"Interoperability and reuse"
	    ],
            "comment": ""
        },
        {
            "name": "jPOST",
	    "themes": [
		"Omics integration and accessibility"
	    ],
            "comment": ""
        },
        {
            "name": "TogoGenome",
	    "themes": [
		"Omics integration and accessibility"
	    ],
            "comment": ""
        },
        {
            "name": "Viridiplantae SNP Annotation",
	    "themes": [
		"Interoperability and reuse"
	    ],
            "comment": ""
        },
        {
            "name": "Stanza Development for Integrated Human Variation Database",
	    "themes": [
		"Omics integration and accessibility"
	    ],
            "comment": "Theme inferred from close relation to TogoGenome from BH17 sub0groups"
        },
        {
            "name": "Machine Learning Group",
	    "themes": [
		"Machine learning"
	    ],
            "comment": ""
        },
        {
            "name": "Machine learning of phenotype data",
	    "themes": [
		"Machine learning"
	    ],
            "comment": "Added group to clarify Claus in the manuscript beyond Machine Learning Group"
        },
        {
            "name": "Data Integration of Earth Science and Genome Science",
	    "themes": [
		"Interoperability and reuse"
	    ],
            "comment": ""
        },
        {
            "name": "Reaction Generators, Substructure Finders, and Reaction Ontology",
	    "themes": [
	    ],
            "comment": "Hard to categorize; little info"
        },
        {
            "name": "Automating the Annotation of Uncharacterized Disease-Associated Genes",
	    "themes": [
		"Machine learning"
	    ],
            "comment": ""
        },
        {
            "name": "Exploring big data tools for aggregating disparate data",
	    "themes": [
		"Interoperability and reuse"
	    ],
            "comment": ""
        },
        {
            "name": "Noctua curator information ingest",
	    "themes": [
		"Software infrastructure"
	    ],
            "comment": ""
        },
        {
            "name": "Lisp(s) in Bioinformatics (Bio-Lisp)",
	    "themes": [
		"Software infrastructure"
	    ],
            "comment": ""
        },
        {
            "name": "Discussion of Light Application-level API (LALA)",
	    "themes": [
		"Software infrastructure"
	    ],
            "comment": ""
        },
        {
            "name": "JavaScript SPARQL libraries (BBOP)",
	    "themes": [
		"Software infrastructure"
	    ],
            "comment": ""
        }
    ],
    "people": [
        {
            "name": "Antezana, Erick",
            "project": "Semantic Web for the Wet Lab and for Agriculture",
            "affiliation": "Norwegian University of Science and Technology (NTNU) / Bayer CropScience, Norway",
            "groups": [],
            "worked-on": [
                "Submit papers of BH13-14 and BH15!",
                "smart protocols",
                "Blockchain, IPFS and Smart Contracts in the Life Sciences"
            ],
            "worked-with": [
                "Viridiplantae SNP Annotation",
                "TogoGenome",
                "jPOST",
                "Neuro-symbolic learning on a rare disease oriented graph for drug repurposing",
                "FAIR Metrics",
                "Writ of hackathons"
            ]
        },
        {
            "name": "Aoki-Kinoshita, Kiyoko F.",
            "project": "GlyCosmos",
            "affiliation": "Soka University, Japan",
            "groups": [],
            "worked-on": [
                "Glycoinformatics"
            ],
            "worked-with": [
                "jPOST",
                "Harnessing the standardized Orthology Ontology for inferring new information",
                "Neuro-symbolic learning on a rare disease oriented graph for drug repurposing",
                "smart protocols",
                "Linking bio/omics data to the Sustainable Development Goals",
                "Harmonization of chemical name concepts",
                "Construct genome graphs",
                "EBI RDF Platform",
                "Noctua curator information ingest"
            ]
        },
        {
            "name": "Araki, Ayano",
            "project": "???",
            "affiliation": "Kyoto University, Japan",
            "groups": [],
            "worked-on": [
                "Medical Genomics Japan Variant Database (MGeND)"
            ],
            "worked-with": []
        },
        {
            "name": "Banda, Juan",
            "project": "SRS smartAPI",
            "affiliation": "Stanford University, USA",
            "groups": [],
            "worked-on": [
                "A smartAPI for Spontaneous Reporting Systems (SRS) - FDA FAERS"
            ],
            "worked-with": [
                "Writ of hackathons",
                "API interoperability facilitated by JSON-LD, OpenAPI and more"
            ]
        },
        {
            "name": "Baumgartner, Bill",
            "project": "annotegrate",
            "affiliation": "University of Colorado Denver, USA",
            "groups": [],
            "worked-on": [
                "Exploring big data tools for aggregating disparate data",
                "Automating the Annotation of Uncharacterized Disease-Associated Genes"
            ],
            "worked-with": [
                "How to improve OBO ontology development for hackability",
                "Lisp(s) in Bioinformatics (Bio-Lisp)"
            ]
        },
        {
            "name": "Bolleman, Jerven",
            "project": "UniProt",
            "affiliation": "Swiss Institute of Bioinformatics (SIB), Switzerland",
            "groups": [],
            "worked-on": [
                "gBWT-sparql-hack",
                "Building FAIR Projectors",
		"LODVectors"
            ],
            "worked-with": []
        },
        {
            "name": "Bolton, Evan",
            "project": "PubChem",
            "affiliation": "National Center for Biotechnology Information (NCBI), USA",
            "groups": [],
            "worked-on": [
                "Submit papers of BH13-14 and BH15!",
                "Glycoinformatics",
                "Harmonization of chemical name concepts",
                "Writ of hackathons"
            ],
            "worked-with": []
        },
        {
            "name": "Bonnal, Raoul Jean Pierre",
            "project": "scJSON-LD",
            "affiliation": "Fondazione Istituto Nazionale Genetica Molecolare (INGM), Italy",
            "groups": [],
            "worked-on": [
		"scJSON-LD",
                "Journal of (Biomedical|FAIR) Open Data",
                "Data Analysis Pipelines and Reproducibility"
            ],
            "worked-with": []
        },
        {
            "name": "Bono, Hidemasa",
            "project": "Public NGS data portal",
            "affiliation": "Database Center for Life Science (DBCLS), ROIS, Japan",
            "groups": [],
            "worked-on": [
                "DBCLS SRA & AOE (All of gene expression)"
            ],
            "worked-with": []
        },
        {
            "name": "Burgstaller-Muehlbacher, Sebastian",
            "project": "Citation Graph Explorer",
            "affiliation": "The Scripps Research Institute, USA",
            "groups": [],
            "worked-on": [
                "Citation Graph Visualization"
            ],
            "worked-with": [
                "Harmonization of chemical name concepts",
                "EBI RDF Platform",
                "Noctua curator information ingest"
            ]
        },
        {
            "name": "Buske, Orion",
            "project": "PhenoTips, PhenomeCentral, MME, RareConnect",
            "affiliation": "Hospital for Sick Children (SickKids)",
            "groups": [],
            "worked-on": [
                "Variant Subscription Service",
                "Ontology term requestor service",
                "Matchmaker Exchange tooling",
                "PubCaseFinder REST API development and integration"
            ],
            "worked-with": [
                "Develop Docker container for Monarch semantic similarity measures"
            ]
        },
        {
            "name": "Buttigieg, Pier Luigi",
            "project": "Ontologies for planetary ecology and sustainable development",
            "affiliation": "Alfred Wegener Institute Helmholtz Centre for Polar and Marine Research (AWI), Germany",
            "groups": [],
            "worked-on": [
                "Linking bio/omics data to the Sustainable Development Goals",
                "How to improve OBO ontology development for hackability",
                "EnvO and MEO mapping"
            ],
            "worked-with": [
                "smart protocols",
                "Ontology term requestor service",
                "Develop Docker container for Monarch semantic similarity measures"
            ]
        },
        {
            "name": "Callahan, Tiffany",
            "project": "ignorenets",
            "affiliation": "University of Colorado Denver | Anschutz Medical Campus (AMC), USA",
            "groups": [],
            "worked-on": [
                "Automating the Annotation of Uncharacterized Disease-Associated Genes"
            ],
            "worked-with": [
                "Machine Learning Group"
            ]
        },
        {
            "name": "Carbon, Seth",
            "project": "Gene Ontology, Noctua",
            "affiliation": "Lawrence Berkeley National Laboratory (LBL), USA",
            "groups": [],
            "worked-on": [
                "Develop Docker container for Monarch semantic similarity measures",
                "JavaScript SPARQL libraries (BBOP)",
                "Noctua curator information ingest",
                "Discussion of Light Application-level API (LALA)",
                "Lisp(s) in Bioinformatics (Bio-Lisp)"
            ],
            "worked-with": [
                "Ontology term requestor service",
                "Localization (Translation) and Security stuff of Galaxy"
            ]
        },
        {
            "name": "Chiba, Hirokazu",
            "project": "Ortholog Ontology",
            "affiliation": "Database Center for Life Science (DBCLS), ROIS, Japan",
            "groups": [],
            "worked-on": [
                "Harnessing the standardized Orthology Ontology for inferring new information"
            ],
            "worked-with": [
                "Data Integration of Earth Science and Genome Science"
            ]
        },
        {
            "name": "Dumontier, Michel",
            "project": "FAIR, Bio2RDF, SIO",
            "affiliation": "Institute of Data Science, Maastricht University, Netherlands",
            "groups": [],
            "worked-on": [
                "Submit papers of BH13-14 and BH15!",
                "Exploring big data tools for aggregating disparate data",
                "Machine Learning Group",
                "Ontology term requestor service",
                "FAIR Metrics",
                "API interoperability facilitated by JSON-LD, OpenAPI and more",
                "Bioschemas",
		"LODVectors"
            ],
            "worked-with": []
        },
        {
            "name": "Eizenga, Jordan",
            "project": "Genome graphs",
            "affiliation": "University of California Santa Cruz (UCSC), USA",
            "groups": [],
            "worked-on": [
                "Fastastic Graphalicious"
            ],
            "worked-with": []
        },
        {
            "name": "Fujiwara, Toyofumi",
            "project": "PubCases",
            "affiliation": "Database Center for Life Science (DBCLS), ROIS, Japan",
            "groups": [],
            "worked-on": [
                "Stanza Development for Integrated Human Variation Database",
                "PubCaseFinder REST API development and integration"
            ],
            "worked-with": [
                "Automating the Annotation of Uncharacterized Disease-Associated Genes",
                "Ontology term requestor service",
                "Develop Docker container for Monarch semantic similarity measures"
            ]
        },
        {
            "name": "Garcia, Alexander",
            "project": "Biotea, Smart protocols",
            "affiliation": "Universidad Politecnica de Madrid, Spain",
            "groups": [],
            "worked-on": [
                "Journal of (Biomedical|FAIR) Open Data",
                "smart protocols",
                "Writ of hackathons",
                "Blockchain, IPFS and Smart Contracts in the Life Sciences",
                "Bioschemas"
            ],
            "worked-with": [
                "Machine Learning Group",
                "Citation Graph Visualization"
            ]
        },
        {
            "name": "Garcia Castro",
            "project": "Bioschemas",
            "affiliation": "European Bioinformatics Institute (EMBL-EBI), UK",
            "groups": [],
            "worked-on": [],
            "worked-with": []
        },
        {
            "name": "Leyla Jael",
            "project": "Bioschemas",
            "affiliation": "European Bioinformatics Institute (EMBL-EBI), UK",
            "groups": [],
            "worked-on": [
                "Bioschemas"
            ],
            "worked-with": [
                "Machine Learning Group",
                "Citation Graph Visualization",
                "FAIR Metrics",
                "Writ of hackathons",
                "Blockchain, IPFS and Smart Contracts in the Life Sciences",
                "Construct genome graphs"
            ]
        },
        {
            "name": "Garrison, Erik",
            "project": "Variation graphs",
            "affiliation": "Wellcome Trust Sanger Institute, UK",
            "groups": [],
            "worked-on": [
                "Fastastic Graphalicious",
                "How to improve OBO ontology development for hackability",
                "gBWT-sparql-hack",
                "Construct genome graphs"
            ],
            "worked-with": []
        },
        {
            "name": "Ghelfi, Andrea",
            "project": "Automated Annotation for Allele-Specific Expression",
            "affiliation": "Kazusa DNA Research Institute (KDRI), Japan",
            "groups": [],
            "worked-on": [
                "Viridiplantae SNP Annotation",
                "smart protocols"
            ],
            "worked-with": [
                "Neuro-symbolic learning on a rare disease oriented graph for drug repurposing"
            ]
        },
        {
            "name": "Goto, Naohisa",
            "project": "BioRuby",
            "affiliation": "Research Institute for Microbial Diseases (RIMD), Osaka University, Japan",
            "groups": [],
            "worked-on": [
		"BioRuby",
                "Data Analysis Pipelines and Reproducibility"
            ],
            "worked-with": [
                "Data Integration of Earth Science and Genome Science"
            ]
        },
        {
            "name": "Goto, Susumu",
            "project": "jPOST",
            "affiliation": "Database Center for Life Science (DBCLS), ROIS, Japan",
            "groups": [],
            "worked-on": [
                "jPOST"
            ],
            "worked-with": [
                "Data Integration of Earth Science and Genome Science",
                "Harnessing the standardized Orthology Ontology for inferring new information",
                "Neuro-symbolic learning on a rare disease oriented graph for drug repurposing",
                "EnvO and MEO mapping",
                "A smartAPI for Spontaneous Reporting Systems (SRS) - FDA FAERS",
                "Harmonization of chemical name concepts"
            ]
        },
        {
            "name": "Groza, Tudor",
            "project": "???",
            "affiliation": "Kinghorn Centre for Clinical Genomics, Garvan Institute of Medical Research, Australia",
            "groups": [],
            "worked-on": [
                "Matchmaker Exchange tooling",
                "Develop Docker container for Monarch semantic similarity measures",
                "PubCaseFinder REST API development and integration"
            ],
            "worked-with": []
        },
        {
            "name": "Hachiya, Tsuyoshi",
            "project": "iMethyl omics DB",
            "affiliation": "Iwate Medical University (IMU), Japan",
            "groups": [],
            "worked-on": [
                "iMETHYL database"
            ],
            "worked-with": [
                "Visualize and export genomics data via trackHub",
                "Linked ICGC"
            ]
        },
        {
            "name": "Hattori, Masahiro",
            "project": "???",
            "affiliation": "Genomedia Inc., Japan",
            "groups": [],
            "worked-on": [],
            "worked-with": []
        },
        {
            "name": "Hickey, Glenn",
            "project": "Genome graphs",
            "affiliation": "Arenaria Inc, Canada",
            "groups": [],
            "worked-on": [
                "Fastastic Graphalicious"
            ],
            "worked-with": [
                "Construct genome graphs"
            ]
        },
        {
            "name": "Higashimoto, Shinichi",
            "project": "???",
            "affiliation": "Soka University, Japan",
            "groups": [],
            "worked-on": [
                "Glycoinformatics"
            ],
            "worked-with": []
        },
        {
            "name": "Hoehndorf, Robert",
            "project": "AberOWL",
            "affiliation": "King Abdullah University of Science and Technology (KAUST), Saudi Arabia",
            "groups": [],
            "worked-on": [
                "Machine Learning Group",
                "Neuro-symbolic learning on a rare disease oriented graph for drug repurposing",
                "Building FAIR Projectors",
		"LODVectors"
            ],
            "worked-with": [
                "Medical Genomics Japan Variant Database (MGeND)",
                "Harmonization of chemical name concepts",
                "LOD Surfer"
            ]
        },
        {
            "name": "Ishii, Manabu",
            "project": "???",
            "affiliation": "Bioinformatics Research Unit RIKEN, Japan",
            "groups": [],
            "worked-on": [],
            "worked-with": [
                "Citation Graph Visualization",
                "YACLE",
                "Localization (Translation) and Security stuff of Galaxy",
                "Blockchain, IPFS and Smart Contracts in the Life Sciences"
            ]
        },
        {
            "name": "Itaya, Kotone",
            "project": "???",
            "affiliation": "Keio University, Japan",
            "groups": [],
            "worked-on": [
                "Data Analysis Pipelines and Reproducibility"
            ],
            "worked-with": [
                "API interoperability facilitated by JSON-LD, OpenAPI and more"
            ]
        },
        {
            "name": "Kamada, Mayumi",
            "project": "???",
            "affiliation": "Kyoto University, Japan",
            "groups": [],
            "worked-on": [
                "Medical Genomics Japan Variant Database (MGeND)"
            ],
            "worked-with": []
        },
        {
            "name": "Karczewski, Konrad",
            "project": "ExAC browser",
            "affiliation": "Broad Institute, USA",
            "groups": [],
            "worked-on": [
                "Journal of (Biomedical|FAIR) Open Data",
                "Variant Subscription Service"
            ],
            "worked-with": [
                "Data Analysis Pipelines and Reproducibility"
            ]
        },
        {
            "name": "Katayama, Toshiaki",
            "project": "TogoGenome, BioRuby",
            "affiliation": "Database Center for Life Science (DBCLS), ROIS, Japan",
            "groups": [],
            "worked-on": [
                "Submit papers of BH13-14 and BH15!",
                "Stanza Development for Integrated Human Variation Database",
                "TogoGenome",
                "Medical Genomics Japan Variant Database (MGeND)",
		"LODVectors"
            ],
            "worked-with": [
                "Variant Subscription Service",
                "Ontology term requestor service",
                "Writ of hackathons",
                "API interoperability facilitated by JSON-LD, OpenAPI and more",
                "Construct genome graphs",
                "EBI RDF Platform"
            ]
        },
        {
            "name": "Katsumata, Eri",
            "project": "???",
            "affiliation": "Department of Computational Biology and Medical Sciences, Graduate School of Frontier Sciences(GSFS), The University of Tokyo, Japan",
            "groups": [],
            "worked-on": [],
            "worked-with": []
        },
        {
            "name": "Kawaguchi, Takeshi",
            "project": "Pitagora Galaxy, Microbial Genome",
            "affiliation": "Tokyo University of Agriculture, Japan",
            "groups": [],
            "worked-on": [
                "Data Analysis Pipelines and Reproducibility"
            ],
            "worked-with": [
                "Data Analysis Pipelines and Reproducibility"
            ]
        },
        {
            "name": "Kawaji, Hideya",
            "project": "FANTOM, ChIP-Atlas",
            "affiliation": "RIKEN, Japan",
            "groups": [],
            "worked-on": [
                "Visualize and export genomics data via trackHub"
            ],
            "worked-with": [
                "Variant Subscription Service"
            ]
        },
        {
            "name": "Kawano, Shin",
            "project": "kero, iHEC, MME, jPOST, TogoTable",
            "affiliation": "Database Center for Life Science (DBCLS), ROIS, Japan",
            "groups": [],
            "worked-on": [
                "jPOST"
            ],
            "worked-with": [
                "Matchmaker Exchange tooling",
                "Blockchain, IPFS and Smart Contracts in the Life Sciences"
            ]
        },
        {
            "name": "Kawashima, Shuichi",
            "project": "NBDC RDF Portal, TogoGenome",
            "affiliation": "Database Center for Life Science (DBCLS), ROIS, Japan",
            "groups": [],
            "worked-on": [
                "TogoGenome",
                "Medical Genomics Japan Variant Database (MGeND)",
		"LODVectors",
                "iMETHYL database"
            ],
            "worked-with": [
                "Data Integration of Earth Science and Genome Science",
                "Machine Learning Group",
                "Stanza Development for Integrated Human Variation Database",
                "EnvO and MEO mapping",
                "Linked ICGC",
                "EBI RDF Platform"
            ]
        },
        {
            "name": "Kawashima, Takeshi",
            "project": "MassBank RDF",
            "affiliation": "National Institute of Genetics (NIG), Japan",
            "groups": [],
            "worked-on": [
                "Data Integration of Earth Science and Genome Science"
            ],
            "worked-with": []
        },
        {
            "name": "Kim, Jin-Dong",
            "project": "PubAnnotation, LODQA",
            "affiliation": "Database Center for Life Science (DBCLS), ROIS, Japan",
            "groups": [],
            "worked-on": [
                "Automating the Annotation of Uncharacterized Disease-Associated Genes"
            ],
            "worked-with": [
                "Discussion of Light Application-level API (LALA)"
            ]
        },
        {
            "name": "Kobayashi, Norio",
            "project": "???",
            "affiliation": "RIKEN, Japan",
            "groups": [],
            "worked-on": [
                "LOD Surfer",
                "Imaging Database and Morphomics Platform"
            ],
            "worked-with": []
        },
        {
            "name": "Kohara, Yuji",
            "project": "Director",
            "affiliation": "Database Center for Life Science (DBCLS), ROIS, Japan",
            "groups": [],
            "worked-on": [],
            "worked-with": []
        },
        {
            "name": "Kojima, Ryosuke",
            "project": "???",
            "affiliation": "Kyoto University, Japan",
            "groups": [],
            "worked-on": [
                "Medical Genomics Japan Variant Database (MGeND)"
            ],
            "worked-with": []
        },
        {
            "name": "Kotera, Masaaki",
            "project": "Reaction Ontology",
            "affiliation": "Tokyo Institute of Technology, Japan",
            "groups": [],
            "worked-on": [
                "Reaction Generators, Substructure Finders, and Reaction Ontology"
            ],
            "worked-with": []
        },
        {
            "name": "Kumagai, Sadahiro",
            "project": "???",
            "affiliation": "Hitachi, Ltd., Japan",
            "groups": [],
            "worked-on": [
                "PubCaseFinder REST API development and integration"
            ],
            "worked-with": [
                "Stanza Development for Integrated Human Variation Database",
                "Neuro-symbolic learning on a rare disease oriented graph for drug repurposing",
                "Variant Subscription Service",
                "Develop Docker container for Monarch semantic similarity measures"
            ]
        },
        {
            "name": "Kume, Satoshi",
            "project": "Image Metadata",
            "affiliation": "RIKEN CLST, Japan",
            "groups": [],
            "worked-on": [
                "Imaging Database and Morphomics Platform"
            ],
            "worked-with": []
        },
        {
            "name": "Liener, Thomas",
            "project": "EBI RDF Platform",
            "affiliation": "European Bioinformatics Institute (EMBL-EBI), UK",
            "groups": [],
            "worked-on": [
                "EBI RDF Platform"
            ],
            "worked-with": []
        },
        {
            "name": "Mariethoz, Julien",
            "project": "Glycomics@ExPASy",
            "affiliation": "Swiss Institute of Bioinformatics (SIB), Switzerland",
            "groups": [],
            "worked-on": [
                "Glycoinformatics"
            ],
            "worked-with": [
                "Data Integration of Earth Science and Genome Science",
                "Journal of (Biomedical|FAIR) Open Data",
                "Citation Graph Visualization",
                "Blockchain, IPFS and Smart Contracts in the Life Sciences"
            ]
        },
        {
            "name": "Mase, Shogo",
            "project": "???",
            "affiliation": "Level Five Co., Ltd., Japan",
            "groups": [],
            "worked-on": [],
            "worked-with": [
                "Machine Learning Group",
                "Viridiplantae SNP Annotation",
                "Neuro-symbolic learning on a rare disease oriented graph for drug repurposing",
                "Construct genome graphs"
            ]
        },
        {
            "name": "Masuda, Takeshi",
            "project": "???",
            "affiliation": "The Institute of Scientific and Industrial Research, Osaka University (ISIR), Japan",
            "groups": [],
            "worked-on": [
                "Extending properties of a bioscience ontology developed from JST thesaurus",
                "Imaging Database and Morphomics Platform"
            ],
            "worked-with": []
        },
        {
            "name": "Masuya, Hiroshi",
            "project": "???",
            "affiliation": "???",
            "groups": [],
            "worked-on": [
                "Imaging Database and Morphomics Platform"
            ],
            "worked-with": []
        },
        {
            "name": "Matsumoto, Shota",
            "project": "???",
            "affiliation": "Level Five Co., Ltd., Japan",
            "groups": [],
            "worked-on": [],
            "worked-with": [
                "Linked ICGC",
                "Construct genome graphs"
            ]
        },
        {
            "name": "Mendes de Farias, Tarcisio",
            "project": "BioSODA",
            "affiliation": "Department of Ecology and Evolution, University of Lausanne (DEE - UNIL), Swiss Institute of Bioinformatics (SIB), Switzerland",
            "groups": [],
            "worked-on": [
                "Harnessing the standardized Orthology Ontology for inferring new information"
            ],
            "worked-with": []
        },
        {
            "name": "Micklem, Gos",
            "project": "InterMine",
            "affiliation": "Dept. Genetics, University of Cambridge, UK",
            "groups": [],
            "worked-on": [
                "Submit papers of BH13-14 and BH15!",
                "FAIR Metrics"
            ],
            "worked-with": []
        },
        {
            "name": "Mikami, Takahiro",
            "project": "Methylome analysis",
            "affiliation": "Iwate Medical University, Japan",
            "groups": [],
            "worked-on": [],
            "worked-with": []
        },
        {
            "name": "Minowa, Mari",
            "project": "Public Relations, NBDC Human DB",
            "affiliation": "Database Center for Life Science (DBCLS), ROIS, Japan",
            "groups": [],
            "worked-on": [],
            "worked-with": []
        },
        {
            "name": "Mishima, Hiroyuki",
            "project": "Rare disase phenotype pattern mining of PubMed",
            "affiliation": "Department of Human Genetics, Nagasaki University, Japan",
            "groups": [],
            "worked-on": [
		"BioRuby",
                "Data Analysis Pipelines and Reproducibility"
            ],
            "worked-with": []
        },
        {
            "name": "Mitsuhashi, Nobutaka",
            "project": "TogoVar",
            "affiliation": "National Bioscience Database Center (NBDC), Japan Science and Technology Agency (JST), Japan",
            "groups": [],
            "worked-on": [
                "Stanza Development for Integrated Human Variation Database"
            ],
            "worked-with": []
        },
        {
            "name": "Mori, Hiroshi",
            "project": "MicrobeDB.jp, MEO",
            "affiliation": "National Institute of Genetics, Japan",
            "groups": [],
            "worked-on": [
                "EnvO and MEO mapping"
            ],
            "worked-with": []
        },
        {
            "name": "Moriya, Yuki",
            "project": "TogoGenome, jPOST",
            "affiliation": "Database Center for Life Science (DBCLS), ROIS, Japan",
            "groups": [],
            "worked-on": [
                "jPOST"
            ],
            "worked-with": [
                "Stanza Development for Integrated Human Variation Database",
                "TogoGenome"
            ]
        },
        {
            "name": "Nagano, Akio",
            "project": "???",
            "affiliation": "PENQE Inc., Japan",
            "groups": [],
            "worked-on": [],
            "worked-with": []
        },
        {
            "name": "Naito, Yuki",
            "project": "GGRNA, GGGenome, CRISPRdirect",
            "affiliation": "Database Center for Life Science (DBCLS), ROIS, Japan",
            "groups": [],
            "worked-on": [
		"PPPeptide"
	    ],
            "worked-with": []
        },
        {
            "name": "Nakatsui, Masahiko",
            "project": "Medical Genomics Japan Variant Database",
            "affiliation": "Kyoto University, Japan",
            "groups": [],
            "worked-on": [
                "Medical Genomics Japan Variant Database (MGeND)"
            ],
            "worked-with": []
        },
        {
            "name": "Nakazato, Takeru",
            "project": "DBCLS SRA",
            "affiliation": "Database Center for Life Science (DBCLS), ROIS, Japan",
            "groups": [],
            "worked-on": [
                "DBCLS SRA & AOE (All of gene expression)"
            ],
            "worked-with": []
        },
        {
            "name": "Nohara, Sachio",
            "project": "MGeND",
            "affiliation": "Mitsubishi Space Software Co., Ltd., Japan",
            "groups": [],
            "worked-on": [],
            "worked-with": []
        },
        {
            "name": "Nomura, Yusuke",
            "project": "???",
            "affiliation": "Level Five Co., Ltd., Japan",
            "groups": [],
            "worked-on": [
                "TogoGenome"
            ],
            "worked-with": []
        },
        {
            "name": "Novak, Adam",
            "project": "Human Genome Variation Map",
            "affiliation": "University of California Santa Cruz (UCSC), Genomics Institute, USA",
            "groups": [],
            "worked-on": [
                "Fastastic Graphalicious",
                "Journal of (Biomedical|FAIR) Open Data"
            ],
            "worked-with": [
                "Blockchain, IPFS and Smart Contracts in the Life Sciences"
            ]
        },
        {
            "name": "Ochiai, Hiromu",
            "project": "???",
            "affiliation": "The Institute of Medical Science The University of Tokyo (IMSUT), Japan",
            "groups": [],
            "worked-on": [
                "YACLE"
            ],
            "worked-with": [
                "Data Analysis Pipelines and Reproducibility"
            ]
        },
        {
            "name": "Ogishima, Soichi",
            "project": "???",
            "affiliation": "Tohoku Medical Megabank Organization (ToMMo), Tohoku University, Japan",
            "groups": [],
            "worked-on": [
                "Medical Genomics Japan Variant Database (MGeND)",
                "Ontology term requestor service"
            ],
            "worked-with": []
        },
        {
            "name": "Ohta, Tazro",
            "project": "Pitagora Galaxy, ChIP-Atlas",
            "affiliation": "Database Center for Life Science (DBCLS), ROIS, Japan",
            "groups": [],
            "worked-on": [
                "smart protocols",
                "DBCLS SRA & AOE (All of gene expression)",
                "Data Analysis Pipelines and Reproducibility",
                "EBI RDF Platform"
            ],
            "worked-with": [
                "Visualize and export genomics data via trackHub",
                "API interoperability facilitated by JSON-LD, OpenAPI and more"
            ]
        },
        {
            "name": "Ohwada, Shuho",
            "project": "Genome graph",
            "affiliation": "Tokyo Institute of Technology, Japan",
            "groups": [],
            "worked-on": [
                "Construct genome graphs"
            ],
            "worked-with": []
        },
        {
            "name": "Oishi, Naoya",
            "project": "???",
            "affiliation": "DOGRUN Inc., Japan",
            "groups": [],
            "worked-on": [
                "DBCLS SRA & AOE (All of gene expression)",
		"Linking RDF data to the Japanese content in review articles"
            ],
            "worked-with": []
        },
        {
            "name": "Okabeppu, Yoko",
            "project": "???",
            "affiliation": "Mitsubishi Space Software Co., Ltd., Japan",
            "groups": [],
            "worked-on": [
                "TogoGenome"
            ],
            "worked-with": [
                "Stanza Development for Integrated Human Variation Database"
            ]
        },
        {
            "name": "Okuda, Shujiro",
            "project": "jPOST, GlyTouCan",
            "affiliation": "Niigata University, Japan",
            "groups": [],
            "worked-on": [
                "jPOST"
            ],
            "worked-with": []
        },
        {
            "name": "Omura, Munehiro",
            "project": "AMED",
            "affiliation": "G-Search, Japan",
            "groups": [],
            "worked-on": [
                "Medical Genomics Japan Variant Database (MGeND)"
            ],
            "worked-with": []
        },
        {
            "name": "Ono, Hiromasa",
            "project": "RefEx, TogoTV",
            "affiliation": "Database Center for Life Science (DBCLS), ROIS, Japan",
            "groups": [],
            "worked-on": [
		"Linking RDF data to the Japanese content in review articles"
	    ],
            "worked-with": []
        },
        {
            "name": "Prins, Pjotr",
            "project": "GeneNetwork",
            "affiliation": "University Medical Center Utrecht & University of Tennessee Health Science Center, Netherlands",
            "groups": [],
            "worked-on": [
                "Journal of (Biomedical|FAIR) Open Data",
                "Data Analysis Pipelines and Reproducibility"
            ],
            "worked-with": [
                "Writ of hackathons",
                "Lisp(s) in Bioinformatics (Bio-Lisp)"
            ]
        },
        {
            "name": "Queralt-Rosinach, Núria",
            "project": "Wikidata, Knowledge.Bio, DisGeNET-RDF",
            "affiliation": "The Scripps Research Institute (TSRI), USA",
            "groups": [],
            "worked-on": [
                "Neuro-symbolic learning on a rare disease oriented graph for drug repurposing"
            ],
            "worked-with": [
                "Machine Learning Group",
                "Medical Genomics Japan Variant Database (MGeND)",
                "Ontology term requestor service",
                "A smartAPI for Spontaneous Reporting Systems (SRS) - FDA FAERS",
                "Harmonization of chemical name concepts"
            ]
        },
        {
            "name": "Sakamoto, Yoshitaka",
            "project": "???",
            "affiliation": "Department of Computational Biology and Medical Sciences, Graduate School of Frontier Sciences(GSFS), The University of Tokyo, Japan",
            "groups": [],
            "worked-on": [],
            "worked-with": []
        },
        {
            "name": "Satoh, Daisuke",
            "project": "TogoGenome",
            "affiliation": "Level Five Co., Ltd., Japan",
            "groups": [],
            "worked-on": [
                "Stanza Development for Integrated Human Variation Database",
                "TogoGenome",
                "Medical Genomics Japan Variant Database (MGeND)"
            ],
            "worked-with": []
        },
        {
            "name": "Shimizu, Atsuhi",
            "project": "iMethyl omics DB",
            "affiliation": "Iwate Tohoku Medical Megabank Organization, Iwate Medical University, Japan",
            "groups": [],
            "worked-on": [],
            "worked-with": []
        },
        {
            "name": "Shinkai, Norio",
            "project": "Pitagora Galaxy",
            "affiliation": "National Institute of Advanced Industrial Science and Technology (AIST), Japan",
            "groups": [],
            "worked-on": [
                "Data Analysis Pipelines and Reproducibility",
		"Pitagora-Galaxy",
                "EBI RDF Platform"
            ],
            "worked-with": [
                "Linking bio/omics data to the Sustainable Development Goals"
            ]
        },
        {
            "name": "Shinmachi, Daisuke",
            "project": "GlyCosmos",
            "affiliation": "Soka Univirsity, Japan",
            "groups": [],
            "worked-on": [
                "Glycoinformatics"
            ],
            "worked-with": []
        },
        {
            "name": "Shinozaki, Natsuko",
            "project": "iMethyl omics DB",
            "affiliation": "Iwate Tohoku Medical Megabank Organization, Iwate Medical University, Japan",
            "groups": [],
            "worked-on": [
                "iMETHYL database"
            ],
            "worked-with": [
                "Data Analysis Pipelines and Reproducibility"
            ]
        },
        {
            "name": "Shiota, Masaaki",
            "project": "???",
            "affiliation": "Soka University, Japan",
            "groups": [],
            "worked-on": [
                "Glycoinformatics"
            ],
            "worked-with": []
        },
        {
            "name": "Shiwa, Yuh",
            "project": "Pitagora Galaxy, Microbial Genome",
            "affiliation": "Tokyo University of Agriculture, Japan",
            "groups": [],
            "worked-on": [
                "Data Analysis Pipelines and Reproducibility",
		"Pitagora-Galaxy"
            ],
            "worked-with": [
                "iMETHYL database",
                "Data Analysis Pipelines and Reproducibility"
            ]
        },
        {
            "name": "Steinberg, David",
            "project": "???",
            "affiliation": "University of California Santa Cruz (UCSC), Genomics Institute, USA",
            "groups": [],
            "worked-on": [
                "Journal of (Biomedical|FAIR) Open Data",
                "Data Analysis Pipelines and Reproducibility"
            ],
            "worked-with": [
                "Lisp(s) in Bioinformatics (Bio-Lisp)"
            ]
        },
        {
            "name": "Suzuki, Haruo",
            "project": "Pitagora Galaxy, Microbial Genome",
            "affiliation": "Keio University, Japan",
            "groups": [],
            "worked-on": [
                "Data Analysis Pipelines and Reproducibility",
		"Pitagora-Galaxy"
            ],
            "worked-with": [
                "Data Integration of Earth Science and Genome Science",
                "EnvO and MEO mapping",
                "Data Analysis Pipelines and Reproducibility"
            ]
        },
        {
            "name": "Suzuki, Shinya",
            "project": "???",
            "affiliation": "Tokyo Institute of Technology, Japan",
            "groups": [],
            "worked-on": [
                "EnvO and MEO mapping"
            ],
            "worked-with": []
        },
        {
            "name": "Tago, Shin-ichiro",
            "project": "AMED hackathon",
            "affiliation": "Fujitsu Laboratories Limited, Japan",
            "groups": [],
            "worked-on": [
                "Medical Genomics Japan Variant Database (MGeND)"
            ],
            "worked-with": []
        },
        {
            "name": "Takagi, Toshihisa",
            "project": "Director",
            "affiliation": "National Bioscience Database Center (NBDC), Japan Science and Technology Agency (JST), Japan",
            "groups": [],
            "worked-on": [],
            "worked-with": []
        },
        {
            "name": "Tanaka, Satoshi",
            "project": "jPOST",
            "affiliation": "Trans-IT, Japan",
            "groups": [],
            "worked-on": [
                "jPOST"
            ],
            "worked-with": []
        },
        {
            "name": "Tateishi, Yuka",
            "project": "???",
            "affiliation": "National Bioscience Database Center (NBDC), Japan",
            "groups": [],
            "worked-on": [
                "Stanza Development for Integrated Human Variation Database",
                "Extending properties of a bioscience ontology developed from JST thesaurus",
		"Linking RDF data to the Japanese content in review articles"
            ],
            "worked-with": []
        },
        {
            "name": "Tsuchiya, Issei",
            "project": "???",
            "affiliation": "Department of Computational Biology and Medical Sciences, Graduate School of Frontier Sciences(GSFS), The University of Tokyo, Japan",
            "groups": [],
            "worked-on": [],
            "worked-with": [
                "Data Analysis Pipelines and Reproducibility"
            ]
        },
        {
            "name": "Uchino, Eiichiro",
            "project": "???",
            "affiliation": "Kyoto University, Japan",
            "groups": [],
            "worked-on": [
                "Medical Genomics Japan Variant Database (MGeND)"
            ],
            "worked-with": []
        },
        {
            "name": "Vos, Rutger",
            "project": "???",
            "affiliation": "Naturalis Biodiversity Center (Naturalis), the Netherlands",
            "groups": [],
            "worked-on": [
                "Submit papers of BH13-14 and BH15!",
                "FAIR Metrics"
            ],
            "worked-with": [
                "Machine Learning Group"
            ]
        },
        {
            "name": "Watanabe, Yu",
            "project": "jPOST, GlyTouCan",
            "affiliation": "Niigata University, Japan",
            "groups": [],
            "worked-on": [
                "jPOST"
            ],
            "worked-with": []
        },
        {
            "name": "Weiland, Claus",
            "project": "FLOPO Deep Learning",
            "affiliation": "Senckenberg Data & Modelling Centre (SGN), Germany",
            "groups": [],
            "worked-on": [
		"Machine learning of phenotype data",
                "Machine Learning Group"
            ],
            "worked-with": [
                "Viridiplantae SNP Annotation",
                "Journal of (Biomedical|FAIR) Open Data",
                "Harmonization of chemical name concepts",
                "Blockchain, IPFS and Smart Contracts in the Life Sciences"
            ]
        },
        {
            "name": "Wilkinson, Mark",
            "project": "FAIR Data",
            "affiliation": "Centre for Plant Biotechnology and Genomics (CBGP UPM-INIA), Spain",
            "groups": [],
            "worked-on": [
                "FAIR Metrics",
                "Building FAIR Projectors",
                "API interoperability facilitated by JSON-LD, OpenAPI and more"
            ],
            "worked-with": [
                "Viridiplantae SNP Annotation",
                "LOD Surfer"
            ]
        },
        {
            "name": "Wu, Chunlei",
            "project": "BioThings",
            "affiliation": "The Scripps Research Institute",
            "groups": [],
            "worked-on": [
                "API interoperability facilitated by JSON-LD, OpenAPI and more",
                "Bioschemas"
            ],
            "worked-with": [
                "Harmonization of chemical name concepts",
                "EBI RDF Platform"
            ]
        },
        {
            "name": "Yamada, Issaku",
            "project": "Glycomics, GlyTouCan, WURCS",
            "affiliation": "The Noguchi Institute, Japan",
            "groups": [],
            "worked-on": [
                "Glycoinformatics"
            ],
            "worked-with": [
                "jPOST",
                "DBCLS SRA & AOE (All of gene expression)",
                "Medical Genomics Japan Variant Database (MGeND)",
                "Harmonization of chemical name concepts",
                "EBI RDF Platform"
            ]
        },
        {
            "name": "Yamada, Koichiro",
            "project": "???",
            "affiliation": "Genomedia Inc., Japan",
            "groups": [],
            "worked-on": [],
            "worked-with": []
        },
        {
            "name": "Yamada, Tomoyuki",
            "project": "???",
            "affiliation": "Genomedia Inc., Japan",
            "groups": [],
            "worked-on": [],
            "worked-with": [
                "Stanza Development for Integrated Human Variation Database",
                "Neuro-symbolic learning on a rare disease oriented graph for drug repurposing",
                "Medical Genomics Japan Variant Database (MGeND)",
                "Variant Subscription Service",
                "Ontology term requestor service"
            ]
        },
        {
            "name": "Yamaguchi, Atsuko",
            "project": "SPARQL Builder",
            "affiliation": "Database Center for Life Science (DBCLS), ROIS, Japan",
            "groups": [],
            "worked-on": [
                "LOD Surfer"
            ],
            "worked-with": [
                "Machine Learning Group",
                "Ontology term requestor service"
            ]
        },
        {
            "name": "Yamamoto, Yasunori",
            "project": "Umaka Suite, Allie, Colil",
            "affiliation": "Database Center for Life Science (DBCLS), ROIS, Japan",
            "groups": [],
            "worked-on": [
                "LOD Surfer",
		"Linking RDF data to the Japanese content in review articles"
            ],
            "worked-with": [
                "Machine Learning Group",
                "Citation Graph Visualization",
                "FAIR Metrics"
            ]
        },
        {
            "name": "Yamanaka, Ryota",
            "project": "Linked ICGC",
            "affiliation": "Oracle Corporation, Japan",
            "groups": [],
            "worked-on": [
                "Data Analysis Pipelines and Reproducibility",
                "Linked ICGC",
		"Pitagora-Galaxy"
            ],
            "worked-with": [
                "Medical Genomics Japan Variant Database (MGeND)",
                "Localization (Translation) and Security stuff of Galaxy"
            ]
        },
        {
            "name": "Yokoyama, Toshiyuki",
            "project": "???",
            "affiliation": "The University of Tokyo, Japan",
            "groups": [],
            "worked-on": [
                "Construct genome graphs"
            ],
            "worked-with": []
        },
        {
            "name": "Yoshizawa, Akiyasu C.",
            "project": "jPOST",
            "affiliation": "Graduate School of Pharmaceutical Sciences, Kyoto University, Japan",
            "groups": [],
            "worked-on": [
                "jPOST"
            ],
            "worked-with": []
        }
    ]
}
;

// Capture/cache project<->themes info directly.
var prj2thm = {};
each(internal_metadata['groups'], function(group){

    var theme = null;
    if( us.isArray(group['themes']) && group['themes'][0] ){
    	theme = group['themes'][0];

	if( theme ){
	    prj2thm[group['name']] = theme;
	}
    }
});
console.log('prj2thm');
console.log(prj2thm);

// Capture/cache people<->themes info via projects.
var ppl2thm = {};
each(internal_metadata['people'], function(person){
    //console.log(person);
    each(person['worked-on'], function(project){
    //console.log(project);
	var theme = null;
	theme = prj2thm[project];
	if( theme ){
	    if( ! ppl2thm[person['name']] ){
		ppl2thm[person['name']] = {};
	    }
	    ppl2thm[person['name']][theme] = true;
	}
    });
});
console.log('ppl2thm');
console.log(ppl2thm);

// Capture/cache people<->people info via projects.
var prj2ppl_on = {};
var prj2ppl_with = {};
var ppl2prj_on = {};
var ppl2prj_with = {};
each(internal_metadata['people'], function(person){

    each(person['worked-on'], function(project){
	// On: prj -> ppl.
	if( typeof(prj2ppl_on[project]) === 'undefined' ){
	    prj2ppl_on[project] = {};
	}
	prj2ppl_on[project][person['name']] = true;
	// On: ppl -> prj.
	if( typeof(ppl2prj_on[person['name']]) === 'undefined' ){
	    ppl2prj_on[person['name']] = {};
	}
	ppl2prj_on[person['name']][project] = true;
    });

    each(person['worked-with'], function(project){
	// With: prj -> ppl.
	if( typeof(prj2ppl_with[project]) === 'undefined' ){
	    prj2ppl_with[project] = {};
	}
	prj2ppl_with[project][person['name']] = true;
	// With: ppl -> prj.
	if( typeof(ppl2prj_with[person['name']]) === 'undefined' ){
	    ppl2prj_with[person['name']] = {};
	}
	ppl2prj_with[person['name']][project] = true;
    });
});

/// People interactions
var PeopleInteractionViewer = function(global_data, graph_id){

    var graph_layout = 'circle'; // default
    //var graph_layout = 'cose-bilkent'; // default
    var elements = []; // for cytoscape

    var once = {};
    var pdegree = {};
    var edges_with = [];
    var edges_on = [];
    each(us.keys(ppl2prj_on), function(ppl1){
	//console.log(ppl1);

	var projs = us.keys(ppl2prj_on[ppl1]);
	//console.log(proj);
	each(projs, function(proj){
	    each(us.keys(prj2ppl_on[proj]), function(ppl2){
		//console.log(ppl2);

		if( ppl1 !== ppl2 && ! once[ppl1+':'+ppl2] ){
		    once[ppl1+':'+ppl2] = true;
		    once[ppl2+':'+ppl1] = true;

		    if( ! pdegree[ppl1] ){
			pdegree[ppl1] = 1;
		    }else{
			pdegree[ppl1] = pdegree[ppl1] + 1;
		    }
		    if( ! pdegree[ppl2] ){
			pdegree[ppl2] = 1;
		    }else{
			pdegree[ppl2] = pdegree[ppl2] + 1;
		    }

		    // Push edge data.
		    edges_on.push([ppl1, ppl2]);
		    // elements.push({
		    // 	group: 'edges',
		    // 	data: {
		    // 	    source: ppl1,
		    // 	    target: ppl2,
		    // 	    predicate: 'worked-on',
		    // 	    label: 'work',
		    // 	    color: '#009999'//,
		    // 	    //glyph: 'triangle'
		    // 	}
		    // });
		}
	    });
	});
    });
    each(us.keys(ppl2prj_with), function(ppl1){
	//console.log(ppl1);

	var projs = us.keys(ppl2prj_with[ppl1]);
	//console.log(proj);
	each(projs, function(proj){
	    each(us.keys(prj2ppl_with[proj]), function(ppl2){
		//console.log(ppl2);

		if( ppl1 !== ppl2 && ! once[ppl1+':'+ppl2] ){
		    once[ppl1+':'+ppl2] = true;
		    once[ppl2+':'+ppl1] = true;

		    if( ! pdegree[ppl1] ){
			pdegree[ppl1] = 1;
		    }else{
			pdegree[ppl1] = pdegree[ppl1] + 1;
		    }
		    if( ! pdegree[ppl2] ){
			pdegree[ppl2] = 1;
		    }else{
			pdegree[ppl2] = pdegree[ppl2] + 1;
		    }

		    // Push edge data.
		    edges_with.push([ppl1, ppl2]);
		    // elements.push({
		    // 	group: 'edges',
		    // 	data: {
		    // 	    source: ppl1,
		    // 	    target: ppl2,
		    // 	    predicate: 'worked-with',
		    // 	    label: 'discuss',
		    // 	    color: '#666666'//,
		    // 	    //glyph: 'triangle'
		    // 	}
		    // });
		}
	    });
	});
    });

    // Flip addition order to get better picture.
    us.each(edges_with, function(e){
    	elements.push({
    	    group: 'edges',
    	    data: {
    		source: e[0],
    		target: e[1],
    		predicate: 'worked-with',
    		//label: 'discuss',
    		color: '#777777'//,
    		//glyph: 'triangle'
    	    }
    	});
    });
    us.each(edges_on, function(e){
    	elements.push({
    	    group: 'edges',
    	    data: {
    		source: e[0],
    		target: e[1],
    		predicate: 'worked-on',
    		//label: 'work',
    		color: '#009999'//,
    		//glyph: 'triangle'
    	    }
    	});
    });

    // Add nodes.
    var degree_blob = [];
    us.each(internal_metadata['people'], function(person){

	var data = {
    	    id: person['name'],
    	    label: person['name'],
    	    // label: nlbl,
    	    pdegree: pdegree[person['name']] || 0,
    	    // odegree: out_degree[nid]
	    // Order:
	    // "Interoperability and reuse": 0,
	    // "Machine learning": 0
	    // "Omics integration and accessibility": 0,
	    // "Software infrastructure": 0,
	    cat1: 0,
	    cat2: 0,
	    cat3: 0,
	    cat4: 0
    	};
	degree_blob.push(pdegree[person['name']] || 0);

	us.each(us.keys(ppl2thm[person['name']]), function(theme){
	    //console.log(theme);
	    if( theme === "Interoperability and reuse" ){
		data['cat1'] = 1;
	    }else if( theme === "Machine learning" ){
		data['cat2'] = 1;
	    }else if( theme === "Omics integration and accessibility" ){
		data['cat3'] = 1;
	    }else if( theme === "Software infrastructure" ){
		data['cat4'] = 1;
	    }else{
	    }
	});

    	elements.push({
    	    group: 'nodes',
    	    data: data
    	});

    });
    console.log(degree_blob);

    // Setup possible layouts.
    var layout_opts = {
	'cose-bilkent': {
	    name: 'cose-bilkent',
	    // // Called on `layoutready`
	    // ready: function () {
	    // },
	    // // Called on `layoutstop`
	    // stop: function () {
	    // },
	    // // Whether to include labels in node dimensions. Useful for avoiding label overlap
	    // nodeDimensionsIncludeLabels: false,
	    // // number of ticks per frame; higher is faster but more jerky
	    // refresh: 30,
	    // // Whether to fit the network view after when done
	    // fit: true,
	    // // Padding on fit
	    // padding: 10,
	    // // Whether to enable incremental mode
	    randomize: true//,
	    // // Node repulsion (non overlapping) multiplier
	    // nodeRepulsion: 4500,
	    // // Ideal (intra-graph) edge length
	    //		idealEdgeLength: 150,
	    // // Divisor to compute edge forces
	    // edgeElasticity: 0.45,
	    // // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
	    // nestingFactor: 0.1,
	    // // Gravity force (constant)
	    // gravity: 0.25,
	    // // Maximum number of iterations to perform
	    // numIter: 2500,
	    // // Whether to tile disconnected nodes
	    // tile: true,
	    // // Type of layout animation. The option set is {'during', 'end', false}
	    // animate: 'end',
	    // // Amount of vertical space to put between degree zero nodes during tiling (can also be a function)
	    // tilingPaddingVertical: 10,
	    // // Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)
	    // tilingPaddingHorizontal: 10,
	    // // Gravity range (constant) for compounds
	    // gravityRangeCompound: 1.5,
	    // // Gravity force (constant) for compounds
	    // gravityCompound: 1.0,
	    // // Gravity range (constant)
	    // gravityRange: 3.8,
	    // // Initial cooling factor for incremental layout
	    // initialEnergyOnIncremental:0.8
	},
	'circle': {
	    name: 'circle',
	    fit: true,
	    padding: 2,
	    spacingFactor: 0.6,
	    sort: function(a, b){
		var ai = a.data('pdegree') || 0;
	    	var bi = b.data('pdegree') || 0;
		// 	var ao = (a.data('odegree') || 0) * 0.1;
		// 	var bo = (b.data('odegree') || 0) * 0.1;
	     	//console.log('sort: ' + ai + ', ' + bi);
		return bi - ai;
	    }
	}
    };

    // Ramp up view.
    var cy = cytoscape({
	// UI loc
	container: document.getElementById(graph_id),
	// actual renderables
	elements: elements,
	layout: layout_opts[graph_layout],
	style: [
	    {
		selector: 'node',
		style: {
		    //'content': 'data(label)',
		    //			'width': 150,
		    //			'height': 100,
		    // 'width': 100,
		    // 'height': 100,
		    'pie-size': '100%',
		    'pie-1-background-color': '#E8747C',
		    'pie-1-background-size': 'mapData(cat1, 0, 4, 0, 100)',
		    'pie-2-background-color': '#74CBE8',
		    'pie-2-background-size': 'mapData(cat2, 0, 4, 0, 100)',
		    'pie-3-background-color': '#E8CB74',
		    'pie-3-background-size': 'mapData(cat3, 0, 4, 0, 100)',
		    'pie-4-background-color': '#74E883',
		    'pie-4-background-size': 'mapData(cat4, 0, 4, 0, 100)',
		    // 'width': 100,
		    // 'height': 100,
		    //'background-color': 'mapData(idegree, 0, '+max_in+', yellow, green)',
		    //'color': 'mapData(odegree, 0, 100, blue, red)',
		    'background-color': 'white',
		    //'background-color': 'black',
                    'color': 'black',
		    'border-width': 1,
		    'border-color': 'black',
		    //'font-size': 14,
		    'font-size': 8,
		    'min-zoomed-font-size': 3, //10,
                    'text-valign': 'center',
                    'text-halign': 'center',
		    //'shape': 'roundrectangle',
		    //'shape': 'circle',
		    //'shape': show_shape,
		    //'text-outline-width': 1,
		    //'text-outline-color': '#222222',
		    'text-wrap': 'wrap',
		    'text-max-width': '48px'
		}
	    },
	    {
		selector: 'edge',
		style: {
		    // NOTE/WARNING: From
		    // http://js.cytoscape.org/#style/edge-line
		    // and other places, we need to use 'bezier'
		    // here, rather than the default 'haystack'
		    // because the latter does not support glyphs
		    // on the endpoints. However, this apparently
		    // incurs a non-trivial performance hit.
		    'curve-style': 'bezier',
		    'text-rotation': 'autorotate',
		    'text-margin-y': '-6px',
		    //'target-arrow-color': 'data(color)',
		    //'target-arrow-shape': 'data(glyph)',
		    'target-arrow-fill': 'filled',
		    'line-color': 'data(color)',
		    'content': 'data(label)',
		    'font-size': 6,
		    'min-zoomed-font-size': 3, //10,
                    'text-valign': 'center',
                    'color': 'white',
		    //			'width': 6,
                    'text-outline-width': 1,
		    'text-outline-color': '#222222'
		}
	    }
	],
	// initial viewport state:
	//zoom: 1,
	//pan: { x: 0, y: 0 },
	// interaction options:
	minZoom: 0.1,
	maxZoom: 3.0,
	zoomingEnabled: true,
	userZoomingEnabled: true,
	wheelSensitivity: 0.25,
	panningEnabled: true,
	userPanningEnabled: true,
	boxSelectionEnabled: true,
	selectionType: 'single',
	touchTapThreshold: 8,
	desktopTapThreshold: 4,
	autolock: false,
	autoungrabify: false,
	autounselectify: false,
	ready: function(){
	    ll('interaction graph ready for: ' + graph_id);
	}
    });

    //
    cy.viewport({
	//zoom: 2//,
	//pan: { x: 100, y: 100 }
    });
};

/// Project interactions
var ProjectInteractionViewer = function(global_data, graph_id){

    //var graph_layout = 'circle'; // default
    var graph_layout = 'cose-bilkent'; // default
    var elements = []; // for cytoscape

    var single_parent = {};
    each(internal_metadata['groups'], function(x){

    	var parent = null;
    	if( us.isArray(x['themes']) && x['themes'][0] ){
    	    parent = x['themes'][0];

    	    if( ! single_parent[parent] ){
    		single_parent[parent] = true;

    	    	elements.push({
    		    group: 'nodes',
    		    data: {
    			id: parent,
    			label: parent
    		    }
    		});
    	    }
    	}

    	elements.push({
    	    group: 'nodes',
    	    data: {
    		id: x['name'],
    		label: x['name'],
    		parent: parent
    		// label: nlbl,
    		// idegree: in_degree[nid],
    		// odegree: out_degree[nid]
    	    }
    	});

    });

    var once = {};
    each(us.keys(prj2ppl_on), function(prj1){
	//console.log(prj1);

	var peeps = us.keys(prj2ppl_on[prj1]);
	//console.log(peeps);
	each(peeps, function(person){
	    each(us.keys(ppl2prj_on[person]), function(prj2){
		//console.log(prj2);

    		if( prj1 !== prj2 && ! once[prj1+':'+prj2]){
    		    once[prj1+':'+prj2] = true;
    		    once[prj2+':'+prj1] = true;

    		    // Push edge data.
    		    elements.push({
    			group: 'edges',
    			data: {
    			    source: prj1,
    			    target: prj2,
    			    predicate: 'worked-on',
    			    label: 'work',
    			    color: '#009999'//,
    			    //glyph: 'triangle'
    			}
    		    });
    		}
    	    });
    	});
    });
    each(us.keys(prj2ppl_with), function(prj1){
	//console.log(prj1);

	var peeps = us.keys(prj2ppl_with[prj1]);
	//console.log(peeps);
	each(peeps, function(person){
	    each(us.keys(ppl2prj_with[person]), function(prj2){
		//console.log(prj2);

    		if( prj1 !== prj2 && ! once[prj1+':'+prj2]){
    		    once[prj1+':'+prj2] = true;
    		    once[prj2+':'+prj1] = true;

    		    // Push edge data.
    		    elements.push({
    			group: 'edges',
    			data: {
    			    source: prj1,
    			    target: prj2,
    			    predicate: 'worked-with',
    			    label: 'discuss',
    			    color: '#666666'//,
    			    //glyph: 'triangle'
    			}
    		    });
    		}
    	    });
    	});
    });

    // Setup possible layouts.
    var layout_opts = {
	'cose-bilkent': {
	    name: 'cose-bilkent',
	    // // Called on `layoutready`
	    // ready: function () {
	    // },
	    // // Called on `layoutstop`
	    // stop: function () {
	    // },
	    // // Whether to include labels in node dimensions. Useful for avoiding label overlap
	    // nodeDimensionsIncludeLabels: false,
	    // // number of ticks per frame; higher is faster but more jerky
	    // refresh: 30,
	    // // Whether to fit the network view after when done
	    // fit: true,
	    // // Padding on fit
	    // padding: 10,
	    // // Whether to enable incremental mode
	    randomize: true//,
	    // // Node repulsion (non overlapping) multiplier
	    // nodeRepulsion: 4500,
	    // // Ideal (intra-graph) edge length
	    //		idealEdgeLength: 150,
	    // // Divisor to compute edge forces
	    // edgeElasticity: 0.45,
	    // // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
	    // nestingFactor: 0.1,
	    // // Gravity force (constant)
	    // gravity: 0.25,
	    // // Maximum number of iterations to perform
	    // numIter: 2500,
	    // // Whether to tile disconnected nodes
	    // tile: true,
	    // // Type of layout animation. The option set is {'during', 'end', false}
	    // animate: 'end',
	    // // Amount of vertical space to put between degree zero nodes during tiling (can also be a function)
	    // tilingPaddingVertical: 10,
	    // // Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)
	    // tilingPaddingHorizontal: 10,
	    // // Gravity range (constant) for compounds
	    // gravityRangeCompound: 1.5,
	    // // Gravity force (constant) for compounds
	    // gravityCompound: 1.0,
	    // // Gravity range (constant)
	    // gravityRange: 3.8,
	    // // Initial cooling factor for incremental layout
	    // initialEnergyOnIncremental:0.8
	},
	'circle': {
	    name: 'circle',
	    fit: true,
	    // sort: function(a, b){
	    // 	var ai = a.data('idegree') || 1;
	    // 	var bi = b.data('idegree') || 1;
	    // 	var ao = (a.data('odegree') || 0) * 0.1;
	    // 	var bo = (b.data('odegree') || 0) * 0.1;
	    // 	//console.log('sort: ' + ai + ', ' + bi);
	    // 	return (ai + ao) - (bi + bo);
	    // }
	}
    };

    // Ramp up view.
    var cy = cytoscape({
	// UI loc
	container: document.getElementById(graph_id),
	// actual renderables
	elements: elements,
	layout: layout_opts[graph_layout],
	style: [
	    {
		selector: 'node',
		style: {
		    'content': 'data(label)',
		    //			'width': 150,
		    //			'height': 100,
		    'width': 50,
		    'height': 35,
		    //'background-color': 'mapData(idegree, 0, '+max_in+', yellow, green)',
		    //'color': 'mapData(odegree, 0, 100, blue, red)',
		    'background-color': 'white',
		    //'background-color': 'black',
                    'color': 'black',
		    'border-width': 2,
		    'border-color': 'black',
		    //'font-size': 14,
		    'font-size': 8,
		    'min-zoomed-font-size': 3, //10,
                    'text-valign': 'center',
		    //'shape': 'roundrectangle',
		    //'shape': 'circle',
		    //'text-outline-width': 1,
		    //'text-outline-color': '#222222',
		    'text-wrap': 'wrap',
		    'text-max-width': '48px'
		}
	    },
	    {
		selector: 'edge',
		style: {
		    // NOTE/WARNING: From
		    // http://js.cytoscape.org/#style/edge-line
		    // and other places, we need to use 'bezier'
		    // here, rather than the default 'haystack'
		    // because the latter does not support glyphs
		    // on the endpoints. However, this apparently
		    // incurs a non-trivial performance hit.
		    'curve-style': 'bezier',
		    'text-rotation': 'autorotate',
		    'text-margin-y': '-6px',
		    //'target-arrow-color': 'data(color)',
		    //'target-arrow-shape': 'data(glyph)',
		    'target-arrow-fill': 'filled',
		    'line-color': 'data(color)',
		    'content': 'data(label)',
		    'font-size': 6,
		    'min-zoomed-font-size': 3, //10,
                    'text-valign': 'center',
                    'color': 'white',
		    //			'width': 6,
                    'text-outline-width': 1,
		    'text-outline-color': '#222222'
		}
	    }
	],
	// initial viewport state:
	//zoom: 1,
	//pan: { x: 0, y: 0 },
	// interaction options:
	minZoom: 0.1,
	maxZoom: 3.0,
	zoomingEnabled: true,
	userZoomingEnabled: true,
	wheelSensitivity: 0.25,
	panningEnabled: true,
	userPanningEnabled: true,
	boxSelectionEnabled: true,
	selectionType: 'single',
	touchTapThreshold: 8,
	desktopTapThreshold: 4,
	autolock: false,
	autoungrabify: false,
	autounselectify: false,
	ready: function(){
	    ll('interaction graph ready for: ' + graph_id);
	}
    });

    //
    cy.viewport({
	//zoom: 2//,
	//pan: { x: 100, y: 100 }
    });
};

///
/// ...
///

module.exports = {
    'LicenseViewer': LicenseViewer,
    'LicenseTypeViewer': LicenseTypeViewer,
    'LicenseCustomTypeViewer': LicenseCustomTypeViewer,
    'LicenseStandardViewer': LicenseStandardViewer,
    'ScoreViewer': ScoreViewer,
    'SummaryViewer': SummaryViewer,
    'PeopleInteractionViewer': PeopleInteractionViewer,
    'ProjectInteractionViewer': ProjectInteractionViewer,
    'SourceTable': SourceTable
};

///
/// ...
///

jQuery(document).ready(function(){
    console.log('JQuery/page ready...');
    if( jQuery("#licensegraph") && jQuery("#licensegraph").length ){
        console.log('Running license graph...');
        window.RUD.LicenseViewer(global_data, 'licensegraph');
    }
    if( jQuery("#licensetypegraph") && jQuery("#licensetypegraph").length ){
        console.log('Running license type graph...');
        window.RUD.LicenseTypeViewer(global_data, 'licensetypegraph');
    }
    if( jQuery("#licensecustomtypegraph") && jQuery("#licensecustomtypegraph").length ){
        console.log('Running custom license type graph...');
        window.RUD.LicenseCustomTypeViewer(global_data, 'licensecustomtypegraph');
    }
    if( jQuery("#licensestandardgraph") && jQuery("#licensestandardgraph").length ){
        console.log('Running license standard graph...');
        window.RUD.LicenseStandardViewer(global_data, 'licensestandardgraph');
    }
    if( jQuery("#scoregraph") && jQuery("#scoregraph").length ){
        console.log('Running score graph...');
        window.RUD.ScoreViewer(global_data, 'scoregraph');
    }
    if( jQuery("#summarygraph") && jQuery("#summarygraph").length ){
        console.log('Running summary graph...');
        window.RUD.SummaryViewer(global_summary_data, 'summarygraph');
    }
    if( jQuery("#peopleinteractiongraph") && jQuery("#peopleinteractiongraph").length ){
        console.log('Running people interaction graph...');
        window.RUD.PeopleInteractionViewer(global_data, 'peopleinteractiongraph');
    }
    if( jQuery("#projectinteractiongraph") && jQuery("#projectinteractiongraph").length ){
        console.log('Running project interaction graph...');
        window.RUD.ProjectInteractionViewer(global_data, 'projectinteractiongraph');
    }
    if( jQuery("#sourcestable") && jQuery("#sourcestable").length ){
        console.log('Running source table...');
        window.RUD.SourceTable('sourcestable');
    }
});

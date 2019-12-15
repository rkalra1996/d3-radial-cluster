console.log('mainJS loaded');
const dataExtention = 'json';
const externalJSON = 'https://api.myjson.com/bins/cfwf0';
const externalJSON2 = 'https://api.myjson.com/bins/fozrs';
const localDBFileURL = `./db/data2.${dataExtention}`;
// get the current segment id to load
const segmentID = urlHandler.videoIdToLoad;

function selectAndLoadDataSet(segmentID) {
    // wrapper function to set the dropdown and then load the data set corresponding to selected option
    dataLoader.getDropdownData(function(dropdownData){
        // get the dropdown element via jQuery and proceed
        const dropdownEl = $('.dropdown');
        dropdownModule.populate(dropdownData, dropdownEl, segmentID);
        // load data set of selected segment

        const dataUrlFromDropdown = dataLoader.extractDataUrl(segmentID, dropdownEl);
        if (dataUrlFromDropdown) {
            dataLoader.getDataSet(function(dataSet){
                if (dataSet.ok) {
                    const RadialConfig = {
                        extension: dataExtention,
                        node: {
                            color: 'green',
                            label: 'name'
                        },
                        link: {
                            color: 'pink'
                        }
                    }
            
                    const LinearConfig = {
                        extension: dataExtention,
                        node: {
                            color: 'red',
                            label: 'name'
                        },
                        link: {
                            color: 'blue'
                        }
                    }
                    RadialCluster.render('radial-cluster', dataSet.data, RadialConfig);
                    LinearCluster.render('linear-cluster', dataSet.data, LinearConfig);
                }
            }, dataExtention, dataUrlFromDropdown);

        } else {
            console.error('recieved null as url, cannot proceed');
        }
    });
}

console.log('segment id is ', segmentID);
// get the dropdownData and create dropdown
selectAndLoadDataSet(segmentID);

console.log('mainJS loaded');
const dataExtention = 'csv';
const externalJSON = 'https://api.myjson.com/bins/cfwf0';
dataLoader.getDataSet(function(dataSet){
    if (dataSet.ok) {
        const config = {
            extension: dataExtention,
            type: 'radial',
            node: {
                color: 'green',
                label: 'value'
            },
            link: {
                color: 'pink'
            }
        }
        RadialCluster.render(dataSet.data, config);
    }
}, dataExtention);
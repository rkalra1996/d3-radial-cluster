console.log('mainJS loaded');
const dataExtention = 'json';
const externalJSON = 'https://api.myjson.com/bins/cfwf0';
const externalJSON2 = 'https://api.myjson.com/bins/fozrs';
const localDBFileURL = `./db/data2.${dataExtention}`
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
}, dataExtention, localDBFileURL);
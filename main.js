console.log('mainJS loaded');
dataLoader.getDataSet(function(dataSet){
    if (dataSet.ok) {
        RadialCluster.initiate(dataSet.data);
    }
});
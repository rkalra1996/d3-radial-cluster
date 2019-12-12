var dataLoader = (function(d3Object){
    function getDataSet(callback) {
        if (d3Object) {
            d3Object.json('./../data.json', function(data){
                console.log('fetched json is ', data);
                callback({ok: true, data})
            })
        }
        else {
            callback({ok: false, error: 'Cannot load data because d3 is not present'});
        }
    }
    return {
        getDataSet
    }
})(d3)
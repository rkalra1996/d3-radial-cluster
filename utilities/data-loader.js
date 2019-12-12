var dataLoader = (function(d3Object){
    function getDataSet(callback, extension='json', url=null) {
        if (d3Object) {
            if (!url) {
                url = './../data.'+extension;
            }
            d3Object[extension](url, function(data){
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
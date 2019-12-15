var dataLoader = (function(d3Object){

    function extractDataUrl(selectedDropdownItemIndex, dropdownEl) {
        // extract the url from the dropdown list and send it back
        try {
            const selectedDropDwonIndexEl = dropdownEl.find(`#item_${selectedDropdownItemIndex}`);
            // extract url
            const urlFromSelectedDropdownEl = selectedDropDwonIndexEl.attr('url');
            if (urlFromSelectedDropdownEl.length) {
                return urlFromSelectedDropdownEl;
            }
            else {
                console.error('No url attribute present in the selected dropwn list item, sending null');
                return null;
            }
        }
        catch (e) {
            console.error('An error occured while retrieving the data url from dropdown, returning null ', e);
            return null;
        }
    }

    function getDropdownData(cb) {
        d3.json('./../program-list.json', function(err,data){
            if (data) {
                cb(data.data);
            }
            else throw err;
        });
    }


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
        getDataSet,
        getDropdownData,
        extractDataUrl
    }
})(d3)
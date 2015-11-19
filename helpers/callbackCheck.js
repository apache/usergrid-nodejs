module.exports = function(callback) {
    return (typeof callback === 'function') ? callback : function() {};
}
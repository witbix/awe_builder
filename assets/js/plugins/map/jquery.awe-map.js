/**
 * File: jquery.awe-map.ts
 * Description: Create jquery plugin init for google map element
 * Author: DuyNg
 */
/// <reference path="../../../ts-libraries/jquery.d.ts" />
var AweMapPlugin = (function () {
    function AweMapPlugin(el, options) {
        this.markers = [];
        if (window.google === undefined || window.google.maps === undefined || window.google.maps.Map === undefined)
            throw Error("You must load google map api before use this plugin");
        this.el = el;
        this.options = jQuery.extend(true, {}, AweMapPlugin.defaultOptions, options);
        this.initialize();
    }
    AweMapPlugin.prototype.initialize = function () {
        // set element height
        jQuery(this.el).css("width", "100%").height(this.options.height);
        // init map
        var options = jQuery.extend(true, {}, this.options);
        delete options.height;
        delete options.markers;
        options.center = AweMapPlugin.parsePosition(options.center);
        // wait to el is visible
        var _self = this, wait;
        wait = setInterval(function () {
            if (jQuery(_self.el).is(":visible")) {
                clearInterval(wait);
                _self.map = new window.google.maps.Map(_self.el, options);
                // init markers
                _self.initMarkers();
            }
        }, 100);
    };
    /**
     * add markers to map
     */
    AweMapPlugin.prototype.initMarkers = function () {
        var _self = this, options = this.options;
        if (options.markers && options.markers.enable) {
            this.markers = [];
            if (jQuery.isArray(options.markers.data) && options.markers.data.length > 0) {
                jQuery.each(options.markers.data, function (index, marker) {
                    marker.index = index + 1;
                    _self.addMarker(marker);
                });
            }
        }
    };
    /**
     * add new marker to map
     * @param data
     * @param index
     */
    AweMapPlugin.prototype.addMarker = function (data, index) {
        if (typeof data === "object" && data.position !== undefined) {
            var position = AweMapPlugin.parsePosition(data.position);
            if (position) {
                var markerOptions = {
                    position: position,
                    title: data.title,
                    zIndex: data.index,
                    map: this.map
                };
                if (data.icon && data.icon.fid !== -1) {
                    markerOptions.icon = { url: data.icon.url };
                }
                if (data.animation !== "none") {
                    markerOptions.animation = window.google.maps.Animation[data.animation];
                }
                var marker_1 = new window.google.maps.Marker(markerOptions);
                if (data.animation === "BOUNCE") {
                    marker_1.addListener("click", function () {
                        marker_1.setAnimation(null);
                    });
                }
                if (data.description) {
                    var _self_1 = this, isOpen_1 = false, infoWindow_1 = new window.google.maps.InfoWindow({
                        content: "<div class=\"el-map__marker-info\"><h3>" + data.title + "</h3><div class=\"el-map__marker-desc\">" + data.description + "</div></div>"
                    });
                    marker_1.addListener("click", function () {
                        if (!isOpen_1) {
                            infoWindow_1.open(_self_1.map, marker_1);
                            isOpen_1 = true;
                        }
                        else {
                            infoWindow_1.close();
                            isOpen_1 = false;
                        }
                    });
                }
                if (index !== undefined && this.markers[index] !== undefined) {
                    this.markers[index].setMap(null);
                    this.markers[index] = marker_1;
                }
                else
                    this.markers.push(marker_1);
            }
        }
    };
    /**
     * delete a marker from map
     * @param index
     */
    AweMapPlugin.prototype.removeMarker = function (index) {
        if (this.markers[index] !== undefined) {
            var marker = this.markers.splice(index, 1)[0];
            marker.setMap(null);
        }
    };
    /**
     * remove all markers from map
     */
    AweMapPlugin.prototype.removeAllMarkers = function () {
        jQuery.each(this.markers, function (index, marker) {
            marker.setMap(null);
        });
        this.markers = [];
    };
    /**
     * change option value
     * @param optionName
     * @param value
     */
    AweMapPlugin.prototype.setOption = function (optionName, value) {
        var options = this.options;
        if (options[optionName] !== undefined) {
            if (optionName !== "markers")
                options[optionName] = value;
            this.applyOptionChange(optionName, value);
        }
    };
    /**
     * apply view change when change option value
     * @param optionName
     * @param value
     */
    AweMapPlugin.prototype.applyOptionChange = function (optionName, value) {
        var options = this.options;
        if (options[optionName] !== undefined) {
            if (value === undefined)
                value = options[optionName];
            switch (optionName) {
                case "center":
                    this.map.setCenter(AweMapPlugin.parsePosition(value));
                    break;
                case "zoom":
                    this.map.setZoom(value);
                    break;
                case "mapTypeId":
                    this.map.setMapTypeId(value);
                    break;
                case "height":
                case "scrollwheel":
                case "disableDefaultUI":
                    this.destroy();
                    this.initialize();
                    break;
                case "markers":
                    var action = value.action;
                    if (action === "enableMarkers")
                        options.markers.enable = value.enable;
                    else
                        this.options.markers.data = value.current;
                    if (action === "add") {
                        var marker = value.current.slice(-1).pop();
                        marker.index = value.current.length;
                        this.addMarker(marker);
                    }
                    else if (action === "delete") {
                        this.removeMarker(value.index);
                    }
                    else if (action === "update") {
                        var marker = value.current.slice(-1).pop();
                        marker.index = value.index + 1;
                        this.addMarker(marker, value.index);
                    }
                    else if (action === "sort") {
                        this.removeAllMarkers();
                        this.initMarkers();
                    }
                    else if (action === "enableMarkers") {
                        if (value.enable)
                            this.initMarkers();
                        else
                            this.removeAllMarkers();
                    }
                    break;
            }
        }
    };
    /**
     * set options for map
     * @param options
     */
    AweMapPlugin.prototype.setOptions = function (options) {
        this.options = jQuery.extend(true, this.options, options);
        this.destroy();
        this.initialize();
    };
    /**
     * destroy map
     */
    AweMapPlugin.prototype.destroy = function () {
        jQuery(this.el).removeAttr("style").html("");
    };
    /**
     * convert string position to object for map
     * @param value
     * @returns {{lat: number, lng: number}}
     */
    AweMapPlugin.parsePosition = function (value) {
        if (typeof value === "string") {
            var center_arr = value.split(',');
            if (center_arr.length === 2) {
                return {
                    lat: parseFloat(center_arr[0].trim()),
                    lng: parseFloat(center_arr[1].trim())
                };
            }
        }
        console.log("Map position parse must be a string and have 2 params.");
        return false;
    };
    AweMapPlugin.defaultOptions = {
        height: 400,
        center: "21.001763,105.820591",
        zoom: 14,
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        scrollwheel: false,
        markers: {
            enable: false,
            data: []
        }
    };
    return AweMapPlugin;
}());
jQuery.fn.aweMap = function (options, extra) {
    var params = Array.prototype.slice.call(arguments, 1);
    jQuery(this).each(function () {
        var el = this, map = jQuery(el).data("awe-map");
        if(options == undefined)
            options = JSON.parse(jQuery(el).attr('data-map'));
        var showMap = setInterval(function(){
            if(jQuery(el).width()){
                clearInterval(showMap);
                switch (jQuery.type(options)) {
                    case "string":
                        if (jQuery.inArray(options, ["setOption", "destroy"]) > -1) {
                            if (map) {
                                switch (options) {
                                    case "setOption":
                                        var paramsType = jQuery.type(params[0]);
                                        if (paramsType === "string")
                                            map.setOption(params[0], params[1]);
                                        else if (paramsType === "object")
                                            map.setOptions(params[1]);
                                        else
                                            throw Error("aweMapPlugin: setOption method only support string or object type for first parameter.");
                                        break;
                                    case "destroy":
                                        map.destroy();
                                        break;
                                }
                            }
                            else
                                throw Error("aweMapPlugin: could not implement method '" + options + "' before initialize.");
                        }
                        else
                            throw Error("aweMapPlugin didn't have '" + options + "' method.");
                        break;
                    case "object":
                        if (map)
                            map.setOptions(options);
                        else {
                            map = new AweMapPlugin(el, options);
                            jQuery(el).data("awe-map", map);
                        }
                        break;
                    case undefined:
                        if (!map) {
                            map = new AweMapPlugin(el);
                            jQuery(el).data("awe-map", map);
                        }
                        break;
                    default:
                        throw Error("aweMapPlugin didn't support '" + jQuery.type(options) + "' type parameter.");
                        break;
                }
            }
        }, 500);
    });
    return this;
};
jQuery(document).ready(function($){
    $('.js-front-map').aweMap();
}); 

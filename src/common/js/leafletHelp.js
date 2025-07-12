var LeafletHelp = (function () {
    var _mapconfig, _map;
    function init(id, config) {
        loadConfig();
        if (config) {
            Object.assign(_mapconfig, config);
        }
        var provider = _mapconfig.provider;
        if (provider == 'Baidu')
            _mapconfig.crs = L.CRS.Baidu;
        var normalm = L.tileLayer.chinaProvider(`${provider}.Normal.Map`, {
            maxZoom: _mapconfig.maxZoom,
            minZoom: _mapconfig.minZoom,
            url :_mapconfig.normalMap || ''
        });
        var imgm = L.tileLayer.chinaProvider(`${provider}.Satellite.Map`, {
            maxZoom: _mapconfig.maxZoom,
            minZoom: _mapconfig.minZoom,
            url :_mapconfig.satelliteMap || ''
        });
        var imga = L.tileLayer.chinaProvider(`${provider}.Satellite.Annotion`, {
            maxZoom: _mapconfig.maxZoom,
            minZoom: _mapconfig.minZoom,
            url :_mapconfig.satelliteAnnotion || ''
        });
        var normal = L.layerGroup([normalm]),
            image = L.layerGroup([imgm, imga]);

        var baseLayers = {}
        baseLayers['路网地图']=normal;
        baseLayers['影像地图']=image;
        
        _mapconfig.layers = [image];
        _map = L.map(id, _mapconfig);
        // L.control.layers(baseLayers,null).setPosition("topright").addTo(_map);
        return this;
    }
    /**
     * 加载配置
     */
    function loadConfig() {
        $.ajax({
            url: "/conf/extend/gis-map-config.js",
            method: "GET",
            async: false,
            dataType: "script",
            success: function (data) {
                if (data) {
                    _mapconfig = eval(data);
                }
            },
            error: function (error) {
                //默认百度地图
                _mapconfig = {
                    provider:'GaoDe',
                    minZoom: 5, //最小缩放
                    maxZoom: 18, //最大缩放
                    attributionControl: false, //隐藏左下角leaflet
                    zoomControl: false,  //隐藏缩放控件
                    center: [30.5266, 114.3533], //地图中心点
                    zoom: 12 //初始缩放层级
                };
                console.error("gis-map-config not found !");
            }
        });
    }

    function getMap() {
        return _map;
    }
    return Object.freeze({
        init, getMap
    });
})();
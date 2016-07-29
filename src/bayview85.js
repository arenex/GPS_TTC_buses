var map;
var readonce = true;
var myCenter = new google.maps.LatLng(43.767112, -79.38738);
var anothervehicle = new google.maps.LatLng(43.777283, -79.31398);
var pagetext = "";
var myarr_lats = [];
var myarr_lons = [];
var myarr_secs = [];
var myarr_heading = [];
var all_markers = [];
var all_markers_timers = [];
var bus_image_array_Icons = [];
var bus_timers_array_Icons = [];

function load_pics()
{
    var bus_map_size = [75, 92, 102, 106, 102, 92, 75, 92, 102, 106, 102, 92, 75, 92, 102, 106, 102, 92, 75, 92, 102, 106, 102, 92];
    var pic_loc = 'pic/bus_rotate_';
    for (var i = 0; i < 24; i++)
    {
        var image00 = {
            url: pic_loc + (i < 10 ? '0' : '') + i + '.png',
            size: new google.maps.Size(bus_map_size[i], bus_map_size[i]),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(Math.floor(bus_map_size[i] / 2), Math.floor(bus_map_size[i] / 2))
        };
        bus_image_array_Icons.push(image00);
    }
    var timers_pic_loc = 'pic/thingy';
    for (var i = 1; i < 20; i++)
    {
        if (i == 4) continue;
        var image00 = {
            url: timers_pic_loc + (i < 10 ? '00' : '0') + i + '_alpha.png',
            size: new google.maps.Size(21, 21),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(10, 10)
        };
        bus_timers_array_Icons.push(image00);
    }
}

function do_continuous_work()
{
    myarr_lats = [];
    myarr_lons = [];
    myarr_secs = [];
    myarr_heading = [];
    fetch_ttc_data();
}

function clear_all_markers()
{
    for (var i = 0; i < all_markers.length; i++)
    {
        all_markers[i].setMap(null);
    }
    all_markers = [];
    for (var i = 0; i < all_markers_timers.length; i++)
    {
        all_markers_timers[i].setMap(null);
    }
    all_markers_timers = [];
}

function plot_results()
{
    clear_all_markers();
    var data = pagetext;
    readonce = true;
    var index_global = 0;
    myarr_lats = [];
    myarr_lons = [];
    myarr_secs = [];
    myarr_heading = [];
    while (true)
    {
        var temp_indx = data.indexOf("<vehicle", index_global);
        var finish_indx = data.indexOf("/>", temp_indx + 5);
        if (temp_indx == -1) break;
        try
        {
            helper_process_vehicle(data.substring(temp_indx, finish_indx));
        }
        catch (err)
        {}
        index_global += 5;
    }
    plot_ttc_data();
}

function fetch_ttc_data()
{
    read_document_if_needed();
}

function plot_ttc_data()
{
    for (var i = 0; i < myarr_lats.length; i++)
    {
        var temp_loc = new google.maps.LatLng(myarr_lats[i], myarr_lons[i]);
        var direction = Math.round(myarr_heading[i] / 15);
        if (direction < 0 || direction > 23) direction = 0;
        var marker_temp = new google.maps.Marker(
        {
            position: temp_loc,
            title: "",
            icon: bus_image_array_Icons[direction]
        });
        all_markers.push(marker_temp);
        marker_temp.setZIndex(50);
        marker_temp.setMap(map);
    }
    for (var i = 0; i < myarr_lats.length; i++)
    {
        var temp_loc = new google.maps.LatLng(myarr_lats[i], myarr_lons[i]);
        var secs_since = myarr_secs[i] - 1;
        if (secs_since < 0) secs_since = 0;
        if (secs_since > 18) secs_since = 18;
        var marker_temp = new google.maps.Marker(
        {
            position: temp_loc,
            title: "",
            icon: bus_timers_array_Icons[secs_since]
        });
        all_markers_timers.push(marker_temp);
        marker_temp.setZIndex(1000);
        marker_temp.setMap(map);
    }
    setTimeout(function()
    {
        do_continuous_work();
    }, (3 * 1000));
}

function read_document_if_needed()
{
    if (readonce)
    {
        $.get('http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=ttc&r=85', function(data)
        {
            $('.result').html(data);
            pagetext = "" + data;
            readonce = false;
            plot_results();
        }, "text");
    }
}

function helper_process_vehicle(vehiclestring)
{
    var ind_lat_1 = vehiclestring.indexOf('lat="');
    var ind_lat_2 = vehiclestring.indexOf('"', ind_lat_1 + 5);
    var lat = vehiclestring.substring(ind_lat_1 + 5, ind_lat_2);
    var ind_lon_1 = vehiclestring.indexOf('lon="');
    var ind_lon_2 = vehiclestring.indexOf('"', ind_lon_1 + 5);
    var lon = vehiclestring.substring(ind_lon_1 + 5, ind_lon_2);
    var ind_secs_1 = vehiclestring.indexOf('secsSinceReport="');
    var ind_secs_2 = vehiclestring.indexOf('"', ind_secs_1 + 17);
    var secs_since = vehiclestring.substring(ind_secs_1 + 17, ind_secs_2);
    var ind_heading_1 = vehiclestring.indexOf('heading="');
    var ind_heading_2 = vehiclestring.indexOf('"', ind_heading_1 + 9);
    var heading = vehiclestring.substring(ind_heading_1 + 9, ind_heading_2);
    myarr_lats.push(lat);
    myarr_lons.push(lon);
    myarr_secs.push(secs_since);
    if (heading > 359 || heading < 0) heading = 0;
    myarr_heading.push(heading);
}

function initialize()
{
    load_pics();
    var mapProp = {
        center: myCenter,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
    var marker = new google.maps.Marker(
    {
        position: myCenter,
    });
    var marker2 = new google.maps.Marker(
    {
        position: anothervehicle,
    });
    marker.setMap(map);
    setTimeout(function()
    {
        do_continuous_work();
    }, (3 * 100));
}

google.maps.event.addDomListener(window, 'load', initialize);